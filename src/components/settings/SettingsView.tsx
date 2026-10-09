import React, { useState } from 'react';
import { useDetection } from '../../context/DetectionContext';
import { AboutSection } from './AboutSection';
import { ConfirmModal } from '../common/ConfirmModal';
import {
  Settings,
  Camera,
  Trash2,
  RotateCcw,
  Clock,
  Shield,
  HelpCircle
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    clearAllLogs,
    resetSession,
    currentSessionId,
  } = useDetection();

  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'settings' | 'about'>('settings');

  return (
    <div className="animate-fade-in">
      <div className="view-heading">
        <div>
          <h2>System Configuration & Platform Architecture</h2>
          <p>Customize inference parameters, camera hardware profiles, and audit policies</p>
        </div>

        {/* Sub-tab navigation */}
        <div style={{ display: 'flex', gap: '0.4rem', backgroundColor: 'white', padding: '0.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
          <button
            className={`btn btn-sm ${activeSubTab === 'settings' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ border: activeSubTab === 'settings' ? undefined : 'none' }}
            onClick={() => setActiveSubTab('settings')}
          >
            <Settings size={14} />
            <span>Preferences</span>
          </button>
          <button
            className={`btn btn-sm ${activeSubTab === 'about' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ border: activeSubTab === 'about' ? undefined : 'none' }}
            onClick={() => setActiveSubTab('about')}
          >
            <HelpCircle size={14} />
            <span>System Architecture</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'about' ? (
        <AboutSection />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Hardware & Camera Settings Card */}
          <div className="card-panel" style={{ marginBottom: 0 }}>
            <div className="card-panel-header">
              <h3 className="card-panel-title">
                <Camera size={18} color="#2563eb" />
                <span>Camera Stream Hardware Configuration</span>
              </h3>
            </div>
            <div className="card-panel-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                    Sensor Resolution Target
                  </label>
                  <select
                    className="select-control"
                    style={{ width: '100%' }}
                    value={settings.cameraResolution}
                    onChange={e => updateSettings({ cameraResolution: e.target.value as 'default' | '720p' | '1080p' })}
                  >
                    <option value="default">Standard VGA (640 × 480) - Maximum FPS</option>
                    <option value="720p">High Definition 720p (1280 × 720)</option>
                    <option value="1080p">Full HD 1080p (1920 × 1080) - Higher Accuracy</option>
                  </select>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.3rem' }}>
                    Changes take effect next time camera stream starts.
                  </span>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                    Camera Facing Orientation
                  </label>
                  <select
                    className="select-control"
                    style={{ width: '100%' }}
                    value={settings.facingMode}
                    onChange={e => updateSettings({ facingMode: e.target.value as 'user' | 'environment' })}
                  >
                    <option value="user">Front-Facing Camera (Laptop Built-in / Selfie)</option>
                    <option value="environment">Rear / External Camera</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Logging & Deduplication Policy */}
          <div className="card-panel" style={{ marginBottom: 0 }}>
            <div className="card-panel-header">
              <h3 className="card-panel-title">
                <Clock size={18} color="#0d9488" />
                <span>Event Deduplication & Audit Controls</span>
              </h3>
            </div>
            <div className="card-panel-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    Per-Class Logging Cooldown Window
                  </label>
                  <span style={{ fontSize: '0.84rem', fontFamily: 'JetBrains Mono', fontWeight: 700, color: '#0d9488' }}>
                    {settings.cooldownSeconds.toFixed(1)} seconds
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="10.0"
                  step="0.5"
                  value={settings.cooldownSeconds}
                  onChange={e => updateSettings({ cooldownSeconds: Number(e.target.value) })}
                  style={{ width: '100%', accentColor: '#0d9488', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  <span>0.5s (High granularity)</span>
                  <span>10.0s (Reduced log frequency)</span>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                  Prevents identical objects continuously tracked across 60 FPS video frames from spamming the audit log table.
                </p>
              </div>

              {/* Sound Notifications */}
              <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={settings.enableSoundAlerts}
                    onChange={e => updateSettings({ enableSoundAlerts: e.target.checked })}
                    style={{ accentColor: '#2563eb', width: 16, height: 16 }}
                  />
                  <div>
                    <div style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-main)' }}>
                      Web Audio Chime on New Detections
                    </div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                      Plays an audible subtle tone whenever a new object class enters the camera frame.
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Session & Storage Operations */}
          <div className="card-panel" style={{ marginBottom: 0 }}>
            <div className="card-panel-header">
              <h3 className="card-panel-title">
                <Shield size={18} color="#ea580c" />
                <span>Session & Storage Maintenance</span>
              </h3>
            </div>
            <div className="card-panel-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    Reset Active Session
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Current Session: <code>{currentSessionId}</code>. Creates a clean telemetry session ID for grouping.
                  </div>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={resetSession}>
                  <RotateCcw size={14} />
                  <span>Cycle Session ID</span>
                </button>
              </div>

              <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.86rem', fontWeight: 600, color: '#ef4444' }}>
                    Erase Browser Detection Storage
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Permanently delete all indexed logs from local storage.
                  </div>
                </div>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ color: '#ef4444', borderColor: '#fca5a5' }}
                  onClick={() => setIsClearModalOpen(true)}
                >
                  <Trash2 size={14} />
                  <span>Purge All Records</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Clearing Logs */}
      <ConfirmModal
        isOpen={isClearModalOpen}
        title="Purge Local Detection Database"
        message="Are you certain you wish to purge all stored detections? This permanently clears your client-side audit history."
        confirmLabel="Purge Records"
        isDestructive={true}
        onConfirm={() => {
          clearAllLogs();
          setIsClearModalOpen(false);
        }}
        onCancel={() => setIsClearModalOpen(false)}
      />
    </div>
  );
};
