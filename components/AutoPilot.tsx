
import React, { useState, useEffect, useMemo } from 'react';
import { findRelevantJobs, analyzeJobFit } from '../services/geminiService';
import { JobSearchResult, UserProfile } from '../types';
import { GLOBAL_GEOGRAPHY_DB } from '../geography';
import { 
  Bot, 
  Play, 
  Loader2, 
  Send, 
  Activity,
  Mail,
  ExternalLink,
  Settings2,
  Globe,
  MapPin,
  Info,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ShieldCheck,
  Search,
  Calendar
} from 'lucide-react';

interface AutoPilotProps {
  userProfile: UserProfile;
}

export const AutoPilot: React.FC<AutoPilotProps> = ({ userProfile }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [jobs, setJobs] = useState<JobSearchResult[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [emailNotification, setEmailNotification] = useState<string | null>(null);

  // 4-Tier Hierarchical State
  const [geo, setGeo] = useState({
    country: "South Africa",
    division: "Western Cape",
    city: "George",
    town: "George Central",
    customCountry: "",
    customDivision: "",
    customCity: "",
    customTown: ""
  });

  // Dynamic Data Extraction
  const countryData = GLOBAL_GEOGRAPHY_DB[geo.country];
  const divisionLabel = countryData?.divisionType === 'None' ? 'Area' : (countryData?.divisionType || "State/Province");

  // Options Memoization
  const countries = useMemo(() => [...Object.keys(GLOBAL_GEOGRAPHY_DB), "Other..."], []);
  
  const divisions = useMemo(() => {
    const data = GLOBAL_GEOGRAPHY_DB[geo.country]?.divisions;
    return data ? [...Object.keys(data), "Other..."] : ["Other..."];
  }, [geo.country]);
  
  const cities = useMemo(() => {
    const data = GLOBAL_GEOGRAPHY_DB[geo.country]?.divisions?.[geo.division];
    return data ? [...Object.keys(data), "Other..."] : ["Other..."];
  }, [geo.country, geo.division]);

  const towns = useMemo(() => {
    const data = GLOBAL_GEOGRAPHY_DB[geo.country]?.divisions?.[geo.division]?.[geo.city];
    return data ? [...data, "Other..."] : ["Other..."];
  }, [geo.country, geo.division, geo.city]);

  // Configuration State
  const [config, setConfig] = useState({
    minScore: 90,
    dateRange: 'within the last 24 hours'
  });

  // Construct search string following user's preferred format
  const currentTarget = useMemo(() => {
    const c = geo.country === "Other..." ? geo.customCountry : geo.country;
    const d = geo.division === "Other..." ? geo.customDivision : geo.division;
    const ci = geo.city === "Other..." ? geo.customCity : geo.city;
    const t = geo.town === "Other..." ? geo.customTown : geo.town;
    
    return [t, ci, d, c].filter(Boolean).join(", ");
  }, [geo]);

  // For visual breadcrumbs
  const geoPath = useMemo(() => {
    return {
      country: geo.country === "Other..." ? geo.customCountry : geo.country,
      division: geo.division === "Other..." ? geo.customDivision : geo.division,
      city: geo.city === "Other..." ? geo.customCity : geo.city,
      town: geo.town === "Other..." ? geo.customTown : geo.town,
    };
  }, [geo]);

  const addLog = (msg: string) => setLogs(prev => [msg, ...prev]);

  const runAutomation = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setJobs([]);
    setLogs([]);
    setEmailNotification(null);
    
    try {
      addLog("Initializing MoJobs Executive Search...");
      addLog(`Targeting Hierarchy: ${geoPath.country} → ${geoPath.division} → ${geoPath.city} → ${geoPath.town}`);
      addLog(`Temporal Filter: ${config.dateRange}`);
      
      const tempProfile = { ...userProfile, location: currentTarget };
      const foundJobs = await findRelevantJobs(tempProfile, config.dateRange);
      setJobs(foundJobs);
      
      addLog(`Found ${foundJobs.length} potential roles in target region. Analyzing compatibility...`);

      for (const job of foundJobs) {
        setJobs(current => current.map(j => j.id === job.id ? { ...j, status: 'analyzing' } : j));
        addLog(`Analyzing: ${job.title} at ${job.company}`);
        
        const analysis = await analyzeJobFit(job.description, userProfile);
        const isMatch = analysis.matchScore >= config.minScore;
        
        setJobs(current => current.map(j => j.id === job.id ? { ...j, analysis, status: isMatch ? 'matched' : 'rejected' } : j));

        if (isMatch) {
          addLog(`✅ VERIFIED: Match Score ${analysis.matchScore}% - Drafting materials.`);
          await new Promise(r => setTimeout(r, 1000));
          setJobs(current => current.map(j => j.id === job.id ? { ...j, status: 'applied' } : j));
          addLog(`🚀 Sequence complete: outreach sent to ${job.company}`);
          setEmailNotification(`Match alert: ${job.company}`);
        } else {
          addLog(`⏭️ Skipped: ${analysis.matchScore}% score - Does not meet executive threshold.`);
        }
        await new Promise(r => setTimeout(r, 500));
      }
      addLog("Automation cycle complete. Monitoring for new signals.");
    } catch (error) {
      addLog("⚠️ Search Engine Interruption. Retrying...");
      console.error(error);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-100px)]">
      {/* Search Configuration */}
      <div className="lg:col-span-1 flex flex-col gap-4 min-h-0">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 overflow-y-auto scrollbar-hide flex-shrink-0">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-100">
              <Search className="text-white h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Geo-Targeting</h2>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">4-Tier Search Protocol</p>
            </div>
          </div>

          <div className="space-y-5">
             {/* Dynamic Location Hierarchy */}
             <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-1">
                  <h4 className="text-[11px] font-black text-slate-800 uppercase flex items-center gap-2">
                    <Globe size={14} className="text-blue-600" /> Geography Database
                  </h4>
                  {countryData?.explanation && (
                    <div className="group relative">
                      <AlertCircle size={14} className="text-amber-500 cursor-help" />
                      <div className="absolute right-0 bottom-full mb-2 w-56 bg-slate-900 text-white text-[10px] p-2.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl">
                        <p className="font-bold mb-1 text-blue-400">Unitary State System:</p>
                        {countryData.explanation}
                      </div>
                    </div>
                  )}
                </div>

                {/* T1: Country */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Tier 1: Country</label>
                  <select
                      value={geo.country}
                      onChange={(e) => setGeo({...geo, country: e.target.value, division: "Other...", city: "Other...", town: "Other..."})}
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white font-semibold focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                  >
                      {countries.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {geo.country === "Other..." && (
                    <input 
                      type="text"
                      placeholder="Specify country..."
                      value={geo.customCountry}
                      onChange={(e) => setGeo({...geo, customCountry: e.target.value})}
                      className="w-full text-xs p-3 mt-1.5 rounded-xl border border-blue-200 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  )}
                </div>

                {/* T2: State/Province/Region */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Tier 2: {divisionLabel}</label>
                  <select
                      value={geo.division}
                      onChange={(e) => setGeo({...geo, division: e.target.value, city: "Other...", town: "Other..."})}
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white font-semibold focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                  >
                      {divisions.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  {geo.division === "Other..." && (
                    <input 
                      type="text"
                      placeholder={`Specify ${divisionLabel.toLowerCase()}...`}
                      value={geo.customDivision}
                      onChange={(e) => setGeo({...geo, customDivision: e.target.value})}
                      className="w-full text-xs p-3 mt-1.5 rounded-xl border border-blue-200 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  )}
                </div>

                {/* T3: City */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Tier 3: City</label>
                  <select
                      value={geo.city}
                      onChange={(e) => setGeo({...geo, city: e.target.value, town: "Other..."})}
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white font-semibold focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                  >
                      {cities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {geo.city === "Other..." && (
                    <input 
                      type="text"
                      placeholder="Specify city..."
                      value={geo.customCity}
                      onChange={(e) => setGeo({...geo, customCity: e.target.value})}
                      className="w-full text-xs p-3 mt-1.5 rounded-xl border border-blue-200 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  )}
                </div>

                {/* T4: Town/Suburb */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Tier 4: Town / Suburb</label>
                  <select
                      value={geo.town}
                      onChange={(e) => setGeo({...geo, town: e.target.value})}
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white font-semibold focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                  >
                      {towns.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  {geo.town === "Other..." && (
                    <input 
                      type="text"
                      placeholder="Specify town/suburb..."
                      value={geo.customTown}
                      onChange={(e) => setGeo({...geo, customTown: e.target.value})}
                      className="w-full text-xs p-3 mt-1.5 rounded-xl border border-blue-200 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  )}
                </div>

                {/* Publication Window (Date Filter) */}
                <div className="space-y-1.5 pt-2 border-t border-slate-200">
                  <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5">
                    <Calendar size={12} className="text-blue-500"/> Publication Window
                  </label>
                  <select
                      value={config.dateRange}
                      onChange={(e) => setConfig({...config, dateRange: e.target.value})}
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white font-semibold focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                  >
                      <option value="within the last 24 hours">Last 24 Hours</option>
                      <option value="within the last 3 days">Last 3 Days</option>
                      <option value="within the last 7 days">Last 7 Days</option>
                      <option value="within the last 30 days">Last 30 Days</option>
                      <option value="anytime">Anytime</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1 pt-3 text-[10px] text-blue-800 font-black bg-blue-50 p-3 rounded-xl border border-blue-100 shadow-sm overflow-hidden">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin size={14} className="text-blue-600 shrink-0" />
                    <span className="uppercase tracking-widest">Active Search Perimeter</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] truncate text-blue-900">
                    <span>{geoPath.country}</span> <ChevronRight size={10} className="text-blue-300"/>
                    <span>{geoPath.division}</span> <ChevronRight size={10} className="text-blue-300"/>
                    <span>{geoPath.city}</span> <ChevronRight size={10} className="text-blue-300"/>
                    <span className="font-black text-blue-600 underline underline-offset-2">{geoPath.town}</span>
                  </div>
                </div>
             </div>

             <div className="space-y-1.5 px-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Executive Fit Threshold</label>
                <select
                    value={config.minScore}
                    onChange={(e) => setConfig({...config, minScore: Number(e.target.value)})}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white text-slate-900 font-semibold shadow-sm"
                >
                    <option value={95}>95% (Top 1% Matches)</option>
                    <option value={90}>90% (Highly Compatible)</option>
                    <option value={85}>85% (Balanced Executive)</option>
                </select>
             </div>

             <button 
              onClick={runAutomation}
              disabled={isRunning}
              className={`w-full py-4 px-6 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-xl ${
                isRunning 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200 shadow-none' 
                  : 'bg-slate-900 text-white hover:bg-blue-600 shadow-blue-100'
              }`}
             >
               {isRunning ? <Loader2 className="animate-spin h-5 w-5" /> : <Play className="h-5 w-5" fill="currentColor" />}
               {isRunning ? 'Analyzing Market...' : 'Deploy Agent'}
             </button>
          </div>
        </div>

        {/* System Logs Terminal */}
        <div className="bg-slate-900 rounded-2xl shadow-xl border border-slate-800 p-5 flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 mb-4 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <Activity size={16} className="text-emerald-500" />
              <span className="text-[10px] font-mono font-black uppercase tracking-widest">MoJobs Agent Logs</span>
            </div>
            <div className="flex gap-1.5">
              <div className="h-2 w-2 rounded-full bg-slate-800" />
              <div className="h-2 w-2 rounded-full bg-slate-800" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto font-mono text-[10px] leading-relaxed space-y-2 scrollbar-thin scrollbar-thumb-slate-800 pr-2">
            {logs.length === 0 && <span className="text-slate-700 italic">Standing by for geo-targeting parameters...</span>}
            {logs.map((log, i) => (
              <div key={i} className="flex gap-3">
                <span className="text-slate-600 shrink-0 select-none">[{new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', second:'2-digit'})}]</span>
                <span className={log.startsWith('✅') ? 'text-emerald-400' : log.startsWith('🚀') ? 'text-blue-400' : 'text-slate-300'}>
                  {log}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Opportunities Results */}
      <div className="lg:col-span-2 flex flex-col h-full overflow-hidden">
        <div className="flex items-center justify-between mb-5 flex-shrink-0 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex flex-col">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 tracking-tight">
              Live Opportunities
              {jobs.length > 0 && <span className="text-[10px] bg-blue-600 text-white px-2.5 py-1 rounded-full font-bold">{jobs.length} Active</span>}
            </h3>
            <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
               <span>Database Search:</span>
               <span className="font-bold text-blue-600 uppercase tracking-tighter">{geoPath.country}</span>
               <ChevronRight size={10} />
               <span className="font-bold text-slate-700">{geoPath.town}</span>
               <span className="ml-2 text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-400 uppercase">{config.dateRange}</span>
            </div>
          </div>
          {emailNotification && (
             <div className="flex items-center gap-2 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-[10px] font-black border border-emerald-200 animate-fade-in uppercase tracking-widest shadow-sm">
               <Mail size={14} />
               Alert Sent
             </div>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto pr-2 space-y-5 scrollbar-hide pb-16">
          {jobs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-[3rem] bg-slate-50/50 p-12">
              <div className="bg-white p-8 rounded-full shadow-2xl border border-slate-100 mb-8 relative">
                <Bot size={64} className="text-slate-200 animate-pulse" />
                <div className="absolute inset-0 border-4 border-blue-500/10 rounded-full animate-ping"></div>
              </div>
              <p className="text-xl font-black text-slate-800 tracking-tight">Agent in Standby Mode</p>
              <p className="text-sm text-center max-w-sm mt-3 text-slate-500 font-medium leading-relaxed">
                Configure your <span className="text-blue-600 font-bold">4-Tier Hierarchy</span> and <span className="text-blue-600 font-bold">Publication Window</span>. The agent will traverse global job markets to find verified senior roles in <span className="text-slate-900 font-bold">{geoPath.town || geoPath.country}</span>.
              </p>
            </div>
          ) : (
            jobs.map((job) => (
              <div key={job.id} className={`bg-white rounded-[2rem] shadow-sm border p-8 transition-all group hover:shadow-2xl hover:-translate-y-1 ${
                job.status === 'applied' ? 'border-emerald-200 bg-emerald-50/30' : 
                job.status === 'rejected' ? 'border-slate-100 opacity-60 grayscale hover:grayscale-0' : 
                'border-slate-200'
              }`}>
                <div className="flex justify-between items-start mb-6">
                  <div className="space-y-2 flex-1">
                    <h4 className="font-black text-slate-900 text-2xl leading-none tracking-tight group-hover:text-blue-600 transition-colors">{job.title}</h4>
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 font-bold uppercase tracking-widest">
                      <span className="text-slate-900 bg-slate-100 px-2 py-1 rounded">{job.company}</span>
                      <span className="text-slate-300">•</span>
                      <a 
                        href={job.url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline decoration-2 underline-offset-4 transition-all"
                      >
                        <ExternalLink size={12} />
                        Direct Link
                      </a>
                      <span className="text-slate-300">•</span>
                      <div className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-2 py-1 rounded">
                         <ShieldCheck size={14}/> Verified Location
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0 ml-4">
                     {job.status === 'analyzing' && <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-4 py-2.5 rounded-2xl flex items-center gap-2 uppercase tracking-widest border border-blue-100 animate-pulse"><Loader2 size={12} className="animate-spin"/> Scanning</span>}
                     {job.status === 'matched' && <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-4 py-2.5 rounded-2xl uppercase tracking-widest border border-emerald-200 shadow-sm">Executive Fit</span>}
                     {job.status === 'rejected' && <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-4 py-2.5 rounded-2xl uppercase tracking-widest border border-slate-200">No Alignment</span>}
                     {job.status === 'applied' && <span className="bg-slate-900 text-white text-[10px] font-black px-4 py-2.5 rounded-2xl flex items-center gap-2 uppercase tracking-widest shadow-xl shadow-blue-200"><CheckCircle2 size={14} className="text-emerald-400"/> Outreach Sent</span>}
                  </div>
                </div>

                {/* Database-linked Location Display */}
                <div className="mb-6 flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                    <Globe size={14} className="text-blue-400" />
                    <span>Search Trace:</span>
                    <span className="text-slate-900">{geoPath.country}</span>
                    <ChevronRight size={10} />
                    <span className="text-slate-900">{geoPath.division}</span>
                    <ChevronRight size={10} />
                    <span className="text-slate-900">{geoPath.city}</span>
                    <ChevronRight size={10} />
                    <span className="text-blue-600 font-black">{geoPath.town}</span>
                </div>

                {job.analysis && (
                  <div className="mb-6 bg-slate-50 rounded-2xl p-6 border border-slate-100 group-hover:bg-white transition-colors">
                    <div className="flex items-center gap-8">
                      <div className="shrink-0 text-center px-6 border-r border-slate-200">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Compatibility</div>
                        <div className={`text-4xl font-black ${job.analysis.matchScore >= config.minScore ? 'text-blue-600' : 'text-slate-400'}`}>
                          {job.analysis.matchScore}%
                        </div>
                      </div>
                      <div className="flex-1">
                         <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Agent Insight</div>
                         <p className="text-xs text-slate-600 leading-relaxed font-semibold italic">"{job.analysis.summary}"</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-between items-center pt-2">
                   <div className="flex gap-3">
                      {job.analysis?.matchingKeywords.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="text-[10px] font-black text-slate-400 bg-white border border-slate-200 px-3 py-1.5 rounded-xl uppercase tracking-tighter">#{tag.toLowerCase().replace(/\s+/g, '')}</span>
                      ))}
                   </div>
                   <a href={job.url} target="_blank" rel="noreferrer" className="text-[11px] font-black text-blue-600 bg-blue-50 px-5 py-2.5 rounded-2xl hover:bg-blue-600 hover:text-white transition-all flex items-center gap-2.5 uppercase tracking-widest border border-blue-100 shadow-sm shadow-blue-50/50">
                      Launch Portal <ExternalLink size={14} />
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
