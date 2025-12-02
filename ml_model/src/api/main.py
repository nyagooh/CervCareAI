"""
Main FastAPI Application for CervCareAI ML Backend
Serves both risk prediction and image classification models
"""

from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn

from src.api.endpoints import predict, classify

# Create FastAPI app
app = FastAPI(
    title="CervCareAI ML API",
    description="Machine Learning API for cervical cancer risk prediction and cell image classification",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Next.js dev server
        "http://127.0.0.1:3000",
        # Add your production frontend URL here
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(
    predict.router,
    prefix="/api/v1",
    tags=["Risk Prediction"]
)

app.include_router(
    classify.router,
    prefix="/api/v1",
    tags=["Image Classification"]
)


# Health check endpoint
@app.get(
    "/health",
    tags=["Health"],
    summary="Health check",
    description="Check if the API is running and models are loaded"
)
async def health_check():
    """Health check endpoint"""
    
    # Check model status
    risk_model_loaded = predict.risk_engine is not None
    image_model_loaded = classify.image_engine is not None
    
    return {
        "status": "healthy",
        "service": "CervCareAI ML API",
        "version": "1.0.0",
        "models": {
            "risk_prediction": {
                "loaded": risk_model_loaded,
                "status": "ready" if risk_model_loaded else "not_trained"
            },
            "image_classification": {
                "loaded": image_model_loaded,
                "status": "ready" if image_model_loaded else "not_trained"
            }
        }
    }


# Root endpoint
@app.get("/", tags=["Root"])
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Welcome to CervCareAI ML API",
        "version": "1.0.0",
        "documentation": "/docs",
        "health": "/health",
        "endpoints": {
            "risk_prediction": "/api/v1/predict-risk",
            "image_classification": "/api/v1/classify-image"
        }
    }


# Error handler for unhandled exceptions
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler"""
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error": "Internal server error",
            "detail": str(exc)
        }
    )


# Startup event
@app.on_event("startup")
async def startup_event():
    """Actions to perform on startup"""
    print("\n" + "="*70)
    print("CERVCAREAI ML API STARTING")
    print("="*70)
    print(f"  Documentation: http://localhost:8000/docs")
    print(f"  Health check:  http://localhost:8000/health")
    print("="*70 + "\n")


# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """Actions to perform on shutdown"""
    print("\nCervCareAI ML API shutting down...")


if __name__ == "__main__":
    # Run the server
    uvicorn.run(
        "src.api.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,  # Enable auto-reload during development
        log_level="info"
    )
