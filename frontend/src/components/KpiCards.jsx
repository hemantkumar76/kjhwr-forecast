import React from 'react';
import { Activity, AlertTriangle, ShieldCheck, TrendingUp, Zap, HelpCircle } from 'lucide-react';

export default function KpiCards({ metrics, procurementBuffer }) {
  if (!metrics) return null;

  const {
    mae = 0,
    rmse = 0,
    meanBias = 0,
    nmae = 0,
    mape = 0,
    overForecastPct = 0,
    underForecastPct = 0,
    meanActual = 0,
    meanForecast = 0,
    correlation = 0,
    intradayMae = 0,
    improvementPct = 0
  } = metrics;

  const isOverBias = meanBias > 0;

  return (
    <div className="kpi-grid">
      {}
      <div className="glass-panel kpi-card" style={{ '--card-accent': '#10b981' }}>
        <div className="kpi-top">
          <span className="kpi-title">Mean Absolute Error (MAE)</span>
          <div className="kpi-icon">
            <Activity size={16} />
          </div>
        </div>
        <div className="kpi-value-row">
          <span className="kpi-val">{mae.toLocaleString()}</span>
          <span className="kpi-unit">MW</span>
        </div>
        <div className="kpi-footer">
          <span>Normalized MAE: <strong>{nmae}%</strong></span>
          <span title="Comparison with Intraday latest forecast" style={{ color: improvementPct >= 0 ? '#34d399' : '#f87171' }}>
            Intraday MAE: {intradayMae} MW
          </span>
        </div>
      </div>

      {}
      <div className="glass-panel kpi-card" style={{ '--card-accent': '#06b6d4' }}>
        <div className="kpi-top">
          <span className="kpi-title">Root Mean Squared Error (RMSE)</span>
          <div className="kpi-icon">
            <TrendingUp size={16} />
          </div>
        </div>
        <div className="kpi-value-row">
          <span className="kpi-val">{rmse.toLocaleString()}</span>
          <span className="kpi-unit">MW</span>
        </div>
        <div className="kpi-footer">
          <span>Penalizes Large Volatility</span>
          <span>RMSE/MAE: <strong>{mae > 0 ? (rmse / mae).toFixed(2) : '1.0'}x</strong></span>
        </div>
      </div>

      {}
      <div className="glass-panel kpi-card" style={{ '--card-accent': isOverBias ? '#ef4444' : '#10b981' }}>
        <div className="kpi-top">
          <span className="kpi-title">Forecast Bias (F - A)</span>
          <div className="kpi-icon" style={{ color: isOverBias ? '#ef4444' : '#10b981' }}>
            <AlertTriangle size={16} />
          </div>
        </div>
        <div className="kpi-value-row">
          <span className="kpi-val" style={{ color: isOverBias ? '#f87171' : '#34d399' }}>
            {meanBias > 0 ? `+${meanBias.toLocaleString()}` : meanBias.toLocaleString()}
          </span>
          <span className="kpi-unit">MW</span>
        </div>
        <div className="bias-split-bar" title={`Over: ${overForecastPct}% | Under: ${underForecastPct}%`}>
          <div className="bias-over" style={{ width: `${overForecastPct}%` }}></div>
          <div className="bias-under" style={{ width: `${underForecastPct}%` }}></div>
        </div>
        <div className="kpi-footer" style={{ marginTop: '0.4rem' }}>
          <span style={{ color: '#f87171' }}>Over: {overForecastPct}% (Short Risk)</span>
          <span style={{ color: '#34d399' }}>Under: {underForecastPct}%</span>
        </div>
      </div>

      {}
      <div className="glass-panel kpi-card" style={{ '--card-accent': '#38bdf8' }}>
        <div className="kpi-top">
          <span className="kpi-title">Average Wind Generation</span>
          <div className="kpi-icon">
            <Zap size={16} />
          </div>
        </div>
        <div className="kpi-value-row">
          <span className="kpi-val">{meanActual.toLocaleString()}</span>
          <span className="kpi-unit">MW</span>
        </div>
        <div className="kpi-footer">
          <span>DA Forecast Mean: {meanForecast.toLocaleString()} MW</span>
          <span>Corr: <strong>{correlation}</strong></span>
        </div>
      </div>

      {}
      <div className="glass-panel kpi-card" style={{ '--card-accent': '#f59e0b' }}>
        <div className="kpi-top">
          <span className="kpi-title">Recommended Reserve Buffer</span>
          <div className="kpi-icon" style={{ color: '#f59e0b' }}>
            <ShieldCheck size={16} />
          </div>
        </div>
        <div className="kpi-value-row">
          <span className="kpi-val" style={{ color: '#fbbf24' }}>
            {(procurementBuffer || metrics.p90Error || mae).toLocaleString()}
          </span>
          <span className="kpi-unit">MW</span>
        </div>
        <div className="kpi-footer">
          <span>90% Confidence Hedging Buffer</span>
          <span style={{ color: '#94a3b8' }}>P90 Risk Margin</span>
        </div>
      </div>
    </div>
  );
}
