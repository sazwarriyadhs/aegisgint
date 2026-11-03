#!/usr/bin/env python3
"""
AEGIS Telemetry Simulator - WebSocket Server
Broadcast drone telemetry to backend via ws://0.0.0.0:8765
"""
import asyncio
import json
import random
import math
from datetime import datetime

try:
    import websockets
except ImportError:
    print("[X] Install websockets: pip install websockets")
    exit(1)

# ============ CONFIG (loaded from config.yaml conceptually) ============
UPDATE_INTERVAL = 1.0
NUM_DRONES = 8
WS_PORT = 8765
WS_HOST = "0.0.0.0"

NAMES = ['ALPHA', 'BRAVO', 'CHARLIE', 'DELTA', 'ECHO', 'FOXTROT', 'GOLF', 'HOTEL']
MISSIONS = ['BORDER_PATROL', 'FOREST_PATROL', 'COASTAL_PATROL', 'SEARCH_RESCUE',
            'SURVEILLANCE', 'RECON', 'ESCORT', 'INTERDICTION']

ROUTES = [
    [(-2.5, 140.5), (-2.7, 140.8), (-3.0, 141.0), (-3.2, 140.7), (-3.0, 140.3), (-2.7, 140.2)],
    [(-2.8, 139.8), (-3.0, 139.5), (-3.2, 139.7), (-3.0, 140.0)],
    [(-2.5, 141.0), (-2.3, 141.2), (-2.0, 141.5), (-2.2, 141.8)],
    [(-2.6, 140.0), (-2.8, 140.3), (-2.5, 140.5), (-2.3, 140.2)],
    [(-2.4, 140.7), (-2.6, 140.9), (-2.8, 140.6), (-2.6, 140.4)],
    [(-3.1, 139.6), (-3.3, 139.9), (-3.5, 139.7), (-3.3, 139.4)],
    [(-2.9, 140.8), (-3.1, 141.1), (-3.3, 140.9), (-3.1, 140.6)],
    [(-2.7, 139.5), (-2.9, 139.8), (-3.1, 139.6), (-2.9, 139.3)]
]


class DroneSimulator:
    def __init__(self):
        self.drones = []
        self.clients = set()
        self.init_drones()

    def init_drones(self):
        for i in range(NUM_DRONES):
            self.drones.append({
                'id': f'DRN-{i+1:03d}',
                'name': f'DRONE {i+1:02d} - {NAMES[i]}',
                'model': 'DJI M30T' if i % 2 == 0 else 'DJI M300',
                'lat': ROUTES[i][0][0],
                'lng': ROUTES[i][0][1],
                'alt': random.randint(50, 250),
                'speed': random.randint(15, 35),
                'heading': random.randint(0, 360),
                'battery': random.randint(85, 100),
                'signal': random.randint(60, 100),
                'mission': MISSIONS[i],
                'status': 'ACTIVE',
                'threatLevel': 'LOW',
                'sector': NAMES[i].lower(),
                'route': ROUTES[i],
                'route_idx': 0,
                'route_progress': random.random(),
            })

    def update(self):
        for drone in self.drones:
            route = drone['route']
            idx = drone['route_idx']
            progress = drone['route_progress'] + 0.02

            if progress >= 1.0:
                progress = 0
                idx = (idx + 1) % len(route)

            current = route[idx]
            next_pt = route[(idx + 1) % len(route)]

            drone['lat'] = current[0] + (next_pt[0] - current[0]) * progress
            drone['lng'] = current[1] + (next_pt[1] - current[1]) * progress
            drone['route_idx'] = idx
            drone['route_progress'] = progress

            drone['battery'] -= 0.005
            drone['alt'] += (random.random() - 0.5) * 3
            drone['heading'] = (drone['heading'] + (random.random() - 0.5) * 10) % 360
            drone['speed'] = max(10, min(40, drone['speed'] + (random.random() - 0.5) * 2))

            # Recharge otomatis kalau < 30 (simulasi drone balik ke charger)
            if drone['battery'] < 30:
                drone['battery'] += 0.5
            
            # Clamp battery 0-100
            drone['battery'] = max(0, min(100, drone['battery']))
            
            if drone['battery'] < 15:
                drone['status'] = 'CRITICAL'
            elif drone['battery'] < 30:
                drone['status'] = 'WARNING'
            elif drone['battery'] < 50:
                drone['status'] = 'RETURNING'
            else:
                drone['status'] = 'ACTIVE'

    def serialize_drones(self):
        """Strip internal route fields before sending."""
        return [{k: v for k, v in d.items() if k not in ('route', 'route_idx', 'route_progress')}
                for d in self.drones]

    async def broadcast(self, message):
        if not self.clients:
            return
        data = json.dumps(message)
        await asyncio.gather(*[c.send(data) for c in self.clients], return_exceptions=True)

    async def handler(self, websocket):
        self.clients.add(websocket)
        peer = getattr(websocket, 'remote_address', ('?', 0))
        print(f'[OK] Client connected ({len(self.clients)} total) from {peer}')
        try:
            await websocket.send(json.dumps({
                'type': 'init',
                'drones': self.serialize_drones()
            }))
            async for _ in websocket:
                pass
        except websockets.exceptions.ConnectionClosed:
            pass
        finally:
            self.clients.discard(websocket)
            print(f'[X] Client disconnected ({len(self.clients)} total)')

    async def broadcast_loop(self):
        tick = 0
        while True:
            self.update()
            await self.broadcast({
                'type': 'telemetry',
                'drones': self.serialize_drones()
            })
            tick += 1
            if tick % 5 == 0:
                print(f'[WS] [{datetime.now().strftime("%H:%M:%S")}] broadcast → {len(self.clients)} clients | {len(self.drones)} drones')
            await asyncio.sleep(UPDATE_INTERVAL)

    async def run(self):
        print('=' * 60)
        print('[DRONE] AEGIS TELEMETRY SIMULATOR (WebSocket)')
        print('=' * 60)
        print(f'[DRONE] Drones:   {len(self.drones)}')
        print(f'[NET] WebSocket: ws://{WS_HOST}:{WS_PORT}')
        print(f'[LOOP] Update:    every {UPDATE_INTERVAL}s')
        print('=' * 60)
        print('')
        async with websockets.serve(self.handler, WS_HOST, WS_PORT):
            await self.broadcast_loop()


if __name__ == '__main__':
    sim = DroneSimulator()
    try:
        asyncio.run(sim.run())
    except KeyboardInterrupt:
        print('\n[STOP] Simulator stopped!')



