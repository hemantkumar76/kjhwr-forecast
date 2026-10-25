import React from 'react';
import { Wind, Presentation, Code2, RefreshCw } from 'lucide-react';

export default function Header({ onOpenPitch, onOpenTech, onOpenSync, activeDatesCount }) {
  return (
    <header className="app-header">
      <div className="header-container">
        <div className="logo-group">
          <div className="logo-badge">
            <Wind size={22} strokeWidth={2.5} />
          </div>
          <div className="title-text">
            <h1>AuraGrid Energy Terminal</h1>
            <p>UK Day-Ahead Wind Forecast & Procurement Analytics • Elexon BMRS Edition</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div className="badge-live">
            <span className="live-dot"></span>
            <span>Elexon BMRS Ingested ({activeDatesCount || 31} Days Jan 2026)</span>
          </div>

          <button 
            className="btn btn-pitch"
            onClick={onOpenPitch}
            title="Open 5-minute Client Presentation & Pitch Mode"
          >
            <Presentation size={16} />
            <span>Client Pitch</span>
          </button>

          <button 
            className="btn btn-tech"
            onClick={onOpenTech}
            title="Open Technical Lead Architecture & Code Review"
          >
            <Code2 size={16} />
            <span>Tech Review</span>
          </button>

          <button 
            className="btn btn-outline"
            onClick={onOpenSync}
            title="Live Sync from Elexon BMRS API"
          >
            <RefreshCw size={15} />
            <span>Sync API</span>
          </button>
        </div>
      </div>
    </header>
  );
}
