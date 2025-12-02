# Multi-stage Dockerfile for CervCareAI ML Backend
FROM python:3.10-slim as base

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements-prod.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements-prod.txt

# Copy source code
COPY src/ ./src/
COPY models/ ./models/
COPY cervcareai_data/raw/ ./cervcareai_data/raw/

# Expose ports
EXPOSE 8000
EXPOSE 5000

# Set environment variables
ENV PYTHONPATH=/app
ENV MLFLOW_TRACKING_URI=file:///app/mlruns

# Command to run FastAPI
CMD ["uvicorn", "src.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
