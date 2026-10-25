import React from 'react';
import { Calendar, Clock, Filter } from 'lucide-react';

export default function Controls({
  availableDates,
  startDate,
  endDate,
  onDateChange,
  gateClosureTime,
  onGateClosureChange,
  isRangeMode,
  setIsRangeMode,
  activePreset,
  setActivePreset
}) {
  const PRESETS = [
    { id: 'jan01', label: '01 Jan (Sample Day)', start: '2026-01-01', end: '2026-01-01', isRange: false },
    { id: 'fullMonth', label: 'Full Month (01-31 Jan)', start: '2026-01-01', end: '2026-01-31', isRange: true },
    { id: 'highWind', label: 'High Wind Week (01-07 Jan)', start: '2026-01-01', end: '2026-01-07', isRange: true },
    { id: 'volatile', label: 'Volatile Surge (08-14 Jan)', start: '2026-01-08', end: '2026-01-14', isRange: true },
    { id: 'lowWind', label: 'Low Wind / Dunkelflaute (20-25 Jan)', start: '2026-01-20', end: '2026-01-25', isRange: true },
  ];

  const handlePresetClick = (preset) => {
    setActivePreset(preset.id);
    setIsRangeMode(preset.isRange);
    onDateChange(preset.start, preset.end);
  };

  return (
    <div className="control-bar">
      <div className="glass-panel controls-inner">
        {}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <div className="control-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Filter size={12} />
            <span>Market Presets & Horizons</span>
          </div>
          <div className="preset-pills">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                className={`pill-btn ${activePreset === p.id ? 'active' : ''}`}
                onClick={() => handlePresetClick(p)}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="control-item">
            <label className="control-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Calendar size={12} />
              <span>{isRangeMode ? 'Start Delivery Date' : 'Delivery Date (Jan 2026)'}</span>
            </label>
            <select
              value={startDate}
              onChange={(e) => {
                setActivePreset('custom');
                onDateChange(e.target.value, isRangeMode ? endDate : e.target.value);
              }}
            >
              {availableDates.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {isRangeMode && (
            <div className="control-item">
              <label className="control-label">End Delivery Date</label>
              <select
                value={endDate}
                onChange={(e) => {
                  setActivePreset('custom');
                  onDateChange(startDate, e.target.value);
                }}
              >
                {availableDates
                  .filter((d) => d >= startDate)
                  .map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {}
          <div className="control-item">
            <label className="control-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={12} />
              <span>Day-Ahead Gate Closure (D-1)</span>
            </label>
            <select
              value={gateClosureTime}
              onChange={(e) => onGateClosureChange(e.target.value)}
              title="Cutoff time on D-1 when Day-Ahead purchase decisions are locked"
            >
              <option value="11:00">11:00 GMT (EPEX SPOT GB Auction)</option>
              <option value="12:00">12:00 GMT (Nord Pool GB Auction)</option>
              <option value="17:00">17:00 GMT (Post-Auction Intraday)</option>
              <option value="09:00">09:00 GMT (Early Morning D-1)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
