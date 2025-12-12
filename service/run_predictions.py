from datetime import datetime, timedelta

from database import get_connection, insert_prediction
from ml_model import load_model, predict_quantity
from features import build_features


def get_menu_item_ids(conn):
    cur = conn.cursor()
    cur.execute("SELECT id FROM public.menu_items WHERE is_available = true;")
    rows = cur.fetchall()
    cur.close()
    return [r[0] for r in rows]


def run_for_next_hours(hours_ahead=24):
    model = load_model()

    conn = get_connection()
    try:
        menu_ids = get_menu_item_ids(conn)

        now = datetime.now()
        base = now.replace(minute=0, second=0, microsecond=0)

        for h in range(1, hours_ahead + 1):
            dt = base + timedelta(hours=h)
            for menu_item_id in menu_ids:
                feats = build_features(menu_item_id, dt)

                y_pred, conf = predict_quantity(model, feats)
                if conf is None:
                    conf = 0.0

                insert_prediction(
                    menu_item_id=menu_item_id,
                    dt=dt,
                    predicted_quantity=int(y_pred),
                    confidence_score=float(conf),
                    model_version="v1",
                    conn=conn,  
                )

        conn.commit() 
    finally:
        conn.close()


if __name__ == "__main__":
    run_for_next_hours(24)
