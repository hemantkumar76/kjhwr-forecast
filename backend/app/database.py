import sqlite3
import os
from app.config import DB_PATH, DATA_DIR

def get_db_connection():
    os.makedirs(DATA_DIR, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("CREATE TABLE IF NOT EXISTS actual_generation (startTime TEXT PRIMARY KEY, settlementDate TEXT, settlementPeriod INTEGER, fuelType TEXT, generation REAL, publishTime TEXT)")
    cur.execute("CREATE TABLE IF NOT EXISTS forecasts (id INTEGER PRIMARY KEY AUTOINCREMENT, publishTime TEXT, startTime TEXT, generation REAL, UNIQUE(publishTime, startTime))")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_actual_date ON actual_generation(settlementDate)")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_forecast_start ON forecasts(startTime)")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_forecast_publish ON forecasts(publishTime)")
    conn.commit()
    conn.close()
