import React, { useState } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { JobAnalyzer } from './components/JobAnalyzer';
import { AutoPilot } from './components/AutoPilot';
import { AppView, UserProfile } from './types';
import { USER_PROFILE as INITIAL_USER_PROFILE } from './constants';

const App: React.FC = () => {
  const [currentView, setView] = useState<AppView>(AppView.DASHBOARD);
  const [userProfile, setUserProfile] = useState<UserProfile>(INITIAL_USER_PROFILE);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      <Header currentView={currentView} setView={setView} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === AppView.DASHBOARD && (
          <Dashboard userProfile={userProfile} setUserProfile={setUserProfile} />
        )}
        {currentView === AppView.JOB_ANALYZER && (
          <JobAnalyzer userProfile={userProfile} />
        )}
        {currentView === AppView.AUTO_PILOT && (
          <AutoPilot userProfile={userProfile} />
        )}
      </main>
    </div>
  );
};

export default App;