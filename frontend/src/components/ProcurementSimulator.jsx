import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import { Flame, ShieldAlert, Cpu, CheckCircle2, Sliders } from 'lucide-react';

export default function ProcurementSimulator({
  procurementData,
  peakDemand,
  onPeakDemandChange,
  demandMode,
  onDemandModeChange,
  reserveConfidence,
  onReserveConfidenceChange
}) {
  if (!procurementData || !procurementData.schedule || procurementData.schedule.length === 0) {
    return (
      <div className="glass-panel chart-box" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>No procurement simulation data available.</p>
      </div>
    );
  }

  const {
    recommendedBufferMw = 0,
    totalDaThermalProcuredMwh = 0,
    shortExposure = {},
    longExposure = {},
    schedule = []
  } = procurementData;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <div className="tooltip-time">
            <span>{item.label} (SP {item.settlementPeriod})</span>
            <span className={`badge-tag ${item.status === 'SHORT' ? 'badge-short' : (item.status === 'LONG' ? 'badge-long' : 'badge-under')}`}>
              {item.status}
            </span>
          </div>

          <div className="tooltip-row">
            <span style={{ color: '#cbd5e1' }}>Consumer Demand:</span>
            <span className="tooltip-val">{item.demandMw?.toLocaleString()} MW</span>
          </div>

          <div className="tooltip-row">
            <span style={{ color: '#10b981' }}>Wind DA Forecast:</span>
            <span className="tooltip-val">{item.windForecastMw?.toLocaleString()} MW</span>
          </div>

          <div className="tooltip-row">
            <span style={{ color: '#38bdf8' }}>Wind Actual Outturn:</span>
            <span className="tooltip-val">{item.actualWindMw?.toLocaleString()} MW</span>
          </div>

          <div className="tooltip-row" style={{ marginTop: '0.4rem', paddingTop: '0.4rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <span style={{ color: '#f97316' }}>● Day-Ahead Thermal Buy:</span>
            <span className="tooltip-val" style={{ color: '#f97316' }}>{item.daThermalProcurementMw?.toLocaleString()} MW</span>
          </div>

          <div className="tooltip-row">
            <span style={{ color: '#fbbf24' }}>● Actual Thermal Needed:</span>
            <span className="tooltip-val">{item.actualThermalNeededMw?.toLocaleString()} MW</span>
          </div>

          <div className="tooltip-row">
            <span style={{ color: item.imbalanceMw > 0 ? '#ef4444' : '#0ea5e9' }}>
              ● Net Imbalance Exposure:
            </span>
            <span className="tooltip-val" style={{ color: item.imbalanceMw > 0 ? '#f87171' : '#38bdf8' }}>
              {item.imbalanceMw > 0 ? `+${item.imbalanceMw} MW (Short)` : `${item.imbalanceMw} MW (Long)`}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Sliders size={18} style={{ color: '#f97316' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Day-Ahead Wholesale Procurement Decision Parameters</h3>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            Thermal Procurement = max(0, Demand − Day-Ahead Wind Forecast)
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', alignItems: 'center' }}>
          {}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.82rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Utility Peak Consumer Demand:</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#f97316' }}>
                {peakDemand.toLocaleString()} MW
              </span>
            </div>
            <input
              type="range"
              min={15000}
              max={50000}
              step={1000}
              value={peakDemand}
              onChange={(e) => onPeakDemandChange(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#f97316', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#64748b' }}>
              <span>15,000 MW (Low)</span>
              <span>35,000 MW (UK Winter Avg)</span>
              <span>50,000 MW (Peak Surge)</span>
            </div>
          </div>

          {}
          <div>
            <label className="control-label" style={{ marginBottom: '0.35rem', display: 'block' }}>Demand Diurnal Curve</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                className={`pill-btn ${demandMode === 'winter_profile' ? 'active' : ''}`}
                style={{ flex: 1, padding: '0.5rem' }}
                onClick={() => onDemandModeChange('winter_profile')}
              >
                Typical UK Winter Curve (Peaks 08:30 & 18:00)
              </button>
              <button
                className={`pill-btn ${demandMode === 'flat' ? 'active' : ''}`}
                style={{ flex: 1, padding: '0.5rem' }}
                onClick={() => onDemandModeChange('flat')}
              >
                Flat Baseload (Constant MW)
              </button>
            </div>
          </div>

          {}
          <div>
            <label className="control-label" style={{ marginBottom: '0.35rem', display: 'block' }}>Hedging Reserve Margin Strategy</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                className={`pill-btn ${reserveConfidence === 'p90' ? 'active' : ''}`}
                style={{ flex: 1, padding: '0.5rem' }}
                onClick={() => onReserveConfidenceChange('p90')}
              >
                P90 Conservative Buffer
              </button>
              <button
                className={`pill-btn ${reserveConfidence === 'mae' ? 'active' : ''}`}
                style={{ flex: 1, padding: '0.5rem' }}
                onClick={() => onReserveConfidenceChange('mae')}
              >
                MAE Mean Buffer
              </button>
            </div>
          </div>
        </div>
      </div>

      {}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
        <div className="glass-panel" style={{ padding: '1rem 1.25rem', borderLeft: '4px solid #f97316' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Day-Ahead Procured Energy
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#fed7aa', margin: '0.2rem 0' }}>
            {(totalDaThermalProcuredMwh / 1000).toFixed(1)} <span style={{ fontSize: '0.85rem' }}>GWh</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
            Total wholesale thermal power bought on Day-Ahead Market
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1rem 1.25rem', borderLeft: '4px solid #ef4444' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Short Imbalance Exposure
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#fca5a5', margin: '0.2rem 0' }}>
            {(shortExposure.totalMwh || 0).toLocaleString()} <span style={{ fontSize: '0.85rem' }}>MWh</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#f87171' }}>
            {shortExposure.periodCount || 0} periods where wind under-delivered (Cashout Risk)
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1rem 1.25rem', borderLeft: '4px solid #0ea5e9' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Long Imbalance Exposure
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#7dd3fc', margin: '0.2rem 0' }}>
            {(longExposure.totalMwh || 0).toLocaleString()} <span style={{ fontSize: '0.85rem' }}>MWh</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#38bdf8' }}>
            {longExposure.periodCount || 0} periods where wind exceeded forecast (Over-bought)
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1rem 1.25rem', borderLeft: '4px solid #fbbf24' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Recommended Standby Reserve
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#fde68a', margin: '0.2rem 0' }}>
            {recommendedBufferMw.toLocaleString()} <span style={{ fontSize: '0.85rem' }}>MW</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#fbbf24' }}>
            Fast-response spinning reserve needed to cover wind shortfall
          </div>
        </div>
      </div>

      {}
      <div className="glass-panel chart-box">
        <div className="chart-header">
          <div className="chart-title-group">
            <h3>Day-Ahead Procurement Schedule vs Real-Time Outturn</h3>
            <p>Thermal generation required to meet consumer demand given wind availability</p>
          </div>
        </div>

        <div style={{ width: '100%', height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={schedule} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis
                dataKey="label"
                stroke="#64748b"
                fontSize={11}
                interval={schedule.length > 50 ? Math.floor(schedule.length / 15) : 3}
              />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                unit=" MW"
                width={75}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '0.8rem' }} />

              {}
              <Line
                type="monotone"
                dataKey="demandMw"
                name="Consumer Demand"
                stroke="#94a3b8"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
              />

              {}
              <Area
                type="monotone"
                dataKey="daThermalProcurementMw"
                name="Day-Ahead Thermal Procured"
                stroke="#f97316"
                fill="#f97316"
                fillOpacity={0.25}
                strokeWidth={2}
              />

              {}
              <Line
                type="monotone"
                dataKey="actualThermalNeededMw"
                name="Actual Thermal Outturn"
                stroke="#fbbf24"
                strokeWidth={2}
                dot={false}
              />

              {}
              <Bar
                dataKey="imbalanceMw"
                name="Imbalance Volume (MW)"
                fill="#ef4444"
                shape={(props) => {
                  const { x, y, width, height, value } = props;
                  const fill = value > 0 ? '#ef4444' : '#0ea5e9';
                  return <rect x={x} y={y} width={width} height={height} fill={fill} rx={2} />;
                }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
