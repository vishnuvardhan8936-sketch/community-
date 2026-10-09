import React, { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { useDetection } from '../../context/DetectionContext';
import { BarChart3 } from 'lucide-react';

type TimeRange = '15m' | '1h' | '24h' | 'all';

export const HistoryChart: React.FC = () => {
  const { logs } = useDetection();
  const [timeRange, setTimeRange] = useState<TimeRange>('1h');

  // Aggregate logs into time buckets based on selected range
  const chartData = useMemo(() => {
    if (logs.length === 0) return [];

    const now = Date.now();
    let filterMs = 60 * 60 * 1000; // 1 hour
    let bucketCount = 12;

    if (timeRange === '15m') {
      filterMs = 15 * 60 * 1000;
      bucketCount = 15;
    } else if (timeRange === '24h') {
      filterMs = 24 * 60 * 60 * 1000;
      bucketCount = 24;
    } else if (timeRange === 'all') {
      filterMs = 7 * 24 * 60 * 60 * 1000;
      bucketCount = 14;
    }

    const filteredLogs = logs.filter(l => now - new Date(l.timestamp).getTime() <= filterMs);

    const bucketSize = filterMs / bucketCount;
    const buckets: { time: string; count: number; avgConf: number; items: number[] }[] = [];

    for (let i = 0; i < bucketCount; i++) {
      const bucketStartTime = now - filterMs + i * bucketSize;
      const bucketEndTime = bucketStartTime + bucketSize;
      const dateObj = new Date(bucketStartTime);

      let label = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      if (timeRange === '24h' || timeRange === 'all') {
        label = `${dateObj.getMonth() + 1}/${dateObj.getDate()} ${dateObj.getHours()}:00`;
      }

      const matching = filteredLogs.filter(l => {
        const t = new Date(l.timestamp).getTime();
        return t >= bucketStartTime && t < bucketEndTime;
      });

      const avgConfidence = matching.length > 0
        ? Math.round((matching.reduce((acc, c) => acc + c.confidence, 0) / matching.length) * 100)
        : 0;

      buckets.push({
        time: label,
        count: matching.length,
        avgConf: avgConfidence,
        items: matching.map(m => m.confidence),
      });
    }

    return buckets;
  }, [logs, timeRange]);

  return (
    <div className="card-panel">
      <div className="card-panel-header">
        <h3 className="card-panel-title">
          <BarChart3 size={18} color="#2563eb" />
          <span>Detection Activity Velocity</span>
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          {(['15m', '1h', '24h', 'all'] as TimeRange[]).map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`btn btn-sm ${timeRange === range ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.74rem', padding: '0.25rem 0.6rem' }}
            >
              {range.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      <div className="card-panel-body" style={{ height: 280, padding: '1rem 1rem 0.5rem 0' }}>
        {logs.length === 0 ? (
          <div
            style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              fontSize: '0.88rem',
            }}
          >
            <span>No historical detection events within selected time window.</span>
            <span style={{ fontSize: '0.78rem', marginTop: '0.2rem' }}>
              Detections will plot automatically in real-time.
            </span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="time"
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  fontSize: '0.82rem',
                }}
                formatter={(val: unknown) => [`${val} detections`, 'Volume']}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#2563eb"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorCount)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
