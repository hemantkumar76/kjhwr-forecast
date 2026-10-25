import React, { useState } from 'react';
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
import { Eye, EyeOff, Info } from 'lucide-react';

export default function TimeSeriesChart({ data, onSelectInterval }) {
  const [showActual, setShowActual] = useState(true);
  const [showDayAhead, setShowDayAhead] = useState(true);
  const [showIntraday, setShowIntraday] = useState(true);
  const [showErrors, setShowErrors] = useState(true);

  if (!data || data.length === 0) {
    return (
      <div className="glass-panel chart-box" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>No data available for the selected range.</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <div className="tooltip-time">
            <span>{item.label} (SP {item.settlementPeriod})</span>
            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{item.settlementDate}</span>
          </div>

          <div className="tooltip-row">
            <span style={{ color: '#38bdf8' }}>● Actual Generation:</span>
            <span className="tooltip-val">{item.actual?.toLocaleString()} MW</span>
          </div>

          <div className="tooltip-row">
            <span style={{ color: '#10b981' }}>● Day-Ahead Forecast:</span>
            <span className="tooltip-val">{item.dayAheadForecast?.toLocaleString()} MW</span>
          </div>

          {item.intradayForecast && (
            <div className="tooltip-row">
              <span style={{ color: '#a855f7' }}>● Intraday Forecast:</span>
              <span className="tooltip-val">{item.intradayForecast?.toLocaleString()} MW</span>
            </div>
          )}

          <div className="tooltip-row" style={{ marginTop: '0.35rem', paddingTop: '0.35rem', borderTop: '1px dashed rgba(255,255,255,0.1)' }}>
            <span style={{ color: item.forecastError > 0 ? '#f87171' : '#34d399' }}>
              ● Forecast Error (F - A):
            </span>
            <span className="tooltip-val" style={{ color: item.forecastError > 0 ? '#f87171' : '#34d399' }}>
              {item.forecastError > 0 ? `+${item.forecastError}` : item.forecastError} MW
            </span>
          </div>

          <div className="tooltip-row">
            <span>Percentage Error:</span>
            <span className="tooltip-val">{item.percentageError ? `${item.percentageError}%` : 'N/A'}</span>
          </div>

          <div style={{ marginTop: '0.5rem', fontSize: '0.68rem', color: '#60a5fa', textAlign: 'center' }}>
            👉 Click interval to inspect historical forecast versions
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
          <h3>National Wind Generation: Actual vs Day-Ahead Forecast</h3>
          <p>30-minute settlement period resolution • National Level Elexon Feed</p>
        </div>

        {}
        <div className="legend-toggles">
          <div 
            className="legend-chip"
            onClick={() => setShowActual(!showActual)}
            style={{ opacity: showActual ? 1 : 0.4 }}
          >
            <span className="legend-dot" style={{ backgroundColor: '#38bdf8' }}></span>
            <span>Actual Outturn</span>
          </div>

          <div 
            className="legend-chip"
            onClick={() => setShowDayAhead(!showDayAhead)}
            style={{ opacity: showDayAhead ? 1 : 0.4 }}
          >
            <span className="legend-dot" style={{ backgroundColor: '#10b981' }}></span>
            <span>Day-Ahead (D-1 Cutoff)</span>
          </div>

          <div 
            className="legend-chip"
            onClick={() => setShowIntraday(!showIntraday)}
            style={{ opacity: showIntraday ? 1 : 0.4 }}
          >
            <span className="legend-dot" style={{ backgroundColor: '#a855f7' }}></span>
            <span>Intraday (Latest)</span>
          </div>

          <div 
            className="legend-chip"
            onClick={() => setShowErrors(!showErrors)}
            style={{ opacity: showErrors ? 1 : 0.4 }}
          >
            <span className="legend-dot" style={{ backgroundColor: '#ef4444' }}></span>
            <span>Error Residuals</span>
          </div>
        </div>
      </div>

      {}
      <div style={{ width: '100%', height: 350 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            onClick={(state) => {
              if (state && state.activePayload && state.activePayload.length) {
                const item = state.activePayload[0].payload;
                if (onSelectInterval) onSelectInterval(item.startTime);
              }
            }}
            margin={{ top: 10, right: 20, left: 10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis
              dataKey="label"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              interval={data.length > 50 ? Math.floor(data.length / 15) : 3}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              unit=" MW"
              width={75}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {showActual && (
              <Line
                type="monotone"
                dataKey="actual"
                name="Actual Generation"
                stroke="#38bdf8"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 6, fill: '#38bdf8', stroke: '#fff', strokeWidth: 2 }}
              />
            )}

            {showDayAhead && (
              <Line
                type="monotone"
                dataKey="dayAheadForecast"
                name="Day-Ahead Forecast"
                stroke="#10b981"
                strokeWidth={2}
                strokeDasharray="4 2"
                dot={false}
                activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
              />
            )}

            {showIntraday && (
              <Line
                type="monotone"
                dataKey="intradayForecast"
                name="Intraday Forecast"
                stroke="#a855f7"
                strokeWidth={1.5}
                dot={false}
                strokeOpacity={0.8}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {}
      {showErrors && (
        <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              FORECAST ERROR RESIDUALS (FORECAST − ACTUAL) • OVER-FORECAST (RED) VS UNDER-FORECAST (GREEN)
            </span>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
              Zero Line = Perfect Forecast
            </span>
          </div>
          <div style={{ width: '100%', height: 130 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={data}
                margin={{ top: 5, right: 20, left: 10, bottom: 0 }}
                onClick={(state) => {
                  if (state && state.activePayload && state.activePayload.length) {
                    const item = state.activePayload[0].payload;
                    if (onSelectInterval) onSelectInterval(item.startTime);
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis
                  dataKey="label"
                  stroke="#475569"
                  fontSize={10}
                  tickLine={false}
                  interval={data.length > 50 ? Math.floor(data.length / 15) : 3}
                />
                <YAxis
                  stroke="#475569"
                  fontSize={10}
                  tickLine={false}
                  unit=" MW"
                  width={75}
                />
                <ReferenceLine y={0} stroke="rgba(255,255,255,0.25)" strokeWidth={1} />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="forecastError"
                  name="Forecast Error"
                  fill="#ef4444"
                  shape={(props) => {
                    const { x, y, width, height, value } = props;
                    const fill = value > 0 ? '#ef4444' : '#10b981';
                    return <rect x={x} y={y} width={width} height={height} fill={fill} rx={2} />;
                  }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
