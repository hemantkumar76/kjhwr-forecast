import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ReferenceLine
} from 'recharts';

export default function DiurnalChart({ breakdown }) {
  if (!breakdown || breakdown.length === 0) {
    return (
      <div className="glass-panel chart-box" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>No settlement period breakdown available.</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <div className="tooltip-time">
            <span>Settlement Period {data.settlementPeriod} ({data.timeLabel} GMT)</span>
          </div>
          <div className="tooltip-row">
            <span style={{ color: '#10b981' }}>● Mean Absolute Error (MAE):</span>
            <span className="tooltip-val">{data.mae?.toLocaleString()} MW</span>
          </div>
          <div className="tooltip-row">
            <span style={{ color: '#06b6d4' }}>● RMSE:</span>
            <span className="tooltip-val">{data.rmse?.toLocaleString()} MW</span>
          </div>
          <div className="tooltip-row">
            <span style={{ color: data.meanBias > 0 ? '#ef4444' : '#10b981' }}>● Average Bias:</span>
            <span className="tooltip-val" style={{ color: data.meanBias > 0 ? '#f87171' : '#34d399' }}>
              {data.meanBias > 0 ? `+${data.meanBias}` : data.meanBias} MW
            </span>
          </div>
          <div className="tooltip-row" style={{ marginTop: '0.35rem', paddingTop: '0.35rem', borderTop: '1px dashed rgba(255,255,255,0.1)' }}>
            <span style={{ color: '#38bdf8' }}>Avg Actual Generation:</span>
            <span className="tooltip-val">{data.avgActual?.toLocaleString()} MW</span>
          </div>
          <div className="tooltip-row">
            <span style={{ color: '#a855f7' }}>Avg DA Forecast:</span>
            <span className="tooltip-val">{data.avgForecast?.toLocaleString()} MW</span>
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
          <h3>Diurnal Error Profile Across 48 Settlement Periods</h3>
          <p>Analyzing forecast volatility across morning ramp (SP 12-16) and evening peak demand (SP 32-38)</p>
        </div>
      </div>

      <div style={{ width: '100%', height: 420 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={breakdown} margin={{ top: 10, right: 20, left: 10, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis
              dataKey="timeLabel"
              stroke="#64748b"
              fontSize={11}
              interval={3}
              label={{ value: 'Settlement Period Time (GMT)', position: 'insideBottom', offset: -15, fill: '#64748b', fontSize: 11 }}
            />
            <YAxis
              yAxisId="error"
              stroke="#64748b"
              fontSize={11}
              unit=" MW"
              width={75}
            />
            <YAxis
              yAxisId="gen"
              orientation="right"
              stroke="#38bdf8"
              fontSize={11}
              unit=" MW"
              width={75}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '0.8rem' }} />

            <Bar
              yAxisId="error"
              dataKey="mae"
              name="MAE (MW)"
              fill="#10b981"
              opacity={0.85}
              radius={[3, 3, 0, 0]}
            />

            <Line
              yAxisId="error"
              type="monotone"
              dataKey="meanBias"
              name="Mean Bias (F - A)"
              stroke="#ef4444"
              strokeWidth={2}
              dot={false}
            />

            <Line
              yAxisId="gen"
              type="monotone"
              dataKey="avgActual"
              name="Avg Actual Wind (MW)"
              stroke="#38bdf8"
              strokeWidth={2}
              strokeDasharray="3 3"
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
