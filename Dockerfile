# Stage 1: Build the frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend
# Copy package.json and package-lock.json (if it exists)
COPY frontend/package*.json ./
# Install dependencies
RUN npm ci

# Copy the rest of the frontend code
COPY frontend/ ./
# Build the frontend
RUN npm run build

# Stage 2: Build Python wheels
FROM python:3.11-alpine AS backend-builder

WORKDIR /app
# Install build dependencies
RUN apk add --no-cache --virtual .build-deps gcc musl-dev python3-dev libffi-dev openssl-dev cargo

# Copy requirements file
COPY backend/requirements.txt .
# Download and build wheels
RUN pip wheel --no-cache-dir --wheel-dir=/app/wheels -r requirements.txt

# Stage 3: Final lightweight image
FROM python:3.11-alpine

WORKDIR /app

# Install runtime dependencies only (no dev packages)
RUN apk add --no-cache tini \
    && rm -rf /var/cache/apk/*

# Copy wheels from backend-builder and install them
COPY --from=backend-builder /app/wheels /app/wheels
RUN pip install --no-cache-dir --no-index --find-links=/app/wheels/ $(find /app/wheels -name "*.whl") \
    && rm -rf /app/wheels \
    && find /usr/local -name '*.pyc' -delete \
    && find /usr/local -name '__pycache__' -delete \
    && rm -rf /root/.cache

# Copy backend code - only copy what's needed
COPY backend/ /app/backend/

# Copy built frontend from frontend-builder to the static directory
COPY --from=frontend-builder /app/frontend/dist/ /app/backend/static/

# Set working directory to the backend
WORKDIR /app/backend

# Use tini as init process
ENTRYPOINT ["/sbin/tini", "--"]

# Run the FastAPI application
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8081"]

# Expose the port
EXPOSE 8081
