"""
Pydantic schemas for CervCareAI API
Defines request and response models for validation
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional


# ============================================================================
# Risk Prediction Schemas
# ============================================================================

class RiskPredictionRequest(BaseModel):
    """Request model for risk prediction"""
    
    # Demographics
    age: int = Field(..., description="Patient age", ge=0, le=120)
    
    # Sexual history
    number_of_sexual_partners: int = Field(..., description="Number of sexual partners", ge=0)
    first_sexual_intercourse: int = Field(..., description="Age at first sexual intercourse", ge=0, le=50)
    num_of_pregnancies: int = Field(..., description="Number of pregnancies", ge=0)
    
    # Lifestyle
    smokes: int = Field(..., description="Whether patient smokes (0=No, 1=Yes)", ge=0, le=1)
    smokes_years: Optional[float] = Field(0.0, description="Years of smoking")
    smokes_packs_per_year: Optional[float] = Field(0.0, description="Packs per year")
    
    # Contraception
    hormonal_contraceptives: int = Field(..., description="Uses hormonal contraceptives (0=No, 1=Yes)", ge=0, le=1)
    hormonal_contraceptives_years: Optional[float] = Field(0.0, description="Years of hormonal contraceptive use")
    iud: int = Field(..., description="Uses IUD (0=No, 1=Yes)", ge=0, le=1)
    iud_years: Optional[float] = Field(0.0, description="Years of IUD use")
    
    # STD history
    stds: int = Field(..., description="History of STDs (0=No, 1=Yes)", ge=0, le=1)
    stds_number: Optional[int] = Field(0, description="Number of STD diagnoses", ge=0)
    
    # HPV and other specific STDs
    stds_condylomatosis: Optional[int] = Field(0, description="History of condylomatosis (0=No, 1=Yes)", ge=0, le=1)
    stds_cervical_condylomatosis: Optional[int] = Field(0, description="Cervical condylomatosis (0=No, 1=Yes)", ge=0, le=1)
    stds_vaginal_condylomatosis: Optional[int] = Field(0, description="Vaginal condylomatosis (0=No, 1=Yes)", ge=0, le=1)
    stds_vulvo_perineal_condylomatosis: Optional[int] = Field(0, description="Vulvo-perineal condylomatosis (0=No, 1=Yes)", ge=0, le=1)
    stds_syphilis: Optional[int] = Field(0, description="History of syphilis (0=No, 1=Yes)", ge=0, le=1)
    stds_pelvic_inflammatory_disease: Optional[int] = Field(0, description="Pelvic inflammatory disease (0=No, 1=Yes)", ge=0, le=1)
    stds_genital_herpes: Optional[int] = Field(0, description="Genital herpes (0=No, 1=Yes)", ge=0, le=1)
    stds_molluscum_contagiosum: Optional[int] = Field(0, description="Molluscum contagiosum (0=No, 1=Yes)", ge=0, le=1)
    stds_aids: Optional[int] = Field(0, description="AIDS diagnosis (0=No, 1=Yes)", ge=0, le=1)
    stds_hiv: Optional[int] = Field(0, description="HIV positive (0=No, 1=Yes)", ge=0, le=1)
    stds_hepatitis_b: Optional[int] = Field(0, description="Hepatitis B (0=No, 1=Yes)", ge=0, le=1)
    stds_hpv: Optional[int] = Field(0, description="HPV diagnosed (0=No, 1=Yes)", ge=0, le=1)
    
    # Diagnostic history  
    dx_cancer: Optional[int] = Field(0, description="Previous cancer diagnosis (0=No, 1=Yes)", ge=0, le=1)
    dx_cin: Optional[int] = Field(0, description="CIN diagnosis (0=No, 1=Yes)", ge=0, le=1)
    dx_hpv: Optional[int] = Field(0, description="HPV diagnosis (0=No, 1=Yes)", ge=0, le=1)
    dx: Optional[int] = Field(0, description="Any diagnosis (0=No, 1=Yes)", ge=0, le=1)
    
    class Config:
        json_schema_extra = {
            "example": {
                "age": 35,
                "number_of_sexual_partners": 2,
                "first_sexual_intercourse": 18,
                "num_of_pregnancies": 2,
                "smokes": 0,
                "smokes_years": 0.0,
                "smokes_packs_per_year": 0.0,
                "hormonal_contraceptives": 1,
                "hormonal_contraceptives_years": 5.0,
                "iud": 0,
                "iud_years": 0.0,
                "stds": 0,
                "stds_number": 0
            }
        }


class ContributingFactor(BaseModel):
    """Model for a contributing factor"""
    factor: str
    importance: float
    patient_value: Any


class RiskPredictionResponse(BaseModel):
    """Response model for risk prediction"""
    success: bool = True
    risk_assessment: Dict[str, Any] = Field(..., description="Risk assessment results")
    processing_time_ms: float = Field(..., description="Processing time in milliseconds")
    
    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "risk_assessment": {
                    "risk_score": 0.23,
                    "risk_category": "Low",
                    "risk_percentage": 23.0,
                    "recommendation": "Regular screening recommended. Next screening in 3 years.",
                    "contributing_factors": [
                        {"factor": "Age", "importance": 0.35, "patient_value": 35},
                        {"factor": "Hormonal contraceptives", "importance": 0.18, "patient_value": 1}
                    ]
                },
                "processing_time_ms": 12.5
            }
        }


# ============================================================================
# Image Classification Schemas
# ============================================================================

class ImageClassificationResponse(BaseModel):
    """Response model for image classification"""
    success: bool = True
    prediction: Dict[str, Any] = Field(..., description="Classification results")
    processing_time_ms: float = Field(..., description="Processing time in milliseconds")
    
    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "prediction": {
                    "class": "Dyskeratotic",
                    "confidence": 0.94,
                    "probabilities": {
                        "Dyskeratotic": 0.94,
                        "Koilocytotic": 0.03,
                        "Metaplastic": 0.01,
                        "Parabasal": 0.01,
                        "Superficial-Intermediate": 0.01
                    },
                    "recommendation": "Abnormal cells detected. Further investigation recommended.",
                    "bethesda_category": "ASC-US/LSIL"
                },
                "processing_time_ms": 87.3
            }
        }


# ============================================================================
# Error Response Schema
# ============================================================================

class ErrorResponse(BaseModel):
    """Response model for errors"""
    success: bool = False
    error: str = Field(..., description="Error message")
    detail: Optional[str] = Field(None, description="Detailed error information")
