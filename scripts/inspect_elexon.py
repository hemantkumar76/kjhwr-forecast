import requests
import json
from datetime import datetime

print("Fetching sample FUELHH for 2026-01-01...")
r1 = requests.get("https://data.elexon.co.uk/bmrs/api/v1/datasets/FUELHH/stream?settlementDate=2026-01-01")
print(f"FUELHH status: {r1.status_code}")
actuals = r1.json()
wind_actuals = [row for row in actuals if row.get("fuelType") == "WIND"]
print(f"Total FUELHH rows: {len(actuals)}, WIND rows: {len(wind_actuals)}")
if wind_actuals:
    print("Sample actual row:", wind_actuals[0])

print("\nFetching sample WINDFOR published on 2025-12-31...")
r2 = requests.get("https://data.elexon.co.uk/bmrs/api/v1/datasets/WINDFOR/stream?publishDateTimeFrom=2025-12-31T09:00:00Z&publishDateTimeTo=2025-12-31T12:00:00Z")
print(f"WINDFOR status: {r2.status_code}")
forecasts = r2.json()
print(f"Total WINDFOR rows: {len(forecasts)}")
if forecasts:
    print("Sample forecast row:", forecasts[0])
    sample_starts = [f["startTime"] for f in forecasts if f.get("startTime", "").startswith("2026-01-01")]
    print(f"Forecasts for 2026-01-01 in this batch: {len(sample_starts)}")
