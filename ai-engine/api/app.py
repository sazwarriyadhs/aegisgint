"""
AEGIS AI Engine - FastAPI
Enhanced Detection: Crowd + Weapon Simulation
"""
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pathlib import Path
from datetime import datetime
import io
import time
import logging
import math
import numpy as np
import cv2
from PIL import Image

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="AEGIS AI Engine", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).parent.parent
CAPTURE_DIR = BASE_DIR / "uploads" / "captures"
THERMAL_DIR = BASE_DIR / "uploads" / "thermal"
for d in [CAPTURE_DIR, THERMAL_DIR]:
    d.mkdir(parents=True, exist_ok=True)

# ============ YOLO LOAD ============
_yolo = None
def get_yolo():
    global _yolo
    if _yolo is None:
        try:
            from ultralytics import YOLO
            # PAKAI yolov8s (lebih akurat dari nano)
            _yolo = YOLO('yolov8s.pt')
            logger.info("[YOLO] yolov8s loaded")
        except Exception as e:
            logger.error(f"[YOLO] load failed: {e}")
            _yolo = False
    return _yolo if _yolo else None

# ============ HELPERS ============
def cluster_boxes(boxes, threshold=50):
    """
    Kelompokkan bounding box yang berdekatan jadi cluster (gerombolan).
    """
    if len(boxes) == 0:
        return []
    
    clusters = []
    used = [False] * len(boxes)
    
    for i, b1 in enumerate(boxes):
        if used[i]:
            continue
        
        cx1 = (b1['bbox'][0] + b1['bbox'][2]) / 2
        cy1 = (b1['bbox'][1] + b1['bbox'][3]) / 2
        
        cluster = [i]
        used[i] = True
        
        for j, b2 in enumerate(boxes):
            if used[j]:
                continue
            
            cx2 = (b2['bbox'][0] + b2['bbox'][2]) / 2
            cy2 = (b2['bbox'][1] + b2['bbox'][3]) / 2
            
            dist = math.sqrt((cx1 - cx2)**2 + (cy1 - cy2)**2)
            if dist < threshold:
                cluster.append(j)
                used[j] = True
        
        clusters.append(cluster)
    
    return clusters


def simulate_weapons(person_objects):
    """
    Simulasi deteksi senjata: setiap person confidence > 0.7 di-mark 'armed'.
    Ini SIMULASI — bukan deteksi senjata real.
    """
    armed_count = 0
    for obj in person_objects:
        # Simulasi: 70% person 'armed' kalau confidence > 0.6
        if obj['confidence'] > 0.6 and np.random.random() < 0.7:
            obj['armed'] = True
            obj['weapon_type'] = np.random.choice(['rifle', 'handgun', 'machete'])
            obj['weapon_confidence'] = round(np.random.uniform(0.75, 0.95), 2)
            armed_count += 1
        else:
            obj['armed'] = False
    return armed_count


def draw_detections(img_array, objects, clusters):
    """Draw bounding box + cluster highlight."""
    annotated = img_array.copy()
    h, w = annotated.shape[:2]
    
    # Draw per-object
    for obj in objects:
        x1, y1, x2, y2 = [int(x) for x in obj['bbox']]
        color = (0, 255, 0) if obj.get('armed') else (0, 200, 255)
        cv2.rectangle(annotated, (x1, y1), (x2, y2), color, 2)
        
        label = f"{obj['class']} {obj['confidence']:.2f}"
        if obj.get('armed'):
            label += f" [{obj['weapon_type']}]"
        cv2.putText(annotated, label, (x1, max(y1 - 5, 15)),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 1)
    
    # Draw cluster outline
    for ci, cluster in enumerate(clusters):
        if len(cluster) < 3:
            continue
        xs = []
        ys = []
        for idx in cluster:
            x1, y1, x2, y2 = objects[idx]['bbox']
            xs.extend([x1, x2])
            ys.extend([y1, y2])
        
        cx1, cx2 = int(min(xs)), int(max(xs))
        cy1, cy2 = int(min(ys)), int(max(ys))
        
        # Big red rectangle for cluster
        cv2.rectangle(annotated, (cx1-10, cy1-10), (cx2+10, cy2+10), (0, 0, 255), 3)
        cv2.putText(annotated, f"CROWD {len(cluster)}", (cx1, max(cy1 - 20, 30)),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
    
    # Summary
    summary = f"Total: {len(objects)} | Armed: {sum(1 for o in objects if o.get('armed'))} | Clusters: {len([c for c in clusters if len(c) >= 3])}"
    cv2.putText(annotated, summary, (10, h - 10),
                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
    
    return annotated


# ============ ENDPOINTS ============
@app.get("/")
def root():
    return {"status": "online", "service": "aegis-ai-engine", "version": "2.0.0"}

@app.get("/health")
def health():
    yolo = get_yolo()
    return {
        "status": "healthy",
        "yolo_loaded": yolo is not None,
        "model": "yolov8s" if yolo else "none",
        "timestamp": datetime.now().isoformat()
    }

@app.post("/detect/movement")
async def detect_movement(
    file: UploadFile = File(...),
    confidence: float = Form(0.25),
    save_capture: bool = Form(True),
    crowd_threshold: int = Form(50)
):
    start = time.time()
    yolo = get_yolo()
    if not yolo:
        return JSONResponse({"success": False, "error": "YOLO not loaded"}, status_code=503)
    
    contents = await file.read()
    image = Image.open(io.BytesIO(contents)).convert('RGB')
    img_array = np.array(image)
    h, w = img_array.shape[:2]
    
    # YOLO detect
    results = yolo(img_array, conf=confidence, imgsz=1280, verbose=False)
    
    objects = []
    for r in results:
        for box in r.boxes:
            x1, y1, x2, y2 = [float(x) for x in box.xyxy[0].tolist()]
            objects.append({
                'class': yolo.names[int(box.cls)],
                'confidence': round(float(box.conf), 3),
                'bbox': [round(x1,1), round(y1,1), round(x2,1), round(y2,1)]
            })
    
    # Filter person only untuk crowd analysis
    person_objects = [o for o in objects if o['class'] == 'person']
    
    # Simulasi weapon detection
    armed_count = simulate_weapons(person_objects)
    
    # Cluster analysis
    clusters = cluster_boxes(person_objects, threshold=crowd_threshold)
    crowd_clusters = [c for c in clusters if len(c) >= 3]
    
    # Save capture
    capture_path = None
    if save_capture and objects:
        ts = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
        capture_path = CAPTURE_DIR / f"movement_{ts}.jpg"
        
        annotated = draw_detections(img_array, objects, clusters)
        cv2.imwrite(str(capture_path), cv2.cvtColor(annotated, cv2.COLOR_RGB2BGR))
    
    return {
        "success": True,
        "movement_detected": len(objects) > 0,
        "objects": objects,
        "count": len(objects),
        "person_count": len(person_objects),
        "armed_count": armed_count,
        "crowd_analysis": {
            "total_clusters": len(crowd_clusters),
            "largest_cluster": max([len(c) for c in crowd_clusters]) if crowd_clusters else 0,
            "clusters": [{"size": len(c), "indices": c} for c in crowd_clusters]
        },
        "frame_size": [w, h],
        "processing_ms": int((time.time() - start) * 1000),
        "capture_path": str(capture_path) if capture_path else None,
        "timestamp": datetime.now().isoformat()
    }

@app.post("/detect/thermal")
async def detect_thermal(
    file: UploadFile = File(...),
    ambient_temp: float = Form(28.0),
    anomaly_threshold: float = Form(38.0)
):
    start = time.time()
    yolo = get_yolo()
    
    contents = await file.read()
    image = Image.open(io.BytesIO(contents)).convert('RGB')
    img_array = np.array(image)
    
    objects = []
    if yolo:
        results = yolo(img_array, conf=0.3, imgsz=1280, verbose=False)
        for r in results:
            for box in r.boxes:
                x1, y1, x2, y2 = [int(x) for x in box.xyxy[0].tolist()]
                cls = yolo.names[int(box.cls)]
                if cls == 'person':
                    min_t = ambient_temp + np.random.uniform(4, 7)
                    max_t = ambient_temp + np.random.uniform(9, 15)
                else:
                    min_t = ambient_temp + np.random.uniform(-2, 2)
                    max_t = min_t + np.random.uniform(1, 3)
                avg_t = (min_t + max_t) / 2
                objects.append({
                    "class": cls,
                    "confidence": round(float(box.conf), 3),
                    "bbox": [x1, y1, x2, y2],
                    "temperature": {"min": round(float(min_t),1), "max": round(float(max_t),1), "avg": round(float(avg_t),1), "unit": "°C"},
                    "is_anomaly": bool(avg_t > anomaly_threshold)
                })
    
    ts = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
    thermal_path = THERMAL_DIR / f"thermal_{ts}.jpg"
    try:
        gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
        cv2.imwrite(str(thermal_path), cv2.applyColorMap(gray, cv2.COLORMAP_JET))
    except Exception as e:
        logger.error(f"Thermal save failed: {e}")
    
    return {
        "success": True,
        "mode": "simulation",
        "ambient_temp": ambient_temp,
        "objects": objects,
        "count": len(objects),
        "person_count": len([o for o in objects if o['class'] == 'person']),
        "anomalies": len([o for o in objects if o["is_anomaly"]]),
        "thermal_image": str(thermal_path),
        "processing_ms": int((time.time() - start) * 1000),
        "timestamp": datetime.now().isoformat()
    }

@app.get("/history")
def get_history(limit: int = 20):
    try:
        files = sorted(CAPTURE_DIR.glob("*.jpg"), key=lambda f: f.stat().st_mtime, reverse=True)[:limit]
        return {
            "success": True,
            "count": len(files),
            "captures": [
                {"filename": f.name, "size_kb": round(f.stat().st_size/1024, 1), "modified": datetime.fromtimestamp(f.stat().st_mtime).isoformat()}
                for f in files
            ]
        }
    except Exception as e:
        return {"success": False, "error": str(e), "captures": []}
