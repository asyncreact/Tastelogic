from datetime import datetime, timedelta
from database import getconnection, insertprediction
from mlmodel import loadmodel, predictquantity
from features import buildfeatures

def get_menu_item_ids():
    conn = getconnection()
    cur = conn.cursor()
    cur.execute("SELECT id FROM public.menuitems WHERE isavailable = true;")
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [r[0] for r in rows]

def run_for_next_hours(hours_ahead=24):
    model = loadmodel()
    menu_ids = get_menu_item_ids()

    now = datetime.now()
    # redondear a la hora (opcional)
    base = now.replace(minute=0, second=0, microsecond=0)

    for h in range(1, hours_ahead + 1):
        dt = base + timedelta(hours=h)
        for menuitemid in menu_ids:
            feats = buildfeatures(menuitemid, dt)
            ypred, conf = predictquantity(model, feats)
            insertprediction(
                menuitemid=menuitemid,
                dt=dt,
                predictedquantity=int(round(ypred)),
                confidencescore=conf,
                modelversion="v1"
            )

if __name__ == "__main__":
    run_for_next_hours(24)
