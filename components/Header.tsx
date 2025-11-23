import React from 'react';
import { Briefcase, LayoutDashboard, FileText, UserCircle, Bot } from 'lucide-react';
import { AppView } from '../types';

interface HeaderProps {
  currentView: AppView;
  setView: (view: AppView) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, setView }) => {
  const navClass = (view: AppView) =>
    `flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
      currentView === view
        ? 'bg-blue-600 text-white shadow-md'
        : 'text-slate-600 hover:bg-slate-100'
    }`;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Briefcase className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">ExecuMatch</h1>
              <p className="text-xs text-slate-500 font-medium">Career Automation Suite</p>
            </div>
          </div>
          
          <nav className="hidden md:flex space-x-2">
            <button onClick={() => setView(AppView.DASHBOARD)} className={navClass(AppView.DASHBOARD)}>
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </button>
            <button onClick={() => setView(AppView.JOB_ANALYZER)} className={navClass(AppView.JOB_ANALYZER)}>
              <FileText size={18} />
              <span>Job Analyzer</span>
            </button>
            <button onClick={() => setView(AppView.AUTO_PILOT)} className={navClass(AppView.AUTO_PILOT)}>
              <Bot size={18} />
              <span>Auto-Pilot Agent</span>
            </button>
          </nav>

          <div className="flex items-center gap-3">
             <div className="hidden sm:block text-right">
                <p className="text-sm font-semibold text-slate-900">Maroleng M.</p>
                <p className="text-xs text-green-600 font-medium">Open to Work</p>
             </div>
             <UserCircle className="h-8 w-8 text-slate-400" />
          </div>
        </div>
      </div>
      {/* Mobile Nav */}
      <div className="md:hidden flex justify-around border-t border-slate-100 p-2 bg-white">
        <button onClick={() => setView(AppView.DASHBOARD)} className="p-2 text-slate-600">
           <LayoutDashboard size={24} />
        </button>
        <button onClick={() => setView(AppView.JOB_ANALYZER)} className="p-2 text-slate-600">
           <FileText size={24} />
        </button>
        <button onClick={() => setView(AppView.AUTO_PILOT)} className="p-2 text-slate-600">
           <Bot size={24} />
        </button>
      </div>
    </header>
  );
};