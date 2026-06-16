"""
FastAPI Backend — Smart Fertilizer Recommendation System
Run: uvicorn app:app --reload --port 8000
"""
import os
import json
import logging
from datetime import datetime
from typing import Optional

import numpy as np
import joblib
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ── App Init ─────────────────────────────────────────────────
app = FastAPI(
    title="Smart Fertilizer Recommendation API",
    description="ML-powered fertilizer recommendation using soil & environmental data",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Load Model ───────────────────────────────────────────────
MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "model")

def load_artifacts():
    try:
        model = joblib.load(os.path.join(MODEL_DIR, "model.pkl"))
        scaler = joblib.load(os.path.join(MODEL_DIR, "scaler.pkl"))
        le_soil = joblib.load(os.path.join(MODEL_DIR, "le_soil.pkl"))
        le_crop = joblib.load(os.path.join(MODEL_DIR, "le_crop.pkl"))
        le_fert = joblib.load(os.path.join(MODEL_DIR, "le_fert.pkl"))
        with open(os.path.join(MODEL_DIR, "metrics.json")) as f:
            metrics = json.load(f)
        logger.info("✅ All artifacts loaded successfully")
        return model, scaler, le_soil, le_crop, le_fert, metrics
    except Exception as e:
        logger.error(f"❌ Failed to load artifacts: {e}")
        return None, None, None, None, None, None

model, scaler, le_soil, le_crop, le_fert, metrics_data = load_artifacts()

# ── Schemas ───────────────────────────────────────────────────
class PredictRequest(BaseModel):
    nitrogen: float = Field(..., ge=0, le=140, description="Nitrogen content (N)")
    phosphorous: float = Field(..., ge=0, le=140, description="Phosphorous content (P)")
    potassium: float = Field(..., ge=0, le=140, description="Potassium content (K)")
    temperature: float = Field(..., ge=-10, le=60, description="Temperature in °C")
    humidity: float = Field(..., ge=0, le=100, description="Humidity percentage")
    moisture: float = Field(..., ge=0, le=100, description="Soil moisture percentage")
    soil_type: str = Field(..., description="Type of soil")
    crop_type: str = Field(..., description="Type of crop")

class NutrientLevel(BaseModel):
    value: float
    level: str
    color: str

class PredictResponse(BaseModel):
    fertilizer: str
    confidence: float
    explanation: str
    top3: list
    nitrogen_analysis: dict
    phosphorous_analysis: dict
    potassium_analysis: dict
    farming_tips: list
    timestamp: str

# ── Helpers ───────────────────────────────────────────────────
FERTILIZER_INFO = {
    "Urea": {
        "description": "High nitrogen fertilizer (46-0-0). Best for leafy growth and green vegetation.",
        "tips": [
            "Apply in split doses to avoid nitrogen loss",
            "Water immediately after application",
            "Avoid over-application to prevent burning",
            "Best applied during active growing season"
        ]
    },
    "DAP": {
        "description": "Diammonium Phosphate (18-46-0). Rich in phosphorus for root development.",
        "tips": [
            "Ideal for early growth stages and transplanting",
            "Mix into soil before planting",
            "Excellent for root and fruit development",
            "Works best in neutral to slightly acidic soil"
        ]
    },
    "14-35-14": {
        "description": "Balanced NPK with high phosphorus. Supports flowering and fruiting stages.",
        "tips": [
            "Apply during flowering stage for best results",
            "Ensure proper irrigation after application",
            "Effective for fruiting crops like tomatoes and peppers",
            "Monitor soil pH — maintain between 6.0 and 7.0"
        ]
    },
    "28-28": {
        "description": "Balanced nitrogen-phosphorus fertilizer for overall crop nutrition.",
        "tips": [
            "Suitable for general crop nutrition",
            "Apply at planting and mid-season",
            "Avoid applying in waterlogged conditions",
            "Best for moderate nutrient-requirement crops"
        ]
    },
    "17-17-17": {
        "description": "Balanced NPK fertilizer. Provides equal nutrition of all three macronutrients.",
        "tips": [
            "Ideal for general maintenance fertilization",
            "Apply every 4-6 weeks during growing season",
            "Good for crops with balanced nutrient needs",
            "Mix thoroughly with soil for uniform distribution"
        ]
    },
    "20-20": {
        "description": "Balanced NPK with equal nitrogen and phosphorus for versatile use.",
        "tips": [
            "Great all-purpose fertilizer for most crops",
            "Apply before sowing and at knee-high stage",
            "Combine with organic matter for best results",
            "Keep stored in a dry, cool place"
        ]
    },
    "10-26-26": {
        "description": "Low nitrogen, high P&K for root crops and phosphorus-demanding plants.",
        "tips": [
            "Best for root vegetables (potatoes, carrots, beets)",
            "Apply before planting season begins",
            "Excellent for drought-stressed crops",
            "Enhances disease resistance in plants"
        ]
    },
    "10-10-10": {
        "description": "Mild balanced NPK for light-feeding plants and maintenance.",
        "tips": [
            "Use for light-feeding or established plants",
            "Safe for sandy soils with low nutrient retention",
            "Apply regularly at lower doses",
            "Good choice for ornamental and garden crops"
        ]
    },
    "10-10-10+5S": {
        "description": "Balanced NPK with added sulfur for pH adjustment and protein synthesis.",
        "tips": [
            "Ideal for alkaline soils needing pH reduction",
            "Sulfur promotes protein synthesis in crops",
            "Good for legumes and oilseed crops",
            "Apply in spring before planting"
        ]
    },
    "Potassium Chloride": {
        "description": "High potassium fertilizer (0-0-60). Improves fruit quality and stress resistance.",
        "tips": [
            "Ideal when soil potassium is critically low",
            "Improves drought and frost tolerance",
            "Enhances fruit size, color, and shelf life",
            "Avoid overuse — excess chloride can harm sensitive crops"
        ]
    },
    "Superphosphate": {
        "description": "High phosphorus fertilizer for root establishment and early plant vigor.",
        "tips": [
            "Apply at sowing time for root development",
            "Mix into soil before transplanting seedlings",
            "Effective in acidic to neutral soils",
            "Promotes early establishment of crops"
        ]
    },
    "NPK Mix": {
        "description": "Custom NPK blend for comprehensive macro-nutrient supply.",
        "tips": [
            "Apply based on soil test recommendations",
            "Ideal when soil is depleted across all nutrients",
            "Use with micronutrient supplements for best yield",
            "Always follow recommended application rates"
        ]
    }
}

def classify_nutrient(value: float, name: str) -> dict:
    if value < 40:
        return {"value": value, "level": "Low", "color": "red",
                "advice": f"{name} is LOW. Consider adding {name}-rich fertilizer."}
    elif value < 80:
        return {"value": value, "level": "Medium", "color": "yellow",
                "advice": f"{name} is at MEDIUM level. Monitor and supplement as needed."}
    else:
        return {"value": value, "level": "High", "color": "green",
                "advice": f"{name} is HIGH. Reduce {name} application to avoid toxicity."}

def generate_explanation(fertilizer: str, request: PredictRequest, confidence: float) -> str:
    info = FERTILIZER_INFO.get(fertilizer, {})
    desc = info.get("description", "A balanced fertilizer suitable for your soil and crop.")
    n_level = "low" if request.nitrogen < 40 else ("medium" if request.nitrogen < 80 else "high")
    p_level = "low" if request.phosphorous < 40 else ("medium" if request.phosphorous < 80 else "high")
    k_level = "low" if request.potassium < 40 else ("medium" if request.potassium < 80 else "high")
    return (
        f"Based on your soil analysis for {request.crop_type} on {request.soil_type} soil, "
        f"the model recommends **{fertilizer}** with {confidence:.1f}% confidence. "
        f"{desc} Your soil shows {n_level} nitrogen (N={request.nitrogen}), "
        f"{p_level} phosphorus (P={request.phosphorous}), and "
        f"{k_level} potassium (K={request.potassium}) levels. "
        f"Environmental conditions: Temperature={request.temperature}°C, "
        f"Humidity={request.humidity}%, Moisture={request.moisture}%."
    )

# ── Routes ────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
def root():
    return {
        "message": "Smart Fertilizer Recommendation API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs"
    }

@app.get("/health", tags=["Health"])
def health():
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "timestamp": datetime.now().isoformat()
    }

@app.get("/metrics", tags=["Model"])
def get_metrics():
    if metrics_data is None:
        raise HTTPException(status_code=503, detail="Metrics not available. Run training first.")
    return metrics_data

@app.get("/options", tags=["Data"])
def get_options():
    if le_soil is None:
        return {
            "soil_types": ["Sandy", "Loamy", "Black", "Red", "Clayey"],
            "crop_types": ["Maize", "Sugarcane", "Cotton", "Tobacco", "Paddy",
                          "Barley", "Wheat", "Millets", "Oil seeds", "Pulses", "Ground Nuts"],
            "fertilizers": list(FERTILIZER_INFO.keys())
        }
    return {
        "soil_types": list(le_soil.classes_),
        "crop_types": list(le_crop.classes_),
        "fertilizers": list(le_fert.classes_)
    }

@app.post("/predict", response_model=PredictResponse, tags=["Prediction"])
def predict(req: PredictRequest):
    if model is None:
        raise HTTPException(
            status_code=503,
            detail="Model not loaded. Please run 'python model/train.py' first."
        )

    # Validate soil and crop
    try:
        soil_enc = le_soil.transform([req.soil_type])[0]
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Unknown soil type: {req.soil_type}")
    try:
        crop_enc = le_crop.transform([req.crop_type])[0]
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Unknown crop type: {req.crop_type}")

    # Build feature vector
    features = np.array([[
        req.temperature, req.humidity, req.moisture,
        soil_enc, crop_enc,
        req.nitrogen, req.potassium, req.phosphorous
    ]])
    features_scaled = scaler.transform(features)

    # Predict
    pred_class = model.predict(features_scaled)[0]
    fertilizer = le_fert.inverse_transform([pred_class])[0]

    # Confidence
    if hasattr(model, "predict_proba"):
        proba = model.predict_proba(features_scaled)[0]
        top_indices = np.argsort(proba)[::-1][:3]
        confidence = round(float(proba[pred_class]) * 100, 2)
        top3 = [
            {"fertilizer": le_fert.inverse_transform([i])[0], "confidence": round(float(proba[i]) * 100, 2)}
            for i in top_indices
        ]
    else:
        confidence = 85.0
        top3 = [{"fertilizer": fertilizer, "confidence": confidence}]

    info = FERTILIZER_INFO.get(fertilizer, {})
    tips = info.get("tips", ["Follow standard application rates.", "Consult local agricultural extension."])

    return PredictResponse(
        fertilizer=fertilizer,
        confidence=confidence,
        explanation=generate_explanation(fertilizer, req, confidence),
        top3=top3,
        nitrogen_analysis=classify_nutrient(req.nitrogen, "Nitrogen"),
        phosphorous_analysis=classify_nutrient(req.phosphorous, "Phosphorous"),
        potassium_analysis=classify_nutrient(req.potassium, "Potassium"),
        farming_tips=tips,
        timestamp=datetime.now().isoformat()
    )

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=True)
