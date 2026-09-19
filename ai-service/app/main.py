import os
import logging
from typing import Optional
from fastapi import FastAPI, File, UploadFile, Form, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .schemas import PredictionResponse, HealthResponse, ErrorResponse
from .preprocessing import validate_image_file
from .predictor import predict_crop_disease, CROP_DISEASE_CATALOG

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("ai_service")

app = FastAPI(
    title="BFarm AI Diagnosis Service",
    description="Intelligent Crop Care & Plant Pathology Vision API for smallholder farmers",
    version="1.0.0"
)

# Enable CORS for Mobile App and Web Admin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(HTTPException)
async def custom_http_exception_handler(request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"success": False, "message": str(exc.detail)}
    )

@app.exception_handler(Exception)
async def global_exception_handler(request, exc: Exception):
    logger.error("Unhandled error during request: %s", exc, exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"success": False, "message": "An error occurred while analyzing the crop image. Please try again."}
    )

@app.get("/health", response_model=HealthResponse)
async def health_check():
    mode = os.getenv("AI_SERVICE_MODE", "demo")
    return HealthResponse(
        status="healthy",
        service="bfarm-ai-diagnosis",
        mode=mode,
        supportedCrops=list(CROP_DISEASE_CATALOG.keys())
    )

@app.get("/supported-crops")
async def get_supported_crops():
    return {
        "success": True,
        "crops": list(CROP_DISEASE_CATALOG.keys())
    }

@app.post(
    "/predict",
    response_model=PredictionResponse,
    responses={
        400: {"model": ErrorResponse},
        413: {"model": ErrorResponse},
        415: {"model": ErrorResponse},
        500: {"model": ErrorResponse}
    }
)
async def predict(
    image: UploadFile = File(..., description="Crop leaf photograph (JPEG or PNG, max 5MB)"),
    crop_hint: Optional[str] = Form(None, description="Optional crop hint from farmer")
):
    """
    Analyzes an uploaded leaf image and returns the identified crop,
    disease/pest diagnosis, confidence level, severity, and visual findings.
    """
    logger.info("Received image diagnosis request. Filename: %s, Crop Hint: %s", image.filename, crop_hint)
    
    # 1. Read file contents
    contents = await image.read()
    
    # 2. Security validation (size, magic bytes, PIL format)
    pil_image = validate_image_file(image, contents)
    
    # 3. Predict disease / pest
    result = predict_crop_disease(pil_image, crop_hint=crop_hint)
    logger.info("Diagnosis completed: %s -> %s (Confidence: %s)", result.crop, result.disease, result.confidence)
    
    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
