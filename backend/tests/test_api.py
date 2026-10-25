import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.analytics_service import compute_metrics, compute_hourly_breakdown, compute_error_distribution
from app.services.procurement_service import simulate_day_ahead_procurement

client = TestClient(app)

def test_health_check():
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"

def test_list_dates():
    res = client.get("/api/dates")
    assert res.status_code == 200
    data = res.json()
    assert "dates" in data
    assert len(data["dates"]) == 31
    assert "2026-01-01" in data["dates"]

def test_timeseries_single_day():
    res = client.get("/api/timeseries?startDate=2026-01-05&gateClosureTime=11:00")
    assert res.status_code == 200
    data = res.json()
    assert data["startDate"] == "2026-01-05"
    assert len(data["data"]) == 48

def test_metrics_calculation():
    res = client.get("/api/metrics?startDate=2026-01-01&gateClosureTime=11:00")
    assert res.status_code == 200
    metrics = res.json()["metrics"]
    assert "mae" in metrics
    assert "rmse" in metrics
    assert "meanBias" in metrics
    assert metrics["sampleCount"] == 48
    assert metrics["rmse"] >= metrics["mae"]

def test_hourly_breakdown():
    res = client.get("/api/hourly?startDate=2026-01-01&gateClosureTime=11:00")
    assert res.status_code == 200
    data = res.json()
    assert len(data["breakdown"]) == 48

def test_error_distribution():
    res = client.get("/api/distribution?startDate=2026-01-01&endDate=2026-01-07&gateClosureTime=11:00")
    assert res.status_code == 200
    dist = res.json()
    assert "distribution" in dist
    assert len(dist["distribution"]) > 0

def test_procurement_simulation():
    res = client.get("/api/procurement?startDate=2026-01-01&gateClosureTime=11:00&peakDemandMw=32000")
    assert res.status_code == 200
    sim = res.json()
    assert sim["peakDemandMw"] == 32000
    assert "recommendedBufferMw" in sim
    assert len(sim["schedule"]) == 48
