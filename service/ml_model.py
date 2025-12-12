import joblib
import numpy as np
import pandas as pd

MODEL_PATH = "demand_model.pkl"

def load_model():
    return joblib.load(MODEL_PATH)

def _interval_to_confidence(y_pred: float, y_low: float, y_high: float) -> float:
    width = max(0.0, y_high - y_low)
    scale = max(abs(y_pred), 1.0)
    rel_width = width / scale
    conf = 100.0 / (1.0 + rel_width)
    return float(np.clip(conf, 0.0, 100.0))

def predict_quantity(model, features: dict, q_low=0.05, q_high=0.95):
    df = pd.DataFrame([features])

    preprocess = model.named_steps["preprocess"]
    rf = model.named_steps["model"]

    X_trans = preprocess.transform(df)

    tree_preds = np.array([est.predict(X_trans)[0] for est in rf.estimators_], dtype=float)

    y_pred = float(tree_preds.mean())
    y_low = float(np.quantile(tree_preds, q_low))
    y_high = float(np.quantile(tree_preds, q_high))

    confidence = _interval_to_confidence(y_pred, y_low, y_high)

    return int(round(y_pred)), confidence
