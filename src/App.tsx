import React, { useState } from 'react';
import { DetectionProvider } from './context/DetectionContext';
import { Sidebar } from './components/common/Sidebar';
import { Header } from './components/common/Header';
import { ToastContainer } from './components/common/ToastContainer';
import { DashboardView } from './components/dashboard/DashboardView';
import { LiveDetectionView } from './components/live/LiveDetectionView';
import { LogsView } from './components/logs/LogsView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { ImageTestView } from './components/image-test/ImageTestView';
import { SettingsView } from './components/settings/SettingsView';
import type { ViewTab } from './types/detection';
import './App.css';

const AppContent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<ViewTab>('dashboard');

  return (
    <div className="app-container">
      {/* Primary Sidebar Navigation */}
      <Sidebar currentTab={currentTab} onSelectTab={setCurrentTab} />

      {/* Main View Area */}
      <div className="main-wrapper">
        <Header currentTab={currentTab} onNavigateTab={setCurrentTab} />

        <main className="content-body">
          {currentTab === 'dashboard' && <DashboardView onNavigateTab={setCurrentTab} />}
          {currentTab === 'live' && <LiveDetectionView />}
          {currentTab === 'logs' && <LogsView />}
          {currentTab === 'analytics' && <AnalyticsView />}
          {currentTab === 'image-test' && <ImageTestView />}
          {currentTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Global Notifications */}
      <ToastContainer />
    </div>
  );
};

export function App() {
  return (
    <DetectionProvider>
      <AppContent />
    </DetectionProvider>
  );
}

export default App;
