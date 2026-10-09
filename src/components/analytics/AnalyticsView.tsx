import React, { useMemo, useState } from 'react';
import { useDetection } from '../../context/DetectionContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { getClassColor } from '../../services/cocoClasses';
import { storageService } from '../../services/storage';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  Layers,
} from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const { logs, currentSessionId } = useDetection();
  const [dateFilter, setDateFilter] = useState<'today' | '7d' | '30d' | 'all'>('all');

  // Filter logs by date range
  const filteredLogs = useMemo(() => {
    if (dateFilter === 'all') return logs;
    const now = Date.now();
    let duration = 24 * 60 * 60 * 1000;
    if (dateFilter === '7d') duration = 7 * 24 * 60 * 60 * 1000;
    if (dateFilter === '30d') duration = 30 * 24 * 60 * 60 * 1000;

    return logs.filter(l => now - new Date(l.timestamp).getTime() <= duration);
  }, [logs, dateFilter]);

  // Top detected categories data
  const topCategoriesData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredLogs.forEach(l => {
      counts[l.label] = (counts[l.label] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, count]) => ({
        name: name.toUpperCase(),
        count,
        fill: getClassColor(name),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [filteredLogs]);

  // Confidence distribution buckets
  const confidenceDistributionData = useMemo(() => {
    const buckets = [
      { range: '20-40%', count: 0 },
      { range: '40-60%', count: 0 },
      { range: '60-70%', count: 0 },
      { range: '70-80%', count: 0 },
      { range: '80-90%', count: 0 },
      { range: '90-100%', count: 0 },
    ];

    filteredLogs.forEach(l => {
      const pct = l.confidence * 100;
      if (pct < 40) buckets[0].count++;
      else if (pct < 60) buckets[1].count++;
      else if (pct < 70) buckets[2].count++;
      else if (pct < 80) buckets[3].count++;
      else if (pct < 90) buckets[4].count++;
      else buckets[5].count++;
    });

    return buckets;
  }, [filteredLogs]);

  // Detections by session breakdown
  const sessionBreakdownData = useMemo(() => {
    const sessions: Record<string, { count: number; classes: Set<string> }> = {};
    filteredLogs.forEach(l => {
      if (!sessions[l.sessionId]) {
        sessions[l.sessionId] = { count: 0, classes: new Set() };
      }
      sessions[l.sessionId].count++;
      sessions[l.sessionId].classes.add(l.label);
    });

    return Object.entries(sessions)
      .map(([sessionId, data]) => ({
        sessionId,
        count: data.count,
        uniqueClasses: data.classes.size,
        isCurrent: sessionId === currentSessionId,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [filteredLogs, currentSessionId]);

  // Key KPI calculations
  const totalEvents = filteredLogs.length;
  const uniqueCategoriesCount = new Set(filteredLogs.map(l => l.label)).size;
  const topCategoryName = topCategoriesData.length > 0 ? topCategoriesData[0].name : 'N/A';
  const averageConfidence = totalEvents > 0
    ? Math.round((filteredLogs.reduce((acc, curr) => acc + curr.confidence, 0) / totalEvents) * 100)
    : 0;

  const handleExportAnalyticsCSV = () => {
    storageService.exportLogsToCSV(filteredLogs, `visionpulse_analytics_report_${Date.now()}.csv`);
  };

  if (logs.length === 0) {
    return (
      <div className="animate-fade-in">
        <div className="view-heading">
          <div>
            <h2>Computer Vision Analytics</h2>
            <p>Statistical breakdown of real-time detections, category frequencies, and confidence</p>
          </div>
        </div>

        <div className="card-panel">
          <div style={{ textAlign: 'center', padding: '5rem 1.5rem', color: 'var(--text-muted)' }}>
            <BarChart3 size={48} style={{ margin: '0 auto 1.25rem auto', opacity: 0.35 }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>
              No Detection Analytics Available
            </h3>
            <p style={{ maxWidth: 460, margin: '0.5rem auto 1.5rem auto', fontSize: '0.88rem' }}>
              Run the webcam detector or process sample images to compile category distribution, confidence histograms, and velocity analytics.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* View Header */}
      <div className="view-heading">
        <div>
          <h2>Computer Vision Analytics & Insights</h2>
          <p>Distribution histograms, top object classes, and session telemetry</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Date range filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', backgroundColor: 'white', padding: '0.2rem 0.4rem', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}>
            <Calendar size={14} color="#64748b" style={{ marginLeft: 6 }} />
            {(['today', '7d', '30d', 'all'] as const).map(filter => (
              <button
                key={filter}
                className={`btn btn-sm ${dateFilter === filter ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.55rem', border: dateFilter === filter ? undefined : 'none' }}
                onClick={() => setDateFilter(filter)}
              >
                {filter === 'today' ? 'Today' : filter === '7d' ? '7 Days' : filter === '30d' ? '30 Days' : 'All Time'}
              </button>
            ))}
          </div>

          <button
            className="btn btn-secondary btn-sm"
            onClick={handleExportAnalyticsCSV}
            title="Export filtered analytics dataset to CSV"
          >
            <Download size={14} />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* KPI Highlights Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ backgroundColor: 'white', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>EVENTS IN PERIOD</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.2rem' }}>
            {totalEvents.toLocaleString()}
          </div>
        </div>

        <div style={{ backgroundColor: 'white', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>UNIQUE CLASSES</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0d9488', marginTop: '0.2rem' }}>
            {uniqueCategoriesCount}
          </div>
        </div>

        <div style={{ backgroundColor: 'white', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>MOST DETECTED CLASS</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#2563eb', marginTop: '0.2rem' }}>
            {topCategoryName}
          </div>
        </div>

        <div style={{ backgroundColor: 'white', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>MEAN CONFIDENCE</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#16a34a', marginTop: '0.2rem' }}>
            {averageConfidence}%
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Top Object Categories Bar Chart */}
        <div className="card-panel" style={{ marginBottom: 0 }}>
          <div className="card-panel-header">
            <h3 className="card-panel-title">
              <BarChart3 size={18} color="#2563eb" />
              <span>Top Detected Object Classes</span>
            </h3>
            <span className="badge badge-gray">Frequency distribution</span>
          </div>
          <div className="card-panel-body" style={{ height: 320, padding: '1.25rem 1.25rem 0.5rem 0' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topCategoriesData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={11} width={80} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                  formatter={(val: unknown) => [`${val} detections`, 'Count']}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {topCategoriesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Confidence Distribution Histogram */}
        <div className="card-panel" style={{ marginBottom: 0 }}>
          <div className="card-panel-header">
            <h3 className="card-panel-title">
              <TrendingUp size={18} color="#0d9488" />
              <span>Confidence Score Distribution</span>
            </h3>
            <span className="badge badge-gray">Model certainty spread</span>
          </div>
          <div className="card-panel-body" style={{ height: 320, padding: '1.25rem 1.25rem 0.5rem 0' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={confidenceDistributionData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="range" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                  formatter={(val: unknown) => [`${val} events`, 'Volume']}
                />
                <Bar dataKey="count" fill="#0d9488" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Session Breakdown Table Card */}
      <div className="card-panel">
        <div className="card-panel-header">
          <h3 className="card-panel-title">
            <Layers size={18} color="#2563eb" />
            <span>Detection Volume by Session</span>
          </h3>
          <span className="badge badge-blue">Multi-session ledger</span>
        </div>
        <div className="card-panel-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Session ID</th>
                  <th>Status</th>
                  <th>Detections Logged</th>
                  <th>Unique Classes</th>
                  <th>Share of Total</th>
                </tr>
              </thead>
              <tbody>
                {sessionBreakdownData.map(s => {
                  const pct = totalEvents > 0 ? Math.round((s.count / totalEvents) * 100) : 0;
                  return (
                    <tr key={s.sessionId}>
                      <td style={{ fontFamily: 'JetBrains Mono', fontWeight: 600, color: 'var(--text-main)' }}>
                        {s.sessionId}
                      </td>
                      <td>
                        {s.isCurrent ? (
                          <span className="badge badge-green">Current Active</span>
                        ) : (
                          <span className="badge badge-gray">Archived</span>
                        )}
                      </td>
                      <td style={{ fontWeight: 700 }}>{s.count.toLocaleString()}</td>
                      <td>{s.uniqueClasses} categories</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ width: 60, height: 6, backgroundColor: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ width: `${pct}%`, height: '100%', backgroundColor: '#2563eb' }} />
                          </div>
                          <span style={{ fontSize: '0.8rem', fontFamily: 'JetBrains Mono' }}>{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
