import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA_DIR = os.path.join(BASE_DIR, "data")
DB_PATH = os.getenv("DB_PATH", os.path.join(DATA_DIR, "elexon_cache.db"))
STATIC_DIR = os.path.join(BASE_DIR, "frontend", "dist")

ELEXON_BASE_URL = "https://data.elexon.co.uk/bmrs/api/v1"
DEFAULT_GATE_CLOSURE = "11:00"
DEFAULT_DEMAND_MW = 35000.0
