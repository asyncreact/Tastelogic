from typing import List
from fastapi import FastAPI
from pydantic import BaseModel
from datetime import datetime

from ml_model import load_model, predict_quantity
from features import build_features
from database import insert_prediction

app = FastAPI()
model = load_model()

class PredictRequest(BaseModel):
    menu_item_id: int
    datetime_str: str

@app.post("/predict")
def predict_demand(reqs: List[PredictRequest]):
    results = []
    for req in reqs:
        dt = datetime.fromisoformat(req.datetime_str)
        features = build_features(menu_item_id=req.menu_item_id, dt=dt)
        y_pred, confidence = predict_quantity(model, features)

        pred_id = insert_prediction(
            menu_item_id=req.menu_item_id,
            dt=dt,
            predicted_quantity=int(round(y_pred)),
            confidence_score=confidence,
            model_version="v1",
        )

        results.append({
            "menu_item_id": req.menu_item_id,
            "prediction_id": pred_id,
            "predicted_quantity": int(round(y_pred)),
            "confidence_score": confidence,
        })
    return results
