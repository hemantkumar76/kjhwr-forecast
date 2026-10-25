import sqlite3
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import requests
from app.config import ELEXON_BASE_URL, DB_PATH
from app.database import get_db_connection

def get_available_dates() -> List[str]:
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT DISTINCT settlementDate FROM actual_generation ORDER BY settlementDate ASC")
    dates = [row["settlementDate"] for row in cur.fetchall()]
    conn.close()
    return dates

def get_timeseries_data(
    start_date: str,
    end_date: Optional[str] = None,
    gate_closure_time: str = "11:00"
) -> List[Dict[str, Any]]:
    if not end_date:
        end_date = start_date

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute(
        "SELECT startTime, settlementDate, settlementPeriod, generation as actualGeneration, publishTime as actualPublishTime FROM actual_generation WHERE settlementDate >= ? AND settlementDate <= ? ORDER BY startTime ASC",
        (start_date, end_date)
    )
    actual_rows = cur.fetchall()

    results = []
    for r in actual_rows:
        st = r["startTime"]
        s_date = r["settlementDate"]
        sp = r["settlementPeriod"]
        actual_gen = r["actualGeneration"]

        dt_delivery = datetime.strptime(st, "%Y-%m-%dT%H:%M:%SZ")
        hour_st = dt_delivery.replace(minute=0, second=0).strftime("%Y-%m-%dT%H:%M:%SZ")

        dt_date = datetime.strptime(s_date, "%Y-%m-%d")
        d_minus_1 = dt_date - timedelta(days=1)
        cutoff_time_str = gate_closure_time if ":" in gate_closure_time else f"{gate_closure_time}:00"
        if len(cutoff_time_str.split(":")) == 2:
            cutoff_time_str += ":00"
        da_cutoff = f"{d_minus_1.strftime('%Y-%m-%d')}T{cutoff_time_str}Z"

        cur.execute(
            "SELECT publishTime, generation FROM forecasts WHERE startTime = ? AND publishTime <= ? ORDER BY publishTime DESC LIMIT 1",
            (hour_st, da_cutoff)
        )
        da_row = cur.fetchone()

        da_gen = da_row["generation"] if da_row else None
        da_pub = da_row["publishTime"] if da_row else None

        cur.execute(
            "SELECT publishTime, generation FROM forecasts WHERE startTime = ? AND publishTime <= ? ORDER BY publishTime DESC LIMIT 1",
            (hour_st, st)
        )
        intra_row = cur.fetchone()

        intra_gen = intra_row["generation"] if intra_row else da_gen
        intra_pub = intra_row["publishTime"] if intra_row else da_pub

        err = (da_gen - actual_gen) if (da_gen is not None and actual_gen is not None) else None
        abs_err = abs(err) if err is not None else None
        pct_err = (abs_err / actual_gen * 100) if (abs_err is not None and actual_gen and actual_gen > 0) else None
        intra_err = (intra_gen - actual_gen) if (intra_gen is not None and actual_gen is not None) else None

        label = dt_delivery.strftime("%d %b %H:%M") if start_date != end_date else dt_delivery.strftime("%H:%M")

        results.append({
            "startTime": st,
            "settlementDate": s_date,
            "settlementPeriod": sp,
            "label": label,
            "actual": round(actual_gen, 2) if actual_gen is not None else None,
            "dayAheadForecast": round(da_gen, 2) if da_gen is not None else None,
            "dayAheadPublishTime": da_pub,
            "intradayForecast": round(intra_gen, 2) if intra_gen is not None else None,
            "intradayPublishTime": intra_pub,
            "forecastError": round(err, 2) if err is not None else None,
            "absoluteError": round(abs_err, 2) if abs_err is not None else None,
            "percentageError": round(pct_err, 2) if pct_err is not None else None,
            "intradayError": round(intra_err, 2) if intra_err is not None else None,
            "gateClosureTime": da_cutoff
        })

    conn.close()
    return results

def get_forecast_versions_for_interval(start_time: str) -> Dict[str, Any]:
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("SELECT generation, settlementPeriod, settlementDate FROM actual_generation WHERE startTime = ?", (start_time,))
    act = cur.fetchone()
    actual_gen = act["generation"] if act else None

    dt = datetime.strptime(start_time, "%Y-%m-%dT%H:%M:%SZ")
    hour_st = dt.replace(minute=0, second=0).strftime("%Y-%m-%dT%H:%M:%SZ")

    cur.execute("SELECT publishTime, generation FROM forecasts WHERE startTime = ? ORDER BY publishTime ASC", (hour_st,))
    rows = cur.fetchall()
    conn.close()

    versions = []
    for r in rows:
        pub = r["publishTime"]
        gen = r["generation"]
        err = gen - actual_gen if actual_gen is not None else None
        pub_dt = datetime.strptime(pub, "%Y-%m-%dT%H:%M:%SZ")
        lead_hours = round((dt - pub_dt).total_seconds() / 3600.0, 1)

        versions.append({
            "publishTime": pub,
            "forecastGeneration": gen,
            "error": round(err, 2) if err is not None else None,
            "leadTimeHours": lead_hours,
            "label": pub_dt.strftime("%d %b %H:%M")
        })

    return {
        "startTime": start_time,
        "settlementDate": act["settlementDate"] if act else None,
        "settlementPeriod": act["settlementPeriod"] if act else None,
        "actualGeneration": actual_gen,
        "versions": versions
    }

def sync_elexon_data(start_date: str, end_date: str) -> Dict[str, Any]:
    conn = get_db_connection()
    cur = conn.cursor()

    url_actuals = f"{ELEXON_BASE_URL}/datasets/FUELHH/stream?settlementDateFrom={start_date}&settlementDateTo={end_date}"
    resp_act = requests.get(url_actuals, timeout=60)
    actuals_count = 0
    if resp_act.status_code == 200:
        for r in resp_act.json():
            if r.get("fuelType") == "WIND":
                cur.execute(
                    "INSERT OR REPLACE INTO actual_generation (startTime, settlementDate, settlementPeriod, fuelType, generation, publishTime) VALUES (?, ?, ?, ?, ?, ?)",
                    (r["startTime"], r.get("settlementDate"), r.get("settlementPeriod"), r.get("fuelType"), r.get("generation"), r.get("publishTime"))
                )
                actuals_count += 1

    dt_from = datetime.strptime(start_date, "%Y-%m-%d") - timedelta(days=2)
    dt_to = datetime.strptime(end_date, "%Y-%m-%d") + timedelta(days=1)
    p_from = dt_from.strftime("%Y-%m-%dT00:00:00Z")
    p_to = dt_to.strftime("%Y-%m-%dT23:59:59Z")
    
    url_f = f"{ELEXON_BASE_URL}/datasets/WINDFOR/stream?publishDateTimeFrom={p_from}&publishDateTimeTo={p_to}"
    resp_f = requests.get(url_f, timeout=60)
    forecasts_count = 0
    if resp_f.status_code == 200:
        for item in resp_f.json():
            cur.execute(
                "INSERT OR IGNORE INTO forecasts (publishTime, startTime, generation) VALUES (?, ?, ?)",
                (item["publishTime"], item["startTime"], item["generation"])
            )
            forecasts_count += 1

    conn.commit()
    conn.close()

    return {
        "status": "success",
        "actualsSynced": actuals_count,
        "forecastsSynced": forecasts_count,
        "dateRange": f"{start_date} to {end_date}"
    }
