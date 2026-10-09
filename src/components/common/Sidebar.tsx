import React from 'react';
import {
  LayoutDashboard,
  Camera,
  FileText,
  BarChart3,
  ImageIcon,
  Settings,
  ShieldCheck,
  Eye
} from 'lucide-react';
import type { ViewTab } from '../../types/detection';
import { useDetection } from '../../context/DetectionContext';

interface SidebarProps {
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const { logs, isCameraActive, isModelLoaded } = useDetection();

  const navItems = [
    { id: 'dashboard' as ViewTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'live' as ViewTab, label: 'Live Detection', icon: Camera, badge: isCameraActive ? 'LIVE' : undefined },
    { id: 'logs' as ViewTab, label: 'Detection Logs', icon: FileText, badge: logs.length > 0 ? `${logs.length}` : undefined },
    { id: 'analytics' as ViewTab, label: 'Analytics', icon: BarChart3 },
    { id: 'image-test' as ViewTab, label: 'Image Test Lab', icon: ImageIcon },
    { id: 'settings' as ViewTab, label: 'Settings & About', icon: Settings },
  ];

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="brand-icon-box">
          <Eye size={22} strokeWidth={2.4} />
        </div>
        <div className="brand-text">
          <h1>VisionPulse</h1>
          <span>Edge Vision & Analytics</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="sidebar-nav">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onSelectTab(item.id)}
            >
              <Icon size={18} className="nav-icon" />
              <span>{item.label}</span>
              {item.badge && (
                <span className={`nav-badge ${item.badge === 'LIVE' ? 'badge-blue' : ''}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Engine Status Footer */}
      <div className="sidebar-footer">
        <div className="engine-status-box">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <span className={isModelLoaded ? 'live-indicator' : 'live-indicator-idle'} />
            <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
              {isModelLoaded ? 'Inference Engine' : 'Engine Offline'}
            </span>
          </div>
          <span style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 600 }}>
            {isModelLoaded ? 'v2.2 (WebGL)' : 'Loading'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.65rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          <ShieldCheck size={13} color="#0d9488" />
          <span>100% Client-Side Privacy</span>
        </div>
      </div>
    </aside>
  );
};
