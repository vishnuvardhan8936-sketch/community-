import React, { useMemo } from 'react';
import { useDetection } from '../../context/DetectionContext';
import { StatCard } from '../common/StatCard';
import { SystemStatusCard } from './SystemStatusCard';
import { RecentActivityFeed } from './RecentActivityFeed';
import { HistoryChart } from './HistoryChart';
import {
  Layers,
  Sparkles,
  Zap,
  Gauge,
  Camera,
  ArrowRight
} from 'lucide-react';
import type { ViewTab } from '../../types/detection';

interface DashboardViewProps {
  onNavigateTab: (tab: ViewTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigateTab }) => {
  const { logs, currentSessionId, isCameraActive } = useDetection();

  // Calculate live application metrics
  const sessionLogs = useMemo(
    () => logs.filter(l => l.sessionId === currentSessionId),
    [logs, currentSessionId]
  );

  const uniqueCategories = useMemo(
    () => Array.from(new Set(logs.map(l => l.label))),
    [logs]
  );

  const avgConfidence = useMemo(() => {
    if (logs.length === 0) return 0;
    const sum = logs.reduce((acc, curr) => acc + curr.confidence, 0);
    return Math.round((sum / logs.length) * 100);
  }, [logs]);

  return (
    <div className="animate-fade-in">
      {/* Top Banner / Callout if camera is idle */}
      {!isCameraActive && (
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem 1.5rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            boxShadow: 'var(--shadow-card)',
            background: 'linear-gradient(90deg, #ffffff 0%, #f0f7ff 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '12px',
                backgroundColor: '#eff6ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563eb',
              }}
            >
              <Camera size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Camera Inference is currently in Standby
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                Launch your built-in laptop webcam or run a test on sample imagery to trigger real-time AI bounding boxes.
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => onNavigateTab('image-test')}
            >
              <span>Test Sample Images</span>
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => onNavigateTab('live')}
            >
              <span>Open Live Camera</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="stats-grid">
        <StatCard
          title="Total Detections"
          value={logs.length.toLocaleString()}
          subtitle="All-time persistent records"
          icon={<Layers size={20} />}
          iconColorClass="stat-icon-blue"
          trend={{ value: `${sessionLogs.length} in this session`, isPositive: true }}
        />
        <StatCard
          title="Unique Categories"
          value={uniqueCategories.length}
          subtitle="Distinct COCO object classes"
          icon={<Sparkles size={20} />}
          iconColorClass="stat-icon-teal"
          trend={{ value: `${80 - uniqueCategories.length} remaining`, isPositive: false }}
        />
        <StatCard
          title="Session Detections"
          value={sessionLogs.length}
          subtitle={`Session ${currentSessionId}`}
          icon={<Zap size={20} />}
          iconColorClass="stat-icon-green"
          trend={{ value: 'Live active', isPositive: true }}
        />
        <StatCard
          title="Avg Confidence Score"
          value={avgConfidence > 0 ? `${avgConfidence}%` : 'N/A'}
          subtitle="Model probability mean"
          icon={<Gauge size={20} />}
          iconColorClass="stat-icon-orange"
          trend={avgConfidence > 0 ? { value: 'High fidelity', isPositive: avgConfidence >= 70 } : undefined}
        />
      </div>

      {/* System Status Overview */}
      <SystemStatusCard />

      {/* Activity Velocity Chart */}
      <HistoryChart />

      {/* Recent Activity Table */}
      <RecentActivityFeed onNavigateTab={onNavigateTab} />
    </div>
  );
};
