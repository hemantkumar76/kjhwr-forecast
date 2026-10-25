import React, { useState } from 'react';
import { X, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

export default function SyncModal({ onClose, onSyncComplete }) {
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState('2026-01-31');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSync = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const resp = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startDate, endDate })
      });
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.detail || 'Sync failed');
      }
      setResult(data);
      if (onSyncComplete) onSyncComplete();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '550px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <RefreshCw size={18} style={{ color: '#10b981' }} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Sync Elexon BMRS Live Stream</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ fontSize: '0.82rem', color: '#cbd5e1', marginBottom: '1.25rem' }}>
            Pull the latest actuals (FUELHH) and forecasts (WINDFOR) directly from Elexon BMRS Insights API into the local SQLite database.
          </p>

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ flex: 1 }}>
              <label className="control-label" style={{ marginBottom: '0.35rem', display: 'block' }}>Start Date</label>
              <input
                type="text"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="YYYY-MM-DD"
                style={{ width: '100%' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label className="control-label" style={{ marginBottom: '0.35rem', display: 'block' }}>End Date</label>
              <input
                type="text"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="YYYY-MM-DD"
                style={{ width: '100%' }}
              />
            </div>
          </div>

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 6, color: '#fca5a5', fontSize: '0.8rem', marginBottom: '1rem' }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {result && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 6, color: '#34d399', fontSize: '0.8rem', marginBottom: '1rem' }}>
              <CheckCircle size={16} />
              <span>Synced {result.actualsSynced} actuals and {result.forecastsSynced} forecasts successfully!</span>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSync}
              disabled={loading}
            >
              {loading ? (
                <>
                  <RefreshCw size={14} className="spin" />
                  <span>Syncing from Elexon...</span>
                </>
              ) : (
                <>
                  <RefreshCw size={14} />
                  <span>Start Synchronization</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
