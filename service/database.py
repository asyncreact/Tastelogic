import os
from datetime import datetime

import psycopg2
from dotenv import load_dotenv

load_dotenv()

db_config = {
    "host": os.getenv("DB_HOST", "127.0.0.1"),
    "dbname": os.getenv("DB_NAME", "tastelogic"),
    "user": os.getenv("DB_USER", "tastelogic_business"),
    "password": os.getenv("DB_PASSWORD", "tastelogic_business"),
    "port": int(os.getenv("DB_PORT", "5432")),
    "connect_timeout": int(os.getenv("DB_CONNECT_TIMEOUT", "10")),
    # Render normalmente requiere SSL cuando conectas externamente
    "sslmode": os.getenv("DB_SSLMODE", "require"),
    # Útil para diagnosticar en pg_stat_activity
    "application_name": os.getenv("DB_APP_NAME", "run_predictions"),
}


def get_connection():
    return psycopg2.connect(**db_config)


def insert_prediction(
    menu_item_id: int,
    dt: datetime,
    predicted_quantity: int,
    confidence_score: float,
    model_version: str,
    conn=None,
) -> int:
    own_conn = False
    if conn is None:
        conn = get_connection()
        own_conn = True

    cur = conn.cursor()

    sql = """
    INSERT INTO public.demand_predictions
        (menu_item_id, prediction_date, prediction_hour, day_of_week, season,
         predicted_quantity, confidence_score, model_version)
    VALUES
        (%s, %s, %s,
         EXTRACT(DOW FROM %s),
         CASE
           WHEN EXTRACT(MONTH FROM %s) IN (12,1,2) THEN 'winter'
           WHEN EXTRACT(MONTH FROM %s) IN (3,4,5) THEN 'spring'
           WHEN EXTRACT(MONTH FROM %s) IN (6,7,8) THEN 'summer'
           ELSE 'fall'
         END,
         %s, %s, %s)
    ON CONFLICT (menu_item_id, prediction_date, prediction_hour)
    DO UPDATE SET
        day_of_week = EXCLUDED.day_of_week,
        season = EXCLUDED.season,
        predicted_quantity = EXCLUDED.predicted_quantity,
        confidence_score = EXCLUDED.confidence_score,
        model_version = EXCLUDED.model_version
    RETURNING id;
    """

    cur.execute(
        sql,
        (
            menu_item_id,
            dt.date(),
            dt.hour,
            dt,
            dt, dt, dt,
            predicted_quantity,
            confidence_score,
            model_version,
        ),
    )

    prediction_id = cur.fetchone()[0]
    cur.close()

    if own_conn:
        conn.commit()
        conn.close()

    return prediction_id
