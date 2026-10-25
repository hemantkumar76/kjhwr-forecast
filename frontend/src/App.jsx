import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Controls from './components/Controls';
import KpiCards from './components/KpiCards';
import TimeSeriesChart from './components/TimeSeriesChart';
import DiurnalChart from './components/DiurnalChart';
import DistributionChart from './components/DistributionChart';
import ProcurementSimulator from './components/ProcurementSimulator';
import DataTable from './components/DataTable';
import ForecastVersionsModal from './components/ForecastVersionsModal';
import ClientPitchModal from './components/ClientPitchModal';
import TechReviewModal from './components/TechReviewModal';
import SyncModal from './components/SyncModal';

import {
  LineChart as LineChartIcon,
  Clock,
  BarChart3,
  Flame,
  Table as TableIcon,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

export default function App() {
  const [availableDates, setAvailableDates] = useState([]);
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState('2026-01-01');
  const [isRangeMode, setIsRangeMode] = useState(false);
  const [activePreset, setActivePreset] = useState('jan01');
  const [gateClosureTime, setGateClosureTime] = useState('11:00');

  const [activeTab, setActiveTab] = useState('timeseries');

  const [timeseriesData, setTimeseriesData] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [hourlyData, setHourlyData] = useState([]);
  const [distData, setDistData] = useState(null);
  const [procurementData, setProcurementData] = useState(null);

  const [peakDemand, setPeakDemand] = useState(35000);
  const [demandMode, setDemandMode] = useState('winter_profile');
  const [reserveConfidence, setReserveConfidence] = useState('p90');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedInterval, setSelectedInterval] = useState(null);
  const [showPitchModal, setShowPitchModal] = useState(false);
  const [showTechModal, setShowTechModal] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);

  useEffect(() => {
    fetch('/api/dates')
      .then((res) => {
        if (!res.ok) throw new Error('API server unreachable');
        return res.json();
      })
      .then((data) => {
        if (data.dates && data.dates.length > 0) {
          setAvailableDates(data.dates);
        }
      })
      .catch((err) => {
        console.error('Failed to load available dates:', err);
        setError('Could not connect to backend API. Please ensure the Python server is running.');
      });
  }, []);

  const fetchData = () => {
    setLoading(true);
    setError(null);

    const actualEnd = isRangeMode ? endDate : startDate;
    const queryParams = `startDate=${startDate}&endDate=${actualEnd}&gateClosureTime=${gateClosureTime}`;

    Promise.all([
      fetch(`/api/timeseries?${queryParams}`).then((r) => r.json()),
      fetch(`/api/metrics?${queryParams}`).then((r) => r.json()),
      fetch(`/api/hourly?${queryParams}`).then((r) => r.json()),
      fetch(`/api/distribution?${queryParams}`).then((r) => r.json()),
      fetch(
        `/api/procurement?${queryParams}&peakDemandMw=${peakDemand}&demandMode=${demandMode}&reserveConfidence=${reserveConfidence}`
      ).then((r) => r.json())
    ])
      .then(([tsRes, metricsRes, hourlyRes, distRes, procRes]) => {
        setTimeseriesData(tsRes.data || []);
        setMetrics(metricsRes.metrics || null);
        setHourlyData(hourlyRes.breakdown || []);
        setDistData(distRes || null);
        setProcurementData(procRes || null);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching dashboard data:', err);
        setError('Error fetching analytical dataset from API.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, [startDate, endDate, isRangeMode, gateClosureTime, peakDemand, demandMode, reserveConfidence]);

  const handleDateChange = (newStart, newEnd) => {
    setStartDate(newStart);
    setEndDate(newEnd);
  };

  return (
    <div className="app-root">
      {}
      <Header
        onOpenPitch={() => setShowPitchModal(true)}
        onOpenTech={() => setShowTechModal(true)}
        onOpenSync={() => setShowSyncModal(true)}
        activeDatesCount={availableDates.length}
      />

      {}
      <Controls
        availableDates={availableDates}
        startDate={startDate}
        endDate={endDate}
        onDateChange={handleDateChange}
        gateClosureTime={gateClosureTime}
        onGateClosureChange={setGateClosureTime}
        isRangeMode={isRangeMode}
        setIsRangeMode={setIsRangeMode}
        activePreset={activePreset}
        setActivePreset={setActivePreset}
      />

      {}
      <main className="main-content">
        {error && (
          <div className="glass-panel" style={{ padding: '1rem', borderLeft: '4px solid #ef4444', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#fca5a5' }}>
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {}
        <KpiCards
          metrics={metrics}
          procurementBuffer={procurementData?.recommendedBufferMw}
        />

        {}
        <div className="tabs-nav">
          <button
            className={`tab-btn ${activeTab === 'timeseries' ? 'active' : ''}`}
            onClick={() => setActiveTab('timeseries')}
          >
            <LineChartIcon size={16} />
            <span>Time Series & Residuals</span>
          </button>

          <button
            className={`tab-btn ${activeTab === 'procurement' ? 'active' : ''}`}
            onClick={() => setActiveTab('procurement')}
          >
            <Flame size={16} />
            <span>Day-Ahead Procurement Simulator</span>
          </button>

          <button
            className={`tab-btn ${activeTab === 'diurnal' ? 'active' : ''}`}
            onClick={() => setActiveTab('diurnal')}
          >
            <Clock size={16} />
            <span>48 Settlement Periods Diurnal Profile</span>
          </button>

          <button
            className={`tab-btn ${activeTab === 'distribution' ? 'active' : ''}`}
            onClick={() => setActiveTab('distribution')}
          >
            <BarChart3 size={16} />
            <span>Error Distribution & Risk Quantiles</span>
          </button>

          <button
            className={`tab-btn ${activeTab === 'table' ? 'active' : ''}`}
            onClick={() => setActiveTab('table')}
          >
            <TableIcon size={16} />
            <span>Half-Hour Settlement Table</span>
          </button>
        </div>

        {}
        {loading ? (
          <div className="glass-panel chart-box" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
            <RefreshCw size={24} style={{ color: '#10b981', animation: 'spin 1s linear infinite' }} />
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Computing metrics and matching day-ahead gate closures...</p>
          </div>
        ) : (
          <>
            {activeTab === 'timeseries' && (
              <TimeSeriesChart
                data={timeseriesData}
                onSelectInterval={(st) => setSelectedInterval(st)}
              />
            )}

            {activeTab === 'procurement' && (
              <ProcurementSimulator
                procurementData={procurementData}
                peakDemand={peakDemand}
                onPeakDemandChange={setPeakDemand}
                demandMode={demandMode}
                onDemandModeChange={setDemandMode}
                reserveConfidence={reserveConfidence}
                onReserveConfidenceChange={setReserveConfidence}
              />
            )}

            {activeTab === 'diurnal' && (
              <DiurnalChart breakdown={hourlyData} />
            )}

            {activeTab === 'distribution' && (
              <DistributionChart distData={distData} metrics={metrics} />
            )}

            {activeTab === 'table' && (
              <DataTable
                data={timeseriesData}
                onSelectInterval={(st) => setSelectedInterval(st)}
              />
            )}
          </>
        )}
      </main>

      {}
      {selectedInterval && (
        <ForecastVersionsModal
          startTime={selectedInterval}
          onClose={() => setSelectedInterval(null)}
        />
      )}

      {}
      {showPitchModal && (
        <ClientPitchModal onClose={() => setShowPitchModal(false)} />
      )}

      {}
      {showTechModal && (
        <TechReviewModal onClose={() => setShowTechModal(false)} />
      )}

      {}
      {showSyncModal && (
        <SyncModal
          onClose={() => setShowSyncModal(false)}
          onSyncComplete={() => {
            fetchData();
            setShowSyncModal(false);
          }}
        />
      )}
    </div>
  );
}
