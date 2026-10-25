import React, { useState } from 'react';
import { Download, Search, Filter } from 'lucide-react';

export default function DataTable({ data, onSelectInterval }) {
  const [filterType, setFilterType] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  if (!data || data.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        No data records available to display.
      </div>
    );
  }

  const filtered = data.filter((row) => {
    if (filterType === 'OVER' && row.forecastError <= 0) return false;
    if (filterType === 'UNDER' && row.forecastError >= 0) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        row.startTime?.toLowerCase().includes(q) ||
        row.label?.toLowerCase().includes(q) ||
        String(row.settlementPeriod).includes(q)
      );
    }
    return true;
  });

  const handleExportCsv = () => {
    const headers = [
      'startTime',
      'settlementDate',
      'settlementPeriod',
      'actualGeneration_MW',
      'dayAheadForecast_MW',
      'dayAheadPublishTime',
      'intradayForecast_MW',
      'forecastError_MW',
      'percentageError_pct'
    ];
    const rows = filtered.map((r) => [
      r.startTime,
      r.settlementDate,
      r.settlementPeriod,
      r.actual ?? '',
      r.dayAheadForecast ?? '',
      r.dayAheadPublishTime ?? '',
      r.intradayForecast ?? '',
      r.forecastError ?? '',
      r.percentageError ?? ''
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `elexon_wind_forecast_${data[0]?.settlementDate || 'data'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="glass-panel" style={{ padding: '1.25rem' }}>
      {}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', minWidth: '220px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '11px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search period / time..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '32px', width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.35rem' }}>
            <button
              className={`pill-btn ${filterType === 'ALL' ? 'active' : ''}`}
              onClick={() => setFilterType('ALL')}
            >
              All ({data.length})
            </button>
            <button
              className={`pill-btn ${filterType === 'OVER' ? 'active' : ''}`}
              onClick={() => setFilterType('OVER')}
              style={{ color: filterType === 'OVER' ? '#f87171' : undefined }}
            >
              Over-Forecast Only
            </button>
            <button
              className={`pill-btn ${filterType === 'UNDER' ? 'active' : ''}`}
              onClick={() => setFilterType('UNDER')}
              style={{ color: filterType === 'UNDER' ? '#34d399' : undefined }}
            >
              Under-Forecast Only
            </button>
          </div>
        </div>

        <button className="btn btn-outline" onClick={handleExportCsv}>
          <Download size={14} />
          <span>Export CSV ({filtered.length} rows)</span>
        </button>
      </div>

      {}
      <div className="data-table-container" style={{ maxHeight: '480px', overflowY: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>Period</th>
              <th>Target Time</th>
              <th>Actual (MW)</th>
              <th>Day-Ahead (MW)</th>
              <th>DA Publish Time</th>
              <th>Latest Intraday (MW)</th>
              <th>Forecast Error</th>
              <th>Abs Error %</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => {
              const isOver = row.forecastError > 0;
              return (
                <tr key={row.startTime}>
                  <td>SP {row.settlementPeriod}</td>
                  <td><strong>{row.label}</strong></td>
                  <td style={{ color: '#38bdf8' }}>{row.actual?.toLocaleString() ?? '—'}</td>
                  <td style={{ color: '#10b981' }}>{row.dayAheadForecast?.toLocaleString() ?? '—'}</td>
                  <td style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    {row.dayAheadPublishTime ? row.dayAheadPublishTime.replace('T', ' ').replace('Z', '') : '—'}
                  </td>
                  <td style={{ color: '#a855f7' }}>{row.intradayForecast?.toLocaleString() ?? '—'}</td>
                  <td>
                    {row.forecastError !== null ? (
                      <span className={`badge-tag ${isOver ? 'badge-over' : 'badge-under'}`}>
                        {isOver ? `+${row.forecastError}` : row.forecastError} MW
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>{row.percentageError ? `${row.percentageError}%` : '—'}</td>
                  <td>
                    <button
                      className="pill-btn"
                      onClick={() => onSelectInterval(row.startTime)}
                      style={{ fontSize: '0.7rem', padding: '2px 8px' }}
                    >
                      Inspect Versions
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
