import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from 'recharts';

export default function DistributionChart({ distData, metrics }) {
  if (!distData || !distData.distribution || distData.distribution.length === 0) {
    return (
      <div className="glass-panel chart-box" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>No distribution data available.</p>
      </div>
    );
  }

  const { p10Error = 0, p50Error = 0, p90Error = 0 } = metrics || {};

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <div className="tooltip-time">
            <span>Range: {data.range}</span>
          </div>
          <div className="tooltip-row">
            <span>Count:</span>
            <span className="tooltip-val">{data.count} intervals</span>
          </div>
          <div className="tooltip-row">
            <span>Probability:</span>
            <span className="tooltip-val">{data.pct}%</span>
          </div>
          <div className="tooltip-row" style={{ marginTop: '0.35rem', color: data.isOverForecast ? '#f87171' : '#34d399' }}>
            <span>Impact:</span>
            <span className="tooltip-val">
              {data.isOverForecast ? 'Over-Forecast (Under-procurement Short)' : 'Under-Forecast (Over-procurement Long)'}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-panel chart-box">
      <div className="chart-header">
        <div className="chart-title-group">
          <h3>Forecast Error Probability Distribution & Value-at-Risk</h3>
          <p>Statistical distribution of Day-Ahead Forecast Error (Forecast − Actual) in MW</p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div className="badge-tag" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5' }}>
            P90 Upper Risk: +{p90Error?.toLocaleString()} MW
          </div>
          <div className="badge-tag" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#7dd3fc' }}>
            P50 Median Bias: {p50Error > 0 ? `+${p50Error}` : p50Error} MW
          </div>
          <div className="badge-tag" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#6ee7b7' }}>
            P10 Lower Bound: {p10Error?.toLocaleString()} MW
          </div>
        </div>
      </div>

      <div style={{ width: '100%', height: 380 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={distData.distribution} margin={{ top: 10, right: 20, left: 10, bottom: 45 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis
              dataKey="range"
              stroke="#64748b"
              fontSize={10}
              angle={-25}
              textAnchor="end"
              height={50}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              unit=" intervals"
              width={75}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" name="Frequency">
              {distData.distribution.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.isOverForecast ? '#ef4444' : '#10b981'}
                  opacity={0.85}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.02)', borderRadius: 8, fontSize: '0.75rem', color: '#94a3b8' }}>
        <span>← Under-Forecasting: Spills thermal or forces sell-back</span>
        <span style={{ fontWeight: 600, color: '#f1f5f9' }}>Center = Zero Error</span>
        <span>Over-Forecasting: Leaves utility short in real-time cashout →</span>
      </div>
    </div>
  );
}
