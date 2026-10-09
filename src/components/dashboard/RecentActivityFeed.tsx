import React from 'react';
import { useDetection } from '../../context/DetectionContext';
import { Clock, ExternalLink, Activity } from 'lucide-react';
import { getClassColor } from '../../services/cocoClasses';
import type { ViewTab } from '../../types/detection';

interface RecentActivityFeedProps {
  onNavigateTab: (tab: ViewTab) => void;
}

export const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({ onNavigateTab }) => {
  const { logs } = useDetection();

  const recentLogs = logs.slice(0, 7);

  return (
    <div className="card-panel">
      <div className="card-panel-header">
        <h3 className="card-panel-title">
          <Activity size={18} color="#2563eb" />
          <span>Recent Detection Activity</span>
        </h3>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => onNavigateTab('logs')}
          style={{ fontSize: '0.78rem' }}
        >
          <span>View All Logs</span>
          <ExternalLink size={13} />
        </button>
      </div>
      <div className="card-panel-body" style={{ padding: 0 }}>
        {recentLogs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
            <Clock size={32} style={{ margin: '0 auto 0.75rem auto', opacity: 0.5 }} />
            <p style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>No detections recorded yet</p>
            <p style={{ fontSize: '0.82rem', marginTop: '0.25rem' }}>
              Start your webcam or run an image test to populate real-time activity events.
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Object Class</th>
                  <th>Confidence</th>
                  <th>Source</th>
                  <th>Event ID</th>
                </tr>
              </thead>
              <tbody>
                {recentLogs.map(log => {
                  const classColor = getClassColor(log.label);
                  const timeStr = new Date(log.timestamp).toLocaleTimeString();

                  return (
                    <tr key={log.id}>
                      <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem' }}>
                        {timeStr}
                      </td>
                      <td>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            fontWeight: 600,
                            color: classColor,
                            backgroundColor: '#f8fafc',
                            padding: '0.2rem 0.55rem',
                            borderRadius: '4px',
                            border: `1px solid ${classColor}33`,
                          }}
                        >
                          <span
                            style={{
                              width: 7,
                              height: 7,
                              borderRadius: '50%',
                              backgroundColor: classColor,
                            }}
                          />
                          {log.label.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div
                            style={{
                              width: 50,
                              height: 6,
                              backgroundColor: '#e2e8f0',
                              borderRadius: 3,
                              overflow: 'hidden',
                            }}
                          >
                            <div
                              style={{
                                width: `${Math.round(log.confidence * 100)}%`,
                                height: '100%',
                                backgroundColor:
                                  log.confidence > 0.8
                                    ? '#16a34a'
                                    : log.confidence > 0.6
                                    ? '#2563eb'
                                    : '#ea580c',
                              }}
                            />
                          </div>
                          <span style={{ fontWeight: 600, fontSize: '0.8rem' }}>
                            {Math.round(log.confidence * 100)}%
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${log.source === 'webcam' ? 'badge-blue' : log.source === 'upload' ? 'badge-purple' : 'badge-gray'}`}>
                          {log.source}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {log.id}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
