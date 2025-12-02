"""
FastAPI endpoints for risk prediction
"""

import time
from fastapi import APIRouter, HTTPException, status
from src.api.schemas import RiskPredictionRequest, RiskPredictionResponse, ErrorResponse
from src.pipelines.inference_pipeline import RiskInference

router = APIRouter()

# Initialize inference engine (loaded once at startup)
try:
    risk_engine = RiskInference()
    print("✓ Risk prediction engine loaded successfully")
except Exception as e:
    print(f"⚠️  Risk prediction engine not loaded: {e}")
    risk_engine = None


@router.post(
    "/predict-risk",
    response_model=RiskPredictionResponse,
    responses={
        500: {"model": ErrorResponse},
        503: {"model": ErrorResponse}
    },
    summary="Predict cervical cancer risk",
    description="Predict cervical cancer risk based on patient clinical data using XGBoost model"
)
async def predict_risk(request: RiskPredictionRequest):
    """
    Predict cervical cancer risk from patient data
    
    - **Returns**: Risk score (0-1), category (Low/Medium/High), and recommendations
    - **Processing time**: ~10-50ms
    """
    if risk_engine is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Risk prediction model not loaded. Please train the model first."
        )
    
    try:
        start_time = time.time()
        
        # Convert request to dictionary
        patient_data = request.dict()
        
        # Predict
        result = risk_engine.predict(patient_data)
        
        # Calculate processing time
        processing_time = (time.time() - start_time) * 1000  # Convert to ms
        
        return RiskPredictionResponse(
            success=True,
            risk_assessment=result,
            processing_time_ms=processing_time
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error during prediction: {str(e)}"
        )
