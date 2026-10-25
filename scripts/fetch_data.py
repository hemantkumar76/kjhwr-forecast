import os
import sys
import time
import sqlite3
import requests
from datetime import datetime, timedelta

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
DB_PATH = os.path.join(DATA_DIR, "elexon_cache.db")
os.makedirs(DATA_DIR, exist_ok=True)

BASE_URL = "https://data.elexon.co.uk/bmrs/api/v1"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("CREATE TABLE IF NOT EXISTS actual_generation (startTime TEXT PRIMARY KEY, settlementDate TEXT, settlementPeriod INTEGER, fuelType TEXT, generation REAL, publishTime TEXT)")
    cur.execute("CREATE TABLE IF NOT EXISTS forecasts (id INTEGER PRIMARY KEY AUTOINCREMENT, publishTime TEXT, startTime TEXT, generation REAL, UNIQUE(publishTime, startTime))")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_actual_date ON actual_generation(settlementDate)")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_forecast_start ON forecasts(startTime)")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_forecast_publish ON forecasts(publishTime)")
    conn.commit()
    conn.close()

def fetch_actuals():
    print("Fetching FUELHH wind actuals for January 2026...")
    url = f"{BASE_URL}/datasets/FUELHH/stream?settlementDateFrom=2026-01-01&settlementDateTo=2026-01-31"
    resp = requests.get(url, timeout=60)
    if resp.status_code != 200:
        raise Exception(f"Failed to fetch FUELHH: {resp.status_code} {resp.text}")
    
    rows = resp.json()
    wind_rows = [r for r in rows if r.get("fuelType") == "WIND"]
    print(f"Total FUELHH rows: {len(rows)}, Wind rows: {len(wind_rows)}")

    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    inserted = 0
    for r in wind_rows:
        cur.execute(
            "INSERT OR REPLACE INTO actual_generation (startTime, settlementDate, settlementPeriod, fuelType, generation, publishTime) VALUES (?, ?, ?, ?, ?, ?)",
            (r["startTime"], r.get("settlementDate"), r.get("settlementPeriod"), r.get("fuelType"), r.get("generation"), r.get("publishTime"))
        )
        inserted += 1
    conn.commit()
    conn.close()
    print(f"Successfully stored {inserted} actual generation records in database.")

def fetch_forecasts():
    print("Fetching WINDFOR forecasts covering January 2026...")
    start_dt = datetime(2025, 12, 31, 0, 0, 0)
    end_dt = datetime(2026, 2, 1, 0, 0, 0)
    
    chunk_days = 4
    current_dt = start_dt
    total_forecasts = 0

    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    while current_dt < end_dt:
        next_dt = min(current_dt + timedelta(days=chunk_days), end_dt)
        p_from = current_dt.strftime("%Y-%m-%dT%H:%M:%SZ")
        p_to = (next_dt - timedelta(seconds=1)).strftime("%Y-%m-%dT%H:%M:%SZ")
        print(f"Fetching WINDFOR chunk: {p_from} to {p_to}...")

        url = f"{BASE_URL}/datasets/WINDFOR/stream?publishDateTimeFrom={p_from}&publishDateTimeTo={p_to}"
        try:
            resp = requests.get(url, timeout=60)
            if resp.status_code == 200:
                chunk_data = resp.json()
                print(f"  Received {len(chunk_data)} forecast rows")
                for item in chunk_data:
                    st = item.get("startTime", "")
                    if st >= "2025-12-31" and st < "2026-02-02":
                        cur.execute(
                            "INSERT OR IGNORE INTO forecasts (publishTime, startTime, generation) VALUES (?, ?, ?)",
                            (item["publishTime"], item["startTime"], item["generation"])
                        )
                        total_forecasts += 1
                conn.commit()
            else:
                print(f"  Warning: HTTP {resp.status_code}")
        except Exception as e:
            print(f"  Error fetching chunk: {e}")
        
        current_dt = next_dt
        time.sleep(0.3)

    conn.close()
    print(f"Successfully processed and stored forecasts. Total inserted/verified: {total_forecasts}")

if __name__ == "__main__":
    init_db()
    fetch_actuals()
    fetch_forecasts()
    print("Data ingestion complete!")
