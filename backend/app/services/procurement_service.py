from typing import List, Dict, Any, Optional
import numpy as np

TYPICAL_WINTER_PROFILE_48 = [
    0.62, 0.60, 0.58, 0.56, 0.55, 0.54, 0.53, 0.53,
    0.54, 0.56, 0.60, 0.67, 0.76, 0.84, 0.89, 0.92,
    0.93, 0.94, 0.93, 0.91, 0.90, 0.89, 0.89, 0.90,
    0.90, 0.90, 0.91, 0.92, 0.94, 0.97, 1.00, 0.99,
    0.97, 0.94, 0.91, 0.87, 0.84, 0.80, 0.76, 0.73,
    0.70, 0.68, 0.66, 0.64, 0.63, 0.62, 0.61, 0.60
]

def simulate_day_ahead_procurement(
    timeseries: List[Dict[str, Any]],
    peak_demand_mw: float = 35000.0,
    demand_mode: str = "winter_profile",
    reserve_confidence: str = "p90"
) -> Dict[str, Any]:
    
    schedule = []
    short_periods = 0
    long_periods = 0
    total_short_mwh = 0.0
    total_long_mwh = 0.0
    total_da_procured_mwh = 0.0

    errors = []

    for idx, pt in enumerate(timeseries):
        sp = pt.get("settlementPeriod", (idx % 48) + 1)
        sp_idx = min(max(sp - 1, 0), 47)
        
        if demand_mode == "winter_profile":
            factor = TYPICAL_WINTER_PROFILE_48[sp_idx]
            demand_mw = peak_demand_mw * factor
        else:
            demand_mw = peak_demand_mw

        act_wind = pt.get("actual")
        da_wind = pt.get("dayAheadForecast")

        if da_wind is not None and act_wind is not None:
            da_thermal_needed = max(0.0, demand_mw - da_wind)
            act_thermal_needed = max(0.0, demand_mw - act_wind)

            imbalance_mw = act_thermal_needed - da_thermal_needed
            imbalance_mwh = imbalance_mw * 0.5
            
            total_da_procured_mwh += da_thermal_needed * 0.5

            if imbalance_mw > 10.0:
                short_periods += 1
                total_short_mwh += imbalance_mwh
            elif imbalance_mw < -10.0:
                long_periods += 1
                total_long_mwh += abs(imbalance_mwh)

            errors.append(da_wind - act_wind)
        else:
            da_thermal_needed = None
            act_thermal_needed = None
            imbalance_mw = None
            imbalance_mwh = None

        schedule.append({
            "startTime": pt.get("startTime"),
            "label": pt.get("label"),
            "settlementPeriod": sp,
            "demandMw": round(demand_mw, 1),
            "windForecastMw": da_wind,
            "actualWindMw": act_wind,
            "daThermalProcurementMw": round(da_thermal_needed, 1) if da_thermal_needed is not None else None,
            "actualThermalNeededMw": round(act_thermal_needed, 1) if act_thermal_needed is not None else None,
            "imbalanceMw": round(imbalance_mw, 1) if imbalance_mw is not None else None,
            "imbalanceMwh": round(imbalance_mwh, 1) if imbalance_mwh is not None else None,
            "status": "SHORT" if (imbalance_mw and imbalance_mw > 10) else ("LONG" if (imbalance_mw and imbalance_mw < -10) else "BALANCED")
        })

    if errors:
        abs_err = np.abs(errors)
        recommended_buffer_mw = float(np.percentile(abs_err, 90) if reserve_confidence == "p90" else np.mean(abs_err))
    else:
        recommended_buffer_mw = 1000.0

    return {
        "peakDemandMw": peak_demand_mw,
        "demandMode": demand_mode,
        "recommendedBufferMw": round(recommended_buffer_mw, 1),
        "totalDaThermalProcuredMwh": round(total_da_procured_mwh, 1),
        "shortExposure": {
            "periodCount": short_periods,
            "totalMwh": round(total_short_mwh, 1),
            "riskSummary": "High cashout exposure if wind is over-forecasted"
        },
        "longExposure": {
            "periodCount": long_periods,
            "totalMwh": round(total_long_mwh, 1),
            "riskSummary": "Spill/curtailment or sell-back discount risk"
        },
        "schedule": schedule
    }
