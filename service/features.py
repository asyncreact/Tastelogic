from datetime import datetime

def get_season(dt: datetime) -> str:
    m = dt.month
    if m in (12, 1, 2):
        return "winter"
    elif m in (3, 4, 5):
        return "spring"
    elif m in (6, 7, 8):
        return "summer"
    else:
        return "fall"

def build_features(menu_item_id: int, dt: datetime) -> dict:
    return {
        "menu_item_id": menu_item_id,
        "order_hour": dt.hour,
        "day_of_week": dt.weekday(),
        "season": get_season(dt),
    }
