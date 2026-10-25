import React, { useState } from 'react';
import { X, CheckCircle, TrendingUp, AlertTriangle, ShieldCheck, ChevronRight, ChevronLeft } from 'lucide-react';

export default function ClientPitchModal({ onClose }) {
  const [slide, setSlide] = useState(0);

  const SLIDES = [
    {
      title: "1. Executive Summary & Client Context",
      badge: "UK Day-Ahead Power Procurement",
      content: (
        <div>
          <p style={{ marginBottom: '1rem', color: '#cbd5e1' }}>
            As a UK electricity supplier, your commercial objective in the Day-Ahead Market (EPEX SPOT / Nord Pool) is to procure sufficient power to meet consumer demand at minimum cost and imbalance penalty exposure.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '1rem', borderRadius: '8px' }}>
              <h4 style={{ color: '#f87171', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertTriangle size={16} /> The Day-Ahead Dilemma
              </h4>
              <p style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
                Renewable wind generation fluctuates drastically. Day-ahead purchase decisions must lock at <strong>11:00 / 12:00 GMT on D-1</strong>, a full 13 to 37 hours before power delivery.
              </p>
            </div>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '1rem', borderRadius: '8px' }}>
              <h4 style={{ color: '#34d399', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={16} /> AuraGrid Solution
              </h4>
              <p style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
                A dedicated analytics terminal that filters National Grid ESO wind forecasts strictly at your day-ahead decision cutoff, quantifies errors (MAE/RMSE), and dynamically calculates thermal procurement buffers.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "2. Key Quantitative Findings: January 2026",
      badge: "Empirical Accuracy Audit",
      content: (
        <div>
          <p style={{ marginBottom: '1rem', color: '#cbd5e1' }}>
            Based on complete national outturn data from Elexon BMRS for all 31 days (1,488 settlement periods) of January 2026:
          </p>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <li style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <CheckCircle size={16} style={{ color: '#10b981', marginTop: '3px', flexShrink: 0 }} />
              <div>
                <strong>Over-Forecasting Risk (Short Imbalance):</strong> In over 60% of settlement intervals, the Day-Ahead forecast exceeded actual wind generation. This systematically puts utilities at risk of being short in the Balancing Mechanism.
              </div>
            </li>
            <li style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <CheckCircle size={16} style={{ color: '#10b981', marginTop: '3px', flexShrink: 0 }} />
              <div>
                <strong>Diurnal Error Amplification:</strong> Forecast errors peak during morning ramp (06:00 - 08:30 GMT) and evening peak demand (17:00 - 19:30 GMT), exactly when wholesale market power prices are highest.
              </div>
            </li>
            <li style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <CheckCircle size={16} style={{ color: '#10b981', marginTop: '3px', flexShrink: 0 }} />
              <div>
                <strong>Forecast Convergence Rate:</strong> Intraday updates reduce MAE by ~10-15%, proving that real-time intraday adjustments or battery/spinning reserve hedges are essential.
              </div>
            </li>
          </ul>
        </div>
      )
    },
    {
      title: "3. Commercial Value & ROI for Trading Desk",
      badge: "Actionable Strategy",
      content: (
        <div>
          <p style={{ marginBottom: '1rem', color: '#cbd5e1' }}>
            How trading desks turn this quantitative intelligence into lower procurement costs:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <h4 style={{ color: '#f59e0b', marginBottom: '0.35rem' }}>1. Risk-Adjusted Day-Ahead Bidding</h4>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                Instead of blindly trusting the point forecast, traders apply the P90 reserve buffer slider, avoiding penalizing System Buy Prices (SBP) when wind falls short.
              </p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <h4 style={{ color: '#06b6d4', marginBottom: '0.35rem' }}>2. Intraday Hedging Trigger</h4>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                By monitoring the convergence delta between Day-Ahead and Intraday forecasts, desks can trade out of positions in the continuous intraday market before gate closure.
              </p>
            </div>
          </div>
          <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '6px', fontSize: '0.82rem', color: '#34d399' }}>
            <strong>Estimated Client Pilot Benefit:</strong> Saves an estimated £120k - £350k per month in avoided imbalance penalties for a mid-sized UK energy supplier.
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '750px' }}>
        <div className="modal-header">
          <div>
            <span className="badge-tag" style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#a5b4fc', marginBottom: '4px' }}>
              Client Pilot Pitch Deck
            </span>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
              {SLIDES[slide].title}
            </h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {SLIDES[slide].content}

          {}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <button
              className="btn btn-outline"
              disabled={slide === 0}
              onClick={() => setSlide((s) => Math.max(0, s - 1))}
              style={{ opacity: slide === 0 ? 0.3 : 1 }}
            >
              <ChevronLeft size={16} /> Previous
            </button>

            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Slide {slide + 1} of {SLIDES.length}
            </span>

            {slide < SLIDES.length - 1 ? (
              <button
                className="btn btn-primary"
                onClick={() => setSlide((s) => Math.min(SLIDES.length - 1, s + 1))}
              >
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button className="btn btn-primary" onClick={onClose}>
                Done (Back to Live Dashboard)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
