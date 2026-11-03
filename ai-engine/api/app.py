"""
AEGIS AI Engine - FastAPI
Movement Detection + Object Capture + Thermal Simulation
"""
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pathlib import Path
from datetime import datetime
import io
import time
import logging
import numpy as np
import cv2
from PIL import Image

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="AEGIS AI Engine", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Directories (BASE_DIR = /app, karena main.py di /app)
BASE_DIR = Path(__file__).parent.parent
CAPTURE_DIR = BASE_DIR / "uploads" / "captures"
THERMAL_DIR = BASE_DIR / "uploads" / "thermal"
for d in [CAPTURE_DIR, THERMAL_DIR]:
    d.mkdir(parents=True, exist_ok=True)

# YOLO lazy load
_yolo = None
def get_yolo():
    global _yolo
    if _yolo is None:
        try:
            from ultralytics import YOLO
            _yolo = YOLO('yolov8n.pt')
            logger.info("[YOLO] yolov8n loaded")
        except Exception as e:
            logger.error(f"[YOLO] load failed: {e}")
            _yolo = False
    return _yolo if _yolo else None

# ============ HEALTH ============
@app.get("/")
def root():
    return {"status": "online", "service": "aegis-ai-engine", "version": "1.0.0"}

@app.get("/health")
def health():
    yolo = get_yolo()
    return {
        "status": "healthy",
        "yolo_loaded": yolo is not None,
        "timestamp": datetime.now().isoformat()
    }

# ============ MOVEMENT DETECTION ============
@app.post("/detect/movement")
async def detect_movement(
    file: UploadFile = File(...),
    confidence: float = Form(0.5),
    save_capture: bool = Form(True)
):
    start = time.time()
    yolo = get_yolo()
    if not yolo:
        return JSONResponse({"success": False, "error": "YOLO not loaded"}, status_code=503)
    
    contents = await file.read()
    image = Image.open(io.BytesIO(contents)).convert('RGB')
    img_array = np.array(image)
    h, w = img_array.shape[:2]
    
    results = yolo(img_array, conf=confidence, verbose=False)
    objects = []
    for r in results:
        for box in r.boxes:
            x1, y1, x2, y2 = [float(x) for x in box.xyxy[0].tolist()]
            objects.append({
                "class": yolo.names[int(box.cls)],
                "confidence": round(float(box.conf), 3),
                "bbox": [round(x1,1), round(y1,1), round(x2,1), round(y2,1)]
            })
    
    capture_path = None
    if save_capture and objects:
        ts_str = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
        capture_path = CAPTURE_DIR / f"movement_{ts_str}.jpg"
        annotated = img_array.copy()
        for obj in objects:
            x1, y1, x2, y2 = [int(x) for x in obj["bbox"]]
            cv2.rectangle(annotated, (x1,y1), (x2,y2), (0,255,0), 2)
        cv2.imwrite(str(capture_path), cv2.cvtColor(annotated, cv2.COLOR_RGB2BGR))
    
    return {
        "success": True,
        "movement_detected": len(objects) > 0,
        "objects": objects,
        "count": len(objects),
        "frame_size": [w, h],
        "processing_ms": int((time.time() - start) * 1000),
        "capture_path": str(capture_path) if capture_path else None,
        "timestamp": datetime.now().isoformat()
    }

# ============ THERMAL ============
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
        results = yolo(img_array, conf=0.5, verbose=False)
        for r in results:
            for box in r.boxes:
                x1, y1, x2, y2 = [int(x) for x in box.xyxy[0].tolist()]
                cls = yolo.names[int(box.cls)]
                if cls in ('person', 'car', 'truck'):
                    min_t = ambient_temp + np.random.uniform(2, 5)
                    max_t = ambient_temp + np.random.uniform(5, 12)
                else:
                    min_t = ambient_temp + np.random.uniform(-2, 2)
                    max_t = min_t + np.random.uniform(1, 3)
                avg_t = (min_t + max_t) / 2
                objects.append({
                    "class": cls,
                    "confidence": round(float(box.conf), 3),
                    "bbox": [x1, y1, x2, y2],
                    "temperature": {
                        "min": round(float(min_t),1),
                        "max": round(float(max_t),1),
                        "avg": round(float(avg_t),1),
                        "unit": "°C"
                    },
                    "is_anomaly": bool(avg_t > anomaly_threshold)
                })
    
    ts_str = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
    thermal_path = THERMAL_DIR / f"thermal_{ts_str}.jpg"
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
        "anomalies": len([o for o in objects if o["is_anomaly"]]),
        "thermal_image": str(thermal_path),
        "processing_ms": int((time.time() - start) * 1000),
        "timestamp": datetime.now().isoformat()
    }

# ============ HISTORY ============
@app.get("/history")
def get_history(limit: int = 20):
    try:
        files = sorted(CAPTURE_DIR.glob("*.jpg"), key=lambda f: f.stat().st_mtime, reverse=True)[:limit]
        return {
            "success": True,
            "count": len(files),
            "captures": [
                {
                    "filename": f.name,
                    "size_kb": round(f.stat().st_size/1024, 1),
                    "modified": datetime.fromtimestamp(f.stat().st_mtime).isoformat()
                }
                for f in files
            ]
        }
    except Exception as e:
        return {"success": False, "error": str(e), "captures": []}
