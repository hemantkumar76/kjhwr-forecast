from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from pydantic import BaseModel

from app.services.data_service import (
    get_available_dates,
    get_timeseries_data,
    get_forecast_versions_for_interval,
    sync_elexon_data
)
from app.services.analytics_service import (
    compute_metrics,
    compute_hourly_breakdown,
    compute_error_distribution
)
from app.services.procurement_service import simulate_day_ahead_procurement

router = APIRouter(prefix="/api")

class SyncRequest(BaseModel):
    startDate: str
    endDate: str

@router.get("/health")
def health_check():
    return {"status": "ok", "service": "UK Wind Forecast & Day-Ahead Procurement Analytics API"}

@router.get("/dates")
def list_dates():
    dates = get_available_dates()
    return {
        "dates": dates,
        "defaultDate": dates[0] if dates else "2026-01-01",
        "count": len(dates)
    }

@router.get("/timeseries")
def get_timeseries(
    startDate: str = Query(..., description="Start date (YYYY-MM-DD)"),
    endDate: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    gateClosureTime: str = Query("11:00", description="Day-Ahead gate closure cutoff time on D-1")
):
    ts = get_timeseries_data(startDate, endDate, gateClosureTime)
    return {
        "startDate": startDate,
        "endDate": endDate or startDate,
        "gateClosureTime": gateClosureTime,
        "count": len(ts),
        "data": ts
    }

@router.get("/metrics")
def get_metrics(
    startDate: str = Query(..., description="Start date (YYYY-MM-DD)"),
    endDate: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    gateClosureTime: str = Query("11:00", description="Day-Ahead gate closure cutoff time on D-1")
):
    ts = get_timeseries_data(startDate, endDate, gateClosureTime)
    metrics = compute_metrics(ts)
    return {
        "startDate": startDate,
        "endDate": endDate or startDate,
        "gateClosureTime": gateClosureTime,
        "metrics": metrics
    }

@router.get("/hourly")
def get_hourly(
    startDate: str = Query(..., description="Start date (YYYY-MM-DD)"),
    endDate: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    gateClosureTime: str = Query("11:00", description="Day-Ahead gate closure cutoff time on D-1")
):
    ts = get_timeseries_data(startDate, endDate, gateClosureTime)
    breakdown = compute_hourly_breakdown(ts)
    return {
        "startDate": startDate,
        "endDate": endDate or startDate,
        "breakdown": breakdown
    }

@router.get("/distribution")
def get_distribution(
    startDate: str = Query(..., description="Start date (YYYY-MM-DD)"),
    endDate: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    gateClosureTime: str = Query("11:00", description="Day-Ahead gate closure cutoff time on D-1")
):
    ts = get_timeseries_data(startDate, endDate, gateClosureTime)
    dist = compute_error_distribution(ts)
    return dist

@router.get("/forecast-versions")
def get_forecast_versions(
    startTime: str = Query(..., description="Exact delivery interval startTime (e.g. 2026-01-01T12:00:00Z)")
):
    res = get_forecast_versions_for_interval(startTime)
    return res

@router.get("/procurement")
def get_procurement(
    startDate: str = Query(..., description="Start date (YYYY-MM-DD)"),
    endDate: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    gateClosureTime: str = Query("11:00", description="Day-Ahead gate closure cutoff time on D-1"),
    peakDemandMw: float = Query(35000.0, description="Peak demand in MW"),
    demandMode: str = Query("winter_profile", description="Demand profile mode: winter_profile or flat"),
    reserveConfidence: str = Query("p90", description="Reserve buffer mode: p90 or mae")
):
    ts = get_timeseries_data(startDate, endDate, gateClosureTime)
    sim = simulate_day_ahead_procurement(
        timeseries=ts,
        peak_demand_mw=peakDemandMw,
        demand_mode=demandMode,
        reserve_confidence=reserveConfidence
    )
    return sim

@router.post("/sync")
def sync_data(req: SyncRequest):
    try:
        res = sync_elexon_data(req.startDate, req.endDate)
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
