"""
AEGIS AI Engine - Main Entry
Start FastAPI server via uvicorn
"""
import sys
import logging
from pathlib import Path

BASE_DIR = Path(__file__).parent
sys.path.insert(0, str(BASE_DIR))
sys.path.insert(0, str(BASE_DIR / "api"))

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

if __name__ == "__main__":
    import uvicorn
    from app import app
    
    logger.info("=" * 60)
    logger.info("AEGIS AI ENGINE - FastAPI")
    logger.info("=" * 60)
    logger.info("API: http://0.0.0.0:8000")
    logger.info("Health: http://0.0.0.0:8000/health")
    logger.info("Docs: http://0.0.0.0:8000/docs")
    logger.info("=" * 60)
    
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
