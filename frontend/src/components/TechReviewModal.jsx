import React from 'react';
import { X, Server, Database, Layers, ShieldCheck, GitBranch, Cpu, Terminal } from 'lucide-react';

export default function TechReviewModal({ onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '850px' }}>
        <div className="modal-header">
          <div>
            <span className="badge-tag" style={{ background: 'rgba(14, 165, 233, 0.2)', color: '#7dd3fc', marginBottom: '4px' }}>
              Internal Technical Review
            </span>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Software Architecture & System Design Specs</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {}
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.25rem', borderRadius: 8, border: '1px solid var(--border-color)' }}>
            <h4 style={{ color: '#38bdf8', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Layers size={16} /> 1. End-to-End System Topology
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
              <div style={{ background: '#1e293b', padding: '0.75rem', borderRadius: 6, border: '1px solid #334155' }}>
                <div style={{ color: '#34d399', fontWeight: 700, fontSize: '0.85rem' }}>React 19 + Vite</div>
                <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px' }}>
                  SPA with Recharts, interactive settlement filtering, dynamic simulation sliders, CSV stream exporter.
                </p>
              </div>

              <div style={{ background: '#1e293b', padding: '0.75rem', borderRadius: 6, border: '1px solid #334155' }}>
                <div style={{ color: '#60a5fa', fontWeight: 700, fontSize: '0.85rem' }}>Python FastAPI + NumPy</div>
                <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px' }}>
                  High-speed asynchronous REST API, vectorized analytics, gate-closure cutoff matching, procurement engine.
                </p>
              </div>

              <div style={{ background: '#1e293b', padding: '0.75rem', borderRadius: 6, border: '1px solid #334155' }}>
                <div style={{ color: '#f59e0b', fontWeight: 700, fontSize: '0.85rem' }}>SQLite Ingestion Cache</div>
                <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px' }}>
                  Indexed local cache of 1,488 actuals & 18,488 forecasts. Zero external latency, fully offline-ready.
                </p>
              </div>

              <div style={{ background: '#1e293b', padding: '0.75rem', borderRadius: 6, border: '1px solid #334155' }}>
                <div style={{ color: '#a855f7', fontWeight: 700, fontSize: '0.85rem' }}>Elexon BMRS OpenAPI</div>
                <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px' }}>
                  Direct ingestion from /datasets/FUELHH/stream (actuals) & /datasets/WINDFOR/stream (forecasts).
                </p>
              </div>
            </div>
          </div>

          {}
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.25rem', borderRadius: 8, border: '1px solid var(--border-color)' }}>
            <h4 style={{ color: '#10b981', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={16} /> 2. Day-Ahead Gate-Closure Matching (No Lookahead Leakage)
            </h4>
            <p style={{ fontSize: '0.8rem', color: '#cbd5e1', lineHeight: '1.6' }}>
              A fatal mistake in energy forecasting tools is querying the <em>latest available</em> forecast published minutes before delivery. In reality, Day-Ahead bids are submitted on <strong>D-1 at 11:00 or 12:00 GMT</strong>.
              Our engine enforces:
            </p>
            <div style={{ background: '#0f172a', padding: '0.75rem', borderRadius: 6, margin: '0.5rem 0', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#38bdf8' }}>
              Cutoff = (DeliveryDate - 1 day) + "T" + GateClosureTime + "Z"<br />
              DayAheadForecast(t) = MAX(publishTime) WHERE publishTime &lt;= Cutoff AND startTime == FloorHour(t)
            </div>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              This guarantees 100% empirical fidelity with the real information set possessed by the trading desk.
            </p>
          </div>

          {}
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.25rem', borderRadius: 8, border: '1px solid var(--border-color)' }}>
            <h4 style={{ color: '#f59e0b', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Cpu size={16} /> 3. Quantitative Error Formulation
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.75rem', color: '#cbd5e1' }}>
              <div>
                <strong>Mean Absolute Error (MAE):</strong>
                <div style={{ fontFamily: 'var(--font-mono)', color: '#34d399', margin: '2px 0' }}>MAE = (1/N) * Σ |Forecast_t - Actual_t|</div>
                Measures average magnitude of procurement miss.
              </div>
              <div>
                <strong>Root Mean Squared Error (RMSE):</strong>
                <div style={{ fontFamily: 'var(--font-mono)', color: '#38bdf8', margin: '2px 0' }}>RMSE = √[(1/N) * Σ (Forecast_t - Actual_t)²]</div>
                Penalizes large error swings where thermal peaking plants must be quickly dispatched.
              </div>
              <div>
                <strong>Mean Bias (ME):</strong>
                <div style={{ fontFamily: 'var(--font-mono)', color: '#f87171', margin: '2px 0' }}>ME = (1/N) * Σ (Forecast_t - Actual_t)</div>
                Sign indicates systemic over-forecasting (+) vs under-forecasting (-).
              </div>
              <div>
                <strong>Value-at-Risk Quantiles:</strong>
                <div style={{ fontFamily: 'var(--font-mono)', color: '#fbbf24', margin: '2px 0' }}>P90 Buffer = Percentile(90, |Errors|)</div>
                Slices tail risk for setting procurement reserve buffers.
              </div>
            </div>
          </div>

          {}
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.25rem', borderRadius: 8, border: '1px solid var(--border-color)' }}>
            <h4 style={{ color: '#a855f7', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Terminal size={16} /> 4. Containerization & Testing
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.78rem', color: '#cbd5e1' }}>
              <li>✔ <strong>Automated Pytest Suite:</strong> Unit & integration tests for all API routes, metrics math, and procurement simulator.</li>
              <li>✔ <strong>Multi-stage Docker:</strong> Standalone `Dockerfile` for backend & frontend, plus unified `docker-compose.yml`.</li>
              <li>✔ <strong>Unified Production Server:</strong> FastAPI serves optimized React static bundle directly in single-container mode for Vercel/Heroku/Render.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
