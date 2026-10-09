import React from 'react';
import {
  Cpu,
  Layers,
  Sparkles,
  Lock,
  Zap
} from 'lucide-react';
import { COCO_CLASSES } from '../../services/cocoClasses';

export const AboutSection: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Architecture & Tech Card */}
      <div className="card-panel" style={{ marginBottom: 0 }}>
        <div className="card-panel-header">
          <h3 className="card-panel-title">
            <Cpu size={18} color="#2563eb" />
            <span>Computer Vision System Architecture</span>
          </h3>
          <span className="badge badge-green">Production Spec</span>
        </div>
        <div className="card-panel-body" style={{ lineHeight: 1.7, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          <p style={{ marginBottom: '1rem' }}>
            <strong>VisionPulse</strong> is an enterprise-grade client-side computer vision telemetry and logging platform designed for real-time edge processing. Built on top of <strong>TensorFlow.js</strong> and the <strong>COCO-SSD (MobileNetV2)</strong> neural network, inference executes entirely inside the user's browser via WebGL shaders, achieving sub-45ms latencies without server roundtrips.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginTop: '1.25rem' }}>
            <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                <Zap size={16} color="#0d9488" />
                <span>WebGL Acceleration</span>
              </div>
              <p style={{ fontSize: '0.82rem' }}>
                Leverages GPU hardware pipelines directly through the browser canvas, enabling 30+ FPS tracking on standard laptop hardware.
              </p>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                <Lock size={16} color="#16a34a" />
                <span>Zero Server Uploads</span>
              </div>
              <p style={{ fontSize: '0.82rem' }}>
                100% private. Raw video streams and camera frames never leave your local device memory or traverse external networks.
              </p>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                <Layers size={16} color="#2563eb" />
                <span>Smart Deduplication</span>
              </div>
              <p style={{ fontSize: '0.82rem' }}>
                Features per-class event cooldown algorithms to avoid log bloat while preserving accurate time-series velocity telemetry.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* COCO 80 Categories Explorer */}
      <div className="card-panel" style={{ marginBottom: 0 }}>
        <div className="card-panel-header">
          <h3 className="card-panel-title">
            <Sparkles size={18} color="#0d9488" />
            <span>Supported Object Categories (80 COCO Classes)</span>
          </h3>
          <span className="badge badge-blue">Trained Weights</span>
        </div>
        <div className="card-panel-body">
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            The detector can identify and classify any of the following 80 real-world entities simultaneously:
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', maxHeight: 220, overflowY: 'auto', padding: '0.2rem' }}>
            {COCO_CLASSES.map(cls => (
              <span
                key={cls}
                style={{
                  fontSize: '0.78rem',
                  padding: '0.25rem 0.55rem',
                  backgroundColor: '#f1f5f9',
                  color: 'var(--text-secondary)',
                  borderRadius: '4px',
                  border: '1px solid var(--border-light)',
                  textTransform: 'capitalize',
                }}
              >
                {cls}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
