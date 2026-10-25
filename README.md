# AuraGrid Energy Terminal: UK Day-Ahead Wind Forecast & Procurement Analytics

A commercial Day-Ahead Electricity Procurement Decision Platform and Elexon BMRS Forecast Accuracy Evaluator for UK Energy Utilities.

---

## 1. Project Overview

UK electricity suppliers procure power from the Day-Ahead wholesale market (e.g., EPEX SPOT GB / Nord Pool GB) to balance consumer demand. Because wind generation is weather-dependent and purchase decisions lock on **$D-1$** at Gate Closure (typically 11:00 or 12:00 GMT), utilities must rely on renewable generation forecasts to calculate additional thermal power procurement:

$$\text{Required Day-Ahead Thermal Procurement} = \max(0, \text{Consumer Demand} - \text{Wind Generation Forecast})$$

* **Over-forecasting:** When forecasted wind exceeds outturn, the utility under-procures day-ahead thermal power and is exposed to punitive System Buy Prices (SBP) in the real-time Balancing Mechanism.
* **Under-forecasting:** When forecasted wind is lower than outturn, the utility over-procures thermal power and faces sell-back discounts or curtailment costs.

AuraGrid Energy Terminal resolves the exact forecast published before Day-Ahead Gate Closure ($D-1$) for every 30-minute settlement period in January 2026, computes quantitative error statistics (MAE, RMSE, bias), and models wholesale thermal procurement positions with reserve buffers.

---

## 2. Key Features

* **Strict Day-Ahead Gate Closure Matching:** Filters National Grid ESO forecasts published strictly on or before $D-1$ cutoffs (11:00 GMT / 12:00 GMT) to eliminate lookahead data leakage.
* **Empirical Error Analytics:** Vectorized calculations for Mean Absolute Error (MAE), Root Mean Squared Error (RMSE), Mean Bias, Normalized MAE (NMAE), and Value-at-Risk quantiles ($P_{10}$, $P_{50}$, $P_{90}$).
* **Diurnal Settlement Breakdown:** Error distribution across all 48 half-hour settlement periods (00:00 to 23:30 GMT) identifying morning ramp and evening peak volatility.
* **Wholesale Procurement Simulator:** Interactive consumer demand slider with customizable diurnal profiles (UK winter curve vs flat baseload) and dynamic reserve margin recommendations.
* **Historical Forecast Revision Drilldown:** Interval inspection tracking how National Grid revisions evolved from 48-hour horizons down to gate closure.
* **Data Table & Export:** Filterable 30-minute settlement table with search and CSV export.

---

## 3. Directory & File Structure

```
.
├── backend/
│   ├── app/
│   │   ├── config.py                # Paths, constants, and default parameters
│   │   ├── database.py              # SQLite connection manager & table schemas
│   │   ├── main.py                  # FastAPI entry point & unified SPA server
│   │   ├── routes/
│   │   │   └── api.py               # REST API endpoints (/api/*)
│   │   └── services/
│   │       ├── analytics_service.py # Vectorized MAE, RMSE, bias, quantiles
│   │       ├── data_service.py      # Timeseries retrieval & Elexon sync
│   │       └── procurement_service.py # Day-ahead procurement simulation
│   ├── requirements.txt             # Python dependencies
│   ├── tests/
│   │   └── test_api.py              # Pytest automated test suite
│   └── venv/                        # Virtual environment
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ClientPitchModal.jsx # Client presentation modal
│   │   │   ├── Controls.jsx         # Date selector, presets, gate closure cutoffs
│   │   │   ├── DataTable.jsx        # 30-min settlement table with CSV export
│   │   │   ├── DiurnalChart.jsx     # 48 settlement periods diurnal error curve
│   │   │   ├── DistributionChart.jsx# Error histogram & risk quantiles
│   │   │   ├── ForecastVersionsModal.jsx # Revision convergence viewer
│   │   │   ├── Header.jsx           # Terminal header & live status indicator
│   │   │   ├── KpiCards.jsx         # MAE, RMSE, Bias, and Reserve Buffer cards
│   │   │   ├── ProcurementSimulator.jsx # Day-ahead procurement simulator
│   │   │   ├── SyncModal.jsx        # Live Elexon API sync trigger
│   │   │   └── TechReviewModal.jsx  # Technical architecture viewer
│   │   ├── App.jsx                  # Main dashboard state & tab manager
│   │   ├── index.css                # Trading terminal styling
│   │   └── main.jsx                 # React root mount
│   ├── dist/                        # Production optimized build bundle
│   ├── package.json                 # Node dependencies
│   └── vite.config.js               # Vite config with backend proxy
│
├── data/
│   └── elexon_cache.db              # Pre-loaded SQLite database (Jan 2026 data)
│
├── scripts/
│   ├── fetch_data.py                # Data ingestion script from Elexon API
│   └── inspect_elexon.py            # API inspection script
│
├── Dockerfile                       # Multi-stage production container
├── docker-compose.yml               # Docker Compose configuration
├── Procfile                         # Heroku/Render process file
├── render.yaml                      # Render.com blueprint
└── vercel.json                      # Vercel deployment configuration
```

---

## 4. How It Works

### Data Sources
1. **Actual Wind Generation (`FUELHH`):** Half-hourly generation outturn from Elexon BMRS filtered by `fuelType == "WIND"`. Covers all 31 days (1,488 settlement periods) of January 2026.
2. **Forecasted Wind Generation (`WINDFOR`):** Forecasts published by National Grid ESO. Contains 18,488 forecast records covering January 2026.
3. **Local Ingestion:** Data is stored in `data/elexon_cache.db` (SQLite) for offline execution and fast responses.

### Day-Ahead Gate Closure Matching
To avoid lookahead bias, for any delivery interval $t$ on day $D$:
$$\text{Cutoff} = (D - 1\text{ day}) \text{ at GateClosureTime (e.g., 11:00:00Z)}$$
$$\text{DayAheadForecast}(t) = \arg\max_{\text{publishTime} \le \text{Cutoff}} \text{Forecast}(t)$$

### Metrics Calculation
* **Signed Error:** $e_t = \text{Forecast}_t - \text{Actual}_t$
* **MAE:** $\text{MAE} = \frac{1}{N} \sum_{t=1}^N |e_t|$
* **RMSE:** $\text{RMSE} = \sqrt{\frac{1}{N} \sum_{t=1}^N e_t^2}$
* **Mean Bias:** $\text{ME} = \frac{1}{N} \sum_{t=1}^N e_t$
* **Reserve Buffer (P90):** $\text{Buffer} = 90^{\text{th}}\text{ Percentile}(|e_t|)$

---

## 5. How to Run Locally

### Unified Mode (Single Command)
FastAPI serves the compiled React frontend directly:

```bash
cd /Users/hemant./Task
source backend/venv/bin/activate
PYTHONPATH=backend uvicorn app.main:app --host 127.0.0.1 --port 8000
```
Open [http://127.0.0.1:8000](http://127.0.0.1:8000) in your browser.

### Development Mode (Hot-Reloading)
Run backend and frontend independently:

**Terminal 1 (Backend):**
```bash
cd /Users/hemant./Task
source backend/venv/bin/activate
PYTHONPATH=backend uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

**Terminal 2 (Frontend):**
```bash
cd /Users/hemant./Task/frontend
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Docker Mode
```bash
docker compose up --build
```
Open [http://localhost:8000](http://localhost:8000).

---

## 6. Running Tests

```bash
PYTHONPATH=backend ./backend/venv/bin/pytest backend/tests -v
```

---

## 7. REST API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/health` | GET | Health check status |
| `/api/dates` | GET | List available dates in January 2026 |
| `/api/timeseries` | GET | 30-min timeseries with actuals, forecasts, and errors |
| `/api/metrics` | GET | Aggregated accuracy metrics (MAE, RMSE, bias) |
| `/api/hourly` | GET | Metrics grouped by settlement period (1-48) |
| `/api/distribution` | GET | Error distribution histogram and quantiles |
| `/api/procurement` | GET | Day-Ahead thermal procurement simulation |
| `/api/forecast-versions` | GET | Historical revisions for a given settlement period |
| `/api/sync` | POST | Trigger live sync from Elexon BMRS API |

---

## 8. AI Tools Disclosure

AI pair-programming tools were used during development to assist with boilerplate scaffolding, chart configurations, and documentation. All business logic, Elexon schema integrations, gate closure cutoff calculations, and unit tests were validated and verified against real Elexon January 2026 data.
