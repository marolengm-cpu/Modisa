import React, { useState, useEffect } from 'react';
import { findRelevantJobs, analyzeJobFit } from '../services/geminiService';
import { JobSearchResult, UserProfile } from '../types';
import { 
  Bot, 
  Play, 
  Loader2, 
  CheckCircle2, 
  Send, 
  Activity,
  Mail,
  ExternalLink,
  Ban,
  Settings2
} from 'lucide-react';

interface AutoPilotProps {
  userProfile: UserProfile;
}

export const AutoPilot: React.FC<AutoPilotProps> = ({ userProfile }) => {
  const [isActive, setIsActive] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [jobs, setJobs] = useState<JobSearchResult[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [emailNotification, setEmailNotification] = useState<string | null>(null);

  // Configuration State
  const [config, setConfig] = useState({
    frequency: 'daily_9',
    location: userProfile.logistics.location || userProfile.location,
    minScore: 90
  });

  // Sync config location if profile updates (e.g. from resume upload)
  useEffect(() => {
    setConfig(prev => ({
      ...prev,
      location: userProfile.logistics.location || userProfile.location
    }));
  }, [userProfile.logistics.location, userProfile.location]);

  const addLog = (msg: string) => setLogs(prev => [msg, ...prev]);

  const runAutomation = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setJobs([]);
    setLogs([]);
    setEmailNotification(null);
    
    try {
      addLog("Starting automated scan agent...");
      addLog(`Settings: ${config.location} | Threshold: ${config.minScore}%`);
      
      // Step 1: Find Jobs using Config Location
      addLog("Querying Google Search for active listings...");
      
      // Create a temporary profile with the overridden location for the search service
      const searchProfile = {
        ...userProfile,
        logistics: {
            ...userProfile.logistics,
            location: config.location
        },
        location: config.location
      };

      const foundJobs = await findRelevantJobs(searchProfile);
      setJobs(foundJobs);
      addLog(`Found ${foundJobs.length} potential matches. Analyzing fit...`);

      // Step 2: Analyze each job
      for (const job of foundJobs) {
        setJobs(current => current.map(j => j.id === job.id ? { ...j, status: 'analyzing' } : j));
        addLog(`Analyzing: ${job.title} at ${job.company}...`);
        
        try {
          const analysis = await analyzeJobFit(job.description, userProfile);
          // Use configured threshold
          const isMatch = analysis.matchScore >= config.minScore;
          
          setJobs(current => current.map(j => {
            if (j.id === job.id) {
              return { 
                ...j, 
                analysis, 
                status: isMatch ? 'matched' : 'rejected' 
              };
            }
            return j;
          }));

          if (isMatch) {
            addLog(`✅ MATCH FOUND (${analysis.matchScore}%): ${job.company}. Applying...`);
            // Simulate Application Delay
            await new Promise(r => setTimeout(r, 1500));
            
            setJobs(current => current.map(j => j.id === job.id ? { ...j, status: 'applied' } : j));
            addLog(`🚀 Application Submitted to ${job.company}`);
            
            // Simulate Email
            const notifText = `Applied to ${job.title} at ${job.company} (Score: ${analysis.matchScore}%)`;
            setEmailNotification(notifText);
            addLog(`📧 Notification sent to ${userProfile.email}`);
          } else {
            addLog(`❌ Skipped (${analysis.matchScore}%). Below ${config.minScore}% threshold.`);
          }
        } catch (e) {
          addLog(`⚠️ Error analyzing ${job.company}`);
          setJobs(current => current.map(j => j.id === job.id ? { ...j, status: 'rejected' } : j));
        }
        
        // Slight delay between jobs for effect
        await new Promise(r => setTimeout(r, 800));
      }
      
      addLog("Scan cycle complete. Agent sleeping.");
    } catch (error) {
      addLog("Error during automation run.");
      console.error(error);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-100px)]">
      {/* Control Panel */}
      <div className="lg:col-span-1 space-y-6 flex flex-col h-full">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-purple-600 p-2 rounded-lg">
              <Bot className="text-white h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Auto-Pilot Agent</h2>
              <p className="text-xs text-slate-500">Daily Job Scan & Apply</p>
            </div>
          </div>

          {/* Master Toggle */}
          <div className="flex items-center justify-between bg-slate-50 p-4 rounded-lg border border-slate-100 mb-6">
            <div>
              <p className="text-sm font-semibold text-slate-900">Daily Automation</p>
              <p className="text-xs text-slate-500">{isActive ? 'Active' : 'Paused'}</p>
            </div>
            <button 
              onClick={() => setIsActive(!isActive)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isActive ? 'bg-green-500' : 'bg-slate-300'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isActive ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className="space-y-4">
             {/* Configuration Panel */}
             <div className="bg-blue-50 p-4 rounded-md border border-blue-100 space-y-3">
               <div className="flex items-center justify-between border-b border-blue-200 pb-2 mb-2">
                 <h4 className="text-xs font-bold text-blue-800 uppercase">Automation Rules</h4>
                 <Settings2 size={14} className="text-blue-600" />
               </div>

               {/* Frequency Setting */}
               <div className="space-y-1">
                 <label className="text-xs font-medium text-blue-900 block">Scan Frequency</label>
                 <select 
                    value={config.frequency}
                    onChange={(e) => setConfig({...config, frequency: e.target.value})}
                    className="w-full text-xs p-2 rounded border border-blue-200 bg-white text-slate-700 focus:outline-none focus:border-blue-500 shadow-sm"
                 >
                    <option value="daily_9">Daily at 09:00 SAST</option>
                    <option value="daily_12">Daily at 12:00 SAST</option>
                    <option value="every_6">Every 6 Hours</option>
                    <option value="manual">Manual Trigger Only</option>
                 </select>
               </div>

               {/* Region Setting */}
               <div className="space-y-1">
                  <label className="text-xs font-medium text-blue-900 block">Target Region</label>
                  <select
                      value={config.location}
                      onChange={(e) => setConfig({...config, location: e.target.value})}
                      className="w-full text-xs p-2 rounded border border-blue-200 bg-white text-slate-700 focus:outline-none focus:border-blue-500 shadow-sm"
                  >
                      <option value={userProfile.logistics.location || userProfile.location}>📍 Profile: {userProfile.logistics.location || userProfile.location}</option>
                      <option value="Johannesburg, South Africa">Johannesburg, Gauteng</option>
                      <option value="Pretoria, South Africa">Pretoria, Gauteng</option>
                      <option value="Cape Town, South Africa">Cape Town, Western Cape</option>
                      <option value="Durban, South Africa">Durban, KZN</option>
                      <option value="Remote">Remote / Work from Home</option>
                  </select>
               </div>

               {/* Threshold Setting */}
               <div className="space-y-1">
                  <label className="text-xs font-medium text-blue-900 block">Minimum Match Score</label>
                  <select
                      value={config.minScore}
                      onChange={(e) => setConfig({...config, minScore: Number(e.target.value)})}
                      className="w-full text-xs p-2 rounded border border-blue-200 bg-white text-slate-700 focus:outline-none focus:border-blue-500 shadow-sm"
                  >
                      <option value={95}>95% (Strict - Top Matches Only)</option>
                      <option value={90}>90% (Recommended - High Fit)</option>
                      <option value={85}>85% (Balanced)</option>
                      <option value={80}>80% (Broad Search)</option>
                  </select>
               </div>
             </div>

             <button 
              onClick={runAutomation}
              disabled={isRunning}
              className={`w-full py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
                isRunning 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                  : 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg'
              }`}
             >
               {isRunning ? <Loader2 className="animate-spin h-4 w-4" /> : <Play className="h-4 w-4" />}
               {isRunning ? 'Agent Running...' : 'Run Scan with Settings'}
             </button>
          </div>
        </div>

        {/* Live Logs */}
        <div className="bg-slate-900 rounded-xl shadow-sm border border-slate-800 p-4 flex-1 flex flex-col min-h-0">
          <div className="flex items-center gap-2 text-slate-400 mb-3 pb-3 border-b border-slate-800">
            <Activity size={14} />
            <span className="text-xs font-mono font-bold uppercase">System Logs</span>
          </div>
          <div className="flex-1 overflow-y-auto font-mono text-xs space-y-2 pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
            {logs.length === 0 && <span className="text-slate-600 italic">Waiting to start...</span>}
            {logs.map((log, i) => (
              <div key={i} className="text-green-400 border-l-2 border-slate-700 pl-2 py-0.5">
                <span className="text-slate-500 mr-2">[{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}]</span>
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Results Feed */}
      <div className="lg:col-span-2 flex flex-col h-full overflow-hidden">
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <h3 className="text-lg font-bold text-slate-900">Found Opportunities</h3>
          {emailNotification && (
             <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
               <Mail size={12} />
               Email Sent to User
             </div>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto pr-2 space-y-4 scrollbar-hide">
          {jobs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              <Bot size={48} className="mb-4 opacity-50" />
              <p className="text-lg font-medium">Agent is sleeping</p>
              <p className="text-sm text-center max-w-md mt-2">
                Configure your rules on the left and click "Run Scan" to find jobs matching your criteria (Threshold: {config.minScore}%).
              </p>
            </div>
          ) : (
            jobs.map((job) => (
              <div key={job.id} className={`bg-white rounded-xl shadow-sm border p-5 transition-all ${
                job.status === 'applied' ? 'border-green-200 bg-green-50/30' : 
                job.status === 'rejected' ? 'border-slate-100 opacity-60' : 
                'border-slate-200'
              }`}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg">{job.title}</h4>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <span>{job.company}</span>
                      <span>•</span>
                      <span>{job.location}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                     {/* Status Badges */}
                     {job.status === 'pending' && <span className="bg-slate-100 text-slate-500 text-xs font-bold px-2 py-1 rounded">Pending</span>}
                     {job.status === 'analyzing' && <span className="bg-blue-100 text-blue-600 text-xs font-bold px-2 py-1 rounded flex items-center gap-1"><Loader2 size={10} className="animate-spin"/> Analyzing</span>}
                     {job.status === 'matched' && <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">Matched</span>}
                     {job.status === 'rejected' && <span className="bg-slate-100 text-slate-400 text-xs font-bold px-2 py-1 rounded">Skipped</span>}
                     {job.status === 'applied' && <span className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1"><Send size={10}/> Applied</span>}
                  </div>
                </div>

                {job.analysis && (
                  <div className="mt-4 pt-4 border-t border-slate-100 grid md:grid-cols-5 gap-4">
                    <div className="md:col-span-1">
                      <div className="text-xs font-bold text-slate-400 uppercase mb-1">Match Score</div>
                      <div className={`text-2xl font-bold ${job.analysis.matchScore >= config.minScore ? 'text-green-600' : 'text-slate-400'}`}>
                        {job.analysis.matchScore}%
                      </div>
                    </div>
                    <div className="md:col-span-4">
                       <div className="text-xs font-bold text-slate-400 uppercase mb-1">AI Analysis</div>
                       <p className="text-sm text-slate-700">{job.analysis.summary}</p>
                       {job.status === 'rejected' && (
                         <div className="flex items-center gap-1 text-xs text-red-500 mt-2 font-medium">
                            <Ban size={12} /> Match score below {config.minScore}% threshold. Auto-apply skipped.
                         </div>
                       )}
                    </div>
                  </div>
                )}
                
                <div className="mt-4 flex justify-end">
                   <a href={job.url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                      View Original Post <ExternalLink size={10} />
                   </a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};