import joblib
import pandas as pd

MODEL_PATH = "demand_model.pkl"

def load_model():
    return joblib.load(MODEL_PATH)

def predict_quantity(model, features: dict):
    df = pd.DataFrame([features])
    y_pred = model.predict(df)[0]
    confidence = 80.0 
    return y_pred, confidence
