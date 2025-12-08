import pandas as pd
import psycopg2
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
import joblib

from database import get_connection

def load_training_data():
    conn = get_connection()
    query = """
    SELECT 
        oi.menu_item_id,
        o.order_date,
        EXTRACT(HOUR FROM o.order_time) AS order_hour,
        EXTRACT(DOW FROM o.order_date) AS day_of_week,
        CASE 
            WHEN EXTRACT(MONTH FROM o.order_date) IN (12,1,2) THEN 'winter'
            WHEN EXTRACT(MONTH FROM o.order_date) IN (3,4,5) THEN 'spring'
            WHEN EXTRACT(MONTH FROM o.order_date) IN (6,7,8) THEN 'summer'
            ELSE 'fall'
        END AS season,
        SUM(oi.quantity) AS total_quantity
    FROM public.orders o
    JOIN public.order_items oi ON oi.order_id = o.id
    GROUP BY oi.menu_item_id, o.order_date, order_hour, day_of_week, season;
    """
    df = pd.read_sql(query, conn)
    conn.close()
    return df

def train_and_save():
    df = load_training_data()
    df["day_of_week"] = df["day_of_week"].astype(int)

    X = df[["menu_item_id", "order_hour", "day_of_week", "season"]]
    y = df["total_quantity"]

    cat_cols = ["menu_item_id", "season", "day_of_week"]
    num_cols = ["order_hour"]

    pre = ColumnTransformer(
        transformers=[
            ("cat", OneHotEncoder(handle_unknown="ignore"), cat_cols),
            ("num", "passthrough", num_cols),
        ]
    )

    model = RandomForestRegressor(n_estimators=100, random_state=42)
    pipe = Pipeline(steps=[("preprocess", pre), ("model", model)])

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    pipe.fit(X_train, y_train)
    joblib.dump(pipe, "demand_model.pkl")

if __name__ == "__main__":
    train_and_save()
