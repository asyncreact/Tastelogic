import psycopg2
from datetime import datetime
import os
from dotenv import load_dotenv

# Cargar variables de entorno desde .env
load_dotenv()

DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "dbname": os.getenv("DB_NAME", "tastelogic"),
    "user": os.getenv("DB_USER", "tastelogic_business"),
    "password": os.getenv("DB_PASSWORD", "tastelogic_business"),
    "port": int(os.getenv("DB_PORT", "5432")),
}

def get_connection():
    return psycopg2.connect(**DB_CONFIG)

def insert_prediction(menu_item_id: int, dt: datetime,
                      predicted_quantity: int,
                      confidence_score: float,
                      model_version: str):
    conn = get_connection()
    cur = conn.cursor()
    sql = """
        INSERT INTO public.demand_predictions
        (menu_item_id, prediction_date, prediction_hour, day_of_week, season,
         predicted_quantity, confidence_score, model_version)
        VALUES (
            %s,
            %s,
            %s,
            EXTRACT(DOW FROM %s),
            CASE
                WHEN EXTRACT(MONTH FROM %s) IN (12,1,2) THEN 'winter'
                WHEN EXTRACT(MONTH FROM %s) IN (3,4,5) THEN 'spring'
                WHEN EXTRACT(MONTH FROM %s) IN (6,7,8) THEN 'summer'
                ELSE 'fall'
            END,
            %s,
            %s,
            %s
        )
        RETURNING id;
    """
    cur.execute(
        sql,
        (
            menu_item_id,
            dt.date(),
            dt.hour,
            dt.date(),
            dt.date(),
            dt.date(),
            dt.date(),
            predicted_quantity,
            confidence_score,
            model_version,
        ),
    )
    pred_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()
    return pred_id
