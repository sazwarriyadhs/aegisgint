# D:\AegisGeoInt\ai-engine\Dockerfile

# Base image with CUDA support
FROM nvidia/cuda:12.1.0-cudnn8-runtime-ubuntu22.04 AS base

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    DEBIAN_FRONTEND=noninteractive

# Install system dependencies
RUN apt-get update && apt-get install -y \
    python3.10 \
    python3-pip \
    python3.10-dev \
    python3-venv \
    git \
    wget \
    curl \
    unzip \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    libgdal-dev \
    gdal-bin \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Create symbolic links (2 baris terpisah, no backtick)
RUN ln -sf /usr/bin/python3.10 /usr/bin/python || true
RUN ln -sf /usr/bin/python3.10 /usr/bin/python3 || true

# Set working directory
WORKDIR /app

# Copy requirements and install Python packages
COPY requirements.txt .
RUN pip3 install --no-cache-dir --upgrade pip && \
    pip3 install --no-cache-dir -r requirements.txt

# Install additional packages for geospatial
RUN pip3 install --no-cache-dir \
    geopandas \
    rasterio \
    folium \
    geopy \
    shapely \
    fiona \
    pyproj

# Install PyTorch with CUDA support (if GPU available)
RUN pip3 install --no-cache-dir \
    torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p models/pretrained models/trained data logs uploads

# Set permissions
RUN chmod +x main.py

# Expose ports
EXPOSE 8000 5001 5002

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Run the application
CMD ["python3", "main.py"]
