# D:\AegisGeoInt\backend\Dockerfile

# Base image
FROM node:18-alpine

# Install system dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    postgresql-dev \
    curl

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci && \
    npm cache clean --force

# Copy application code
COPY . .

# Create directories
RUN mkdir -p uploads logs temp

# Expose ports
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

# Run the application
CMD ["npm", "start"]