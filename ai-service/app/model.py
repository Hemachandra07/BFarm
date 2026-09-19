import os
import logging
from typing import Optional, Any

logger = logging.getLogger("ai_service.model")

MODEL_WEIGHTS_PATH = os.getenv("MODEL_PATH", "models/plant_disease_model.pth")

class PlantDiseaseModelLoader:
    _instance = None
    _model = None

    @classmethod
    def get_model(cls) -> Optional[Any]:
        if cls._model is not None:
            return cls._model

        mode = os.getenv("AI_SERVICE_MODE", "demo").lower()
        if mode != "model":
            logger.info("AI_SERVICE_MODE is '%s'. Skipping PyTorch weight file load.", mode)
            return None

        try:
            import torch
            import torchvision.models as models

            # Architecture: MobileNetV3-Large or ResNet50 adapted for plant pathology
            device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
            logger.info("Instantiating PyTorch model on device: %s", device)
            
            # Using torchvision mobilenet_v3_small
            model = models.mobilenet_v3_small(weights=None)
            num_classes = 38  # Standard PlantVillage disease classes
            model.classifier[3] = torch.nn.Linear(model.classifier[3].in_features, num_classes)

            if os.path.exists(MODEL_WEIGHTS_PATH):
                logger.info("Loading PyTorch weights from %s", MODEL_WEIGHTS_PATH)
                state_dict = torch.load(MODEL_WEIGHTS_PATH, map_location=device)
                model.load_state_dict(state_dict)
            else:
                logger.warning(
                    "Weights file %s not found. Model initialized with structural weights.", 
                    MODEL_WEIGHTS_PATH
                )

            model.to(device)
            model.eval()
            cls._model = model
            return cls._model
        except Exception as e:
            logger.error("Failed to initialize PyTorch model: %s", e)
            return None
