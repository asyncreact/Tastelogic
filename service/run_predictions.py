from datetime import datetime, timedelta
import time

from database import get_connection, insert_prediction
from ml_model import load_model, predict_quantity
from features import build_features


def get_menu_item_ids(conn):
    cur = conn.cursor()
    cur.execute("SELECT id FROM public.menu_items WHERE is_available = true;")
    rows = cur.fetchall()
    cur.close()
    return [r[0] for r in rows]


def run_for_next_hours(hours_ahead=24, commit_every=200, statement_timeout_ms=60000):
    model = load_model()

    t0 = time.time()
    conn = get_connection()
    inserts_since_commit = 0
    total_upserts = 0

    try:
        cur = conn.cursor()
        cur.execute("SET statement_timeout = %s;", (statement_timeout_ms,))
        cur.close()

        menu_ids = get_menu_item_ids(conn)
        print(f"menu_items activos: {len(menu_ids)}")

        now = datetime.now()
        base = now.replace(minute=0, second=0, microsecond=0)

        for h in range(1, hours_ahead + 1):
            dt = base + timedelta(hours=h)
            print(f"[{h}/{hours_ahead}] Generando predicciones para {dt}...")

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

                total_upserts += 1
                inserts_since_commit += 1

                if inserts_since_commit >= commit_every:
                    conn.commit()
                    print(f"  commit: {total_upserts} upserts (elapsed {time.time() - t0:.1f}s)")
                    inserts_since_commit = 0

        if inserts_since_commit > 0:
            conn.commit()
            print(f"commit final: {total_upserts} upserts (elapsed {time.time() - t0:.1f}s)")

        print(f"Listo. Total upserts: {total_upserts}. Tiempo: {time.time() - t0:.1f}s")

    finally:
        conn.close()


if __name__ == "__main__":
    run_for_next_hours(24)
