"""
FastAPI endpoints for image classification
"""

import time
from fastapi import APIRouter, File, UploadFile, HTTPException, status
from src.api.schemas import ImageClassificationResponse, ErrorResponse
from src.pipelines.inference_pipeline import ImageInference

router = APIRouter()

# Initialize inference engine (loaded once at startup)
try:
    image_engine = ImageInference()
    print("✓ Image classification engine loaded successfully")
except Exception as e:
    print(f"⚠️  Image classification engine not loaded: {e}")
    print("   This is expected before training the image model")
    image_engine = None


@router.post(
    "/classify-image",
    response_model=ImageClassificationResponse,
    responses={
        400: {"model": ErrorResponse},
        500: {"model": ErrorResponse},
        503: {"model": ErrorResponse}
    },
    summary="Classify cervical cell image",
    description="Classify cervical cell pap smear image using deep learning (ResNet50/EfficientNet)"
)
async def classify_image(image: UploadFile = File(..., description="Image file (JPG/PNG, max 5MB)")):
    """
    Classify a cervical cell image
    
    - **Accepts**: JPG, PNG, BMP formats
    - **Max size**: 5MB
    - **Returns**: Cell type classification, confidence score, and Bethesda category
    - **Processing time**: ~50-200ms
    """
    if image_engine is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Image classification model not loaded. Please train the model first after SIPaKMeD dataset download completes."
        )
    
    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/bmp"]
    if image.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed types: {', '.join(allowed_types)}"
        )
    
    # Validate file size (5MB max)
    MAX_SIZE = 5 * 1024 * 1024  # 5MB
    contents = await image.read()
    if len(contents) > MAX_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Maximum size: {MAX_SIZE / (1024*1024):.1f}MB"
        )
    
    try:
        start_time = time.time()
        
        # Predict
        result = image_engine.predict_from_bytes(contents)
        
        # Calculate processing time
        processing_time = (time.time() - start_time) * 1000  # Convert to ms
        
        return ImageClassificationResponse(
            success=True,
            prediction=result,
            processing_time_ms=processing_time
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error during classification: {str(e)}"
        )
