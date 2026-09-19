from pydantic import BaseModel, Field
from typing import Optional, List

class PredictionResponse(BaseModel):
    crop: str = Field(..., description="Identified or provided crop name")
    disease: str = Field(..., description="Predicted disease or pest, or 'Healthy'")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score between 0.0 and 1.0")
    severity: str = Field(..., description="Severity level: Low, Medium, High, or None")
    findings: str = Field(..., description="Visual plant pathology findings detected on the crop leaf")
    isUncertain: bool = Field(default=False, description="True if confidence is below safety threshold (<0.60)")
    uncertaintyWarning: Optional[str] = Field(
        default=None, 
        description="Safety warning advising farmer to retake photo or consult local agri expert"
    )
    suggestedNextAction: str = Field(
        default="View treatment guidance or check market prices",
        description="Recommended next step for the farmer"
    )

class HealthResponse(BaseModel):
    status: str
    service: str
    mode: str
    supportedCrops: List[str]

class ErrorResponse(BaseModel):
    success: bool = False
    message: str
    detail: Optional[str] = None
