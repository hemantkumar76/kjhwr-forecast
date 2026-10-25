import math
import numpy as np
from typing import List, Dict, Any

def compute_metrics(timeseries: List[Dict[str, Any]]) -> Dict[str, Any]:
    
    valid_points = [
        p for p in timeseries
        if p.get("actual") is not None and p.get("dayAheadForecast") is not None
    ]

    if not valid_points:
        return {
            "sampleCount": 0,
            "mae": 0.0,
            "rmse": 0.0,
            "meanBias": 0.0,
            "mape": 0.0,
            "nmae": 0.0,
            "maxOverForecast": 0.0,
            "maxUnderForecast": 0.0,
            "overForecastCount": 0,
            "underForecastCount": 0,
            "overForecastPct": 0.0,
            "underForecastPct": 0.0,
            "p10Error": 0.0,
            "p50Error": 0.0,
            "p90Error": 0.0,
            "meanActual": 0.0,
            "meanForecast": 0.0,
            "correlation": 0.0,
            "intradayMae": 0.0
        }

    actuals = np.array([p["actual"] for p in valid_points], dtype=float)
    forecasts = np.array([p["dayAheadForecast"] for p in valid_points], dtype=float)
    errors = forecasts - actuals
    abs_errors = np.abs(errors)

    n = len(valid_points)
    mae = float(np.mean(abs_errors))
    rmse = float(np.sqrt(np.mean(errors ** 2)))
    mean_bias = float(np.mean(errors))
    mean_actual = float(np.mean(actuals))
    mean_forecast = float(np.mean(forecasts))

    nmae = float((mae / mean_actual * 100)) if mean_actual > 0 else 0.0

    non_zero_mask = actuals > 50.0
    if np.any(non_zero_mask):
        mape = float(np.mean(abs_errors[non_zero_mask] / actuals[non_zero_mask]) * 100)
    else:
        mape = 0.0

    over_mask = errors > 0
    under_mask = errors < 0
    over_count = int(np.sum(over_mask))
    under_count = int(np.sum(under_mask))
    over_pct = float(over_count / n * 100)
    under_pct = float(under_count / n * 100)

    max_over = float(np.max(errors)) if over_count > 0 else 0.0
    max_under = float(np.abs(np.min(errors))) if under_count > 0 else 0.0

    p10 = float(np.percentile(errors, 10))
    p50 = float(np.percentile(errors, 50))
    p90 = float(np.percentile(errors, 90))

    if np.std(actuals) > 0 and np.std(forecasts) > 0:
        corr = float(np.corrcoef(actuals, forecasts)[0, 1])
    else:
        corr = 1.0

    intra_valid = [p for p in valid_points if p.get("intradayForecast") is not None]
    if intra_valid:
        intra_abs_errors = [abs(p["intradayForecast"] - p["actual"]) for p in intra_valid]
        intra_mae = float(np.mean(intra_abs_errors))
    else:
        intra_mae = mae

    return {
        "sampleCount": n,
        "mae": round(mae, 2),
        "rmse": round(rmse, 2),
        "meanBias": round(mean_bias, 2),
        "mape": round(mape, 2),
        "nmae": round(nmae, 2),
        "maxOverForecast": round(max_over, 2),
        "maxUnderForecast": round(max_under, 2),
        "overForecastCount": over_count,
        "underForecastCount": under_count,
        "overForecastPct": round(over_pct, 1),
        "underForecastPct": round(under_pct, 1),
        "p10Error": round(p10, 2),
        "p50Error": round(p50, 2),
        "p90Error": round(p90, 2),
        "meanActual": round(mean_actual, 2),
        "meanForecast": round(mean_forecast, 2),
        "correlation": round(corr, 3),
        "intradayMae": round(intra_mae, 2),
        "improvementPct": round(((mae - intra_mae) / mae * 100), 1) if mae > 0 else 0.0
    }

def compute_hourly_breakdown(timeseries: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    
    by_sp: Dict[int, List[Dict[str, Any]]] = {}
    for p in timeseries:
        sp = p.get("settlementPeriod")
        if sp is not None and p.get("actual") is not None and p.get("dayAheadForecast") is not None:
            by_sp.setdefault(sp, []).append(p)

    hourly_results = []
    for sp in sorted(by_sp.keys()):
        points = by_sp[sp]
        actuals = [pt["actual"] for pt in points]
        forecasts = [pt["dayAheadForecast"] for pt in points]
        errors = [f - a for f, a in zip(forecasts, actuals)]
        abs_errors = [abs(e) for e in errors]

        hour = (sp - 1) // 2
        minute = "00" if sp % 2 != 0 else "30"
        time_label = f"{hour:02d}:{minute}"

        hourly_results.append({
            "settlementPeriod": sp,
            "hour": hour,
            "timeLabel": time_label,
            "sampleCount": len(points),
            "mae": round(float(np.mean(abs_errors)), 2),
            "rmse": round(float(np.sqrt(np.mean(np.array(errors) ** 2))), 2),
            "meanBias": round(float(np.mean(errors)), 2),
            "avgActual": round(float(np.mean(actuals)), 2),
            "avgForecast": round(float(np.mean(forecasts)), 2)
        })

    return hourly_results

def compute_error_distribution(timeseries: List[Dict[str, Any]], num_bins: int = 15) -> Dict[str, Any]:
    
    errors = [
        p["dayAheadForecast"] - p["actual"]
        for p in timeseries
        if p.get("actual") is not None and p.get("dayAheadForecast") is not None
    ]

    if not errors:
        return {"bins": [], "counts": []}

    hist, bin_edges = np.histogram(errors, bins=num_bins)
    
    distribution = []
    for i in range(len(hist)):
        lower = round(float(bin_edges[i]), 0)
        upper = round(float(bin_edges[i+1]), 0)
        distribution.append({
            "range": f"{lower:+.0f} to {upper:+.0f} MW",
            "binCenter": round((lower + upper) / 2.0, 0),
            "count": int(hist[i]),
            "pct": round(float(hist[i] / len(errors) * 100), 1),
            "isOverForecast": (lower + upper) / 2.0 > 0
        })

    return {
        "distribution": distribution,
        "minError": round(float(np.min(errors)), 2),
        "maxError": round(float(np.max(errors)), 2)
    }
