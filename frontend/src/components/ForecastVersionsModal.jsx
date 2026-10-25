import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import { X, History, TrendingDown, Clock } from 'lucide-react';

export default function ForecastVersionsModal({ startTime, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!startTime) return;
    setLoading(true);
    fetch(`/api/forecast-versions?startTime=${encodeURIComponent(startTime)}`)
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching forecast versions:', err);
        setLoading(false);
      });
  }, [startTime]);

  if (!startTime) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '850px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <History size={18} style={{ color: '#a855f7' }} />
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Forecast Version Convergence Analysis</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Tracking how National Grid forecast revisions evolved leading up to delivery: {startTime}
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
              Loading historical forecast publications...
            </div>
          ) : !data || !data.versions || data.versions.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
              No historical forecast revisions found for this interval.
            </div>
          ) : (
            <div>
              {}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 8, marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Settlement Period:</span>
                  <div style={{ fontWeight: 700 }}>SP {data.settlementPeriod} ({data.settlementDate})</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Observed Actual Generation:</span>
                  <div style={{ fontWeight: 700, color: '#38bdf8' }}>{data.actualGeneration?.toLocaleString()} MW</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Total Forecast Versions Published:</span>
                  <div style={{ fontWeight: 700, color: '#a855f7' }}>{data.versions.length} versions</div>
                </div>
              </div>

              {}
              <div style={{ width: '100%', height: 260, marginBottom: '1.25rem' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.versions} margin={{ top: 10, right: 20, left: 10, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis
                      dataKey="label"
                      stroke="#64748b"
                      fontSize={10}
                      label={{ value: 'Forecast Publication Time', position: 'insideBottom', offset: -15, fill: '#64748b', fontSize: 10 }}
                    />
                    <YAxis
                      stroke="#64748b"
                      fontSize={10}
                      unit=" MW"
                      width={70}
                    />
                    {data.actualGeneration !== null && (
                      <ReferenceLine
                        y={data.actualGeneration}
                        stroke="#38bdf8"
                        strokeDasharray="4 4"
                        label={{ value: `Actual: ${data.actualGeneration} MW`, fill: '#38bdf8', fontSize: 10, position: 'top' }}
                      />
                    )}
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const v = payload[0].payload;
                          return (
                            <div className="custom-tooltip">
                              <div className="tooltip-time">Published: {v.publishTime}</div>
                              <div className="tooltip-row">
                                <span>Forecast Generation:</span>
                                <span className="tooltip-val" style={{ color: '#a855f7' }}>{v.forecastGeneration?.toLocaleString()} MW</span>
                              </div>
                              <div className="tooltip-row">
                                <span>Lead Time to Delivery:</span>
                                <span className="tooltip-val">{v.leadTimeHours} hours</span>
                              </div>
                              <div className="tooltip-row">
                                <span>Error (F - A):</span>
                                <span className="tooltip-val" style={{ color: v.error > 0 ? '#f87171' : '#34d399' }}>
                                  {v.error > 0 ? `+${v.error}` : v.error} MW
                                </span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="forecastGeneration"
                      name="Forecast MW"
                      stroke="#a855f7"
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: '#a855f7' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {}
              <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: 8 }}>
                <table>
                  <thead>
                    <tr>
                      <th>Publish Time</th>
                      <th>Lead Time</th>
                      <th>Forecast MW</th>
                      <th>Error vs Actual</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.versions.map((ver, idx) => (
                      <tr key={idx}>
                        <td>{ver.publishTime}</td>
                        <td>{ver.leadTimeHours} hrs</td>
                        <td style={{ color: '#a855f7', fontWeight: 600 }}>{ver.forecastGeneration?.toLocaleString()} MW</td>
                        <td>
                          <span className={`badge-tag ${ver.error > 0 ? 'badge-over' : 'badge-under'}`}>
                            {ver.error > 0 ? `+${ver.error}` : ver.error} MW
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
