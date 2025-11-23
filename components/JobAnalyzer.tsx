import React, { useState } from 'react';
import { analyzeJobFit, generateApplicationMaterials } from '../services/geminiService';
import { JobAnalysisResult, GeneratedContent, UserProfile } from '../types';
import { 
  Search, 
  Loader2, 
  ArrowRight, 
  Copy, 
  Linkedin, 
  Mail,
  MessageSquare,
  Users
} from 'lucide-react';

interface JobAnalyzerProps {
  userProfile: UserProfile;
}

export const JobAnalyzer: React.FC<JobAnalyzerProps> = ({ userProfile }) => {
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<JobAnalysisResult | null>(null);
  const [materials, setMaterials] = useState<GeneratedContent | null>(null);
  const [activeTab, setActiveTab] = useState<'analysis' | 'outreach' | 'prep'>('analysis');

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) return;
    
    setLoading(true);
    setAnalysis(null);
    setMaterials(null);
    
    try {
      // Run in parallel for speed
      const [analysisRes, materialsRes] = await Promise.all([
        analyzeJobFit(jobDescription, userProfile),
        generateApplicationMaterials(jobDescription, userProfile)
      ]);
      
      setAnalysis(analysisRes);
      setMaterials(materialsRes);
    } catch (error) {
      console.error(error);
      alert("Error analyzing job. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-100px)]">
      {/* Input Section */}
      <div className="lg:col-span-4 flex flex-col gap-4 h-full">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex-1 flex flex-col">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-slate-900">Job Description</h2>
            <p className="text-sm text-slate-500">Paste a JD here to automate your application strategy.</p>
          </div>
          <textarea
            className="flex-1 w-full p-4 bg-slate-50 border border-slate-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm text-slate-700 font-mono"
            placeholder="Paste job description text here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
          <button
            onClick={handleAnalyze}
            disabled={loading || !jobDescription}
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <Search className="h-5 w-5" />}
            {loading ? 'Analyzing Fit...' : 'Analyze & Generate'}
          </button>
        </div>
      </div>

      {/* Results Section */}
      <div className="lg:col-span-8 h-full overflow-y-auto pr-2">
        {!analysis ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 p-12">
            <Search size={48} className="mb-4 opacity-50" />
            <p className="text-lg font-medium">Ready to analyze</p>
            <p className="text-sm text-center max-w-md mt-2">
              Paste a job description to see your match score, cultural fit, and generate custom outreach materials instantly.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Match Score Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
               <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
                  <div>
                    <h3 className="text-2xl font-bold">Match Score</h3>
                    <p className="text-slate-400 text-sm">{analysis.recommendedAction} Recommended</p>
                  </div>
                  <div className="relative h-20 w-20 flex items-center justify-center">
                     <svg className="transform -rotate-90 w-20 h-20">
                        <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-700" />
                        <circle cx="40" cy="40" r="36" stroke={analysis.matchScore > 75 ? '#22c55e' : '#eab308'} strokeWidth="8" fill="transparent" strokeDasharray={226} strokeDashoffset={226 - (226 * analysis.matchScore) / 100} />
                     </svg>
                     <span className="absolute text-xl font-bold">{analysis.matchScore}%</span>
                  </div>
               </div>
               <div className="p-6 bg-white">
                  <p className="text-slate-700 mb-4 font-medium">{analysis.summary}</p>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="text-xs font-bold uppercase text-slate-400 mb-3 tracking-wider">Matching Keywords</h4>
                        <div className="flex flex-wrap gap-2">
                            {analysis.matchingKeywords.map((k, i) => (
                                <span key={i} className="px-2 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded border border-green-100">{k}</span>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h4 className="text-xs font-bold uppercase text-slate-400 mb-3 tracking-wider">Missing / To Address</h4>
                        <div className="flex flex-wrap gap-2">
                            {analysis.missingKeywords.length > 0 ? analysis.missingKeywords.map((k, i) => (
                                <span key={i} className="px-2 py-1 bg-red-50 text-red-700 text-xs font-semibold rounded border border-red-100">{k}</span>
                            )) : <span className="text-slate-500 text-xs italic">None detected</span>}
                        </div>
                    </div>
                  </div>
               </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl">
                <button 
                    onClick={() => setActiveTab('analysis')}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'analysis' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                >
                    Details
                </button>
                <button 
                    onClick={() => setActiveTab('outreach')}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'outreach' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                >
                    Outreach Generator
                </button>
                <button 
                    onClick={() => setActiveTab('prep')}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'prep' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                >
                    Interview Prep
                </button>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                {activeTab === 'analysis' && (
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                                <Users size={20} />
                            </div>
                            <div>
                                <h4 className="font-semibold text-slate-900">Cultural Fit Assessment</h4>
                                <p className="text-slate-600 text-sm mt-1">{analysis.culturalFit}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                             <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                <ArrowRight size={20} />
                            </div>
                            <div>
                                <h4 className="font-semibold text-slate-900">Strategic Recommendation</h4>
                                <p className="text-slate-600 text-sm mt-1">
                                    {analysis.recommendedAction === 'Apply' && "Strong match. Submit application immediately and follow up on LinkedIn."}
                                    {analysis.recommendedAction === 'Network' && "Good potential, but some gaps. Reach out to current employees first to understand specific needs."}
                                    {analysis.recommendedAction === 'Skip' && "Low alignment with core strengths. Focus energy on higher probability roles."}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'outreach' && materials && (
                    <div className="space-y-8">
                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <div className="flex items-center gap-2 text-slate-900 font-semibold">
                                    <Mail size={18} />
                                    <h3>Cover Letter Draft</h3>
                                </div>
                                <button onClick={() => copyToClipboard(materials.coverLetter)} className="text-xs flex items-center gap-1 text-blue-600 hover:underline">
                                    <Copy size={14} /> Copy
                                </button>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm text-slate-700 whitespace-pre-wrap font-serif leading-relaxed">
                                {materials.coverLetter}
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <div className="flex items-center gap-2 text-slate-900 font-semibold">
                                    <Linkedin size={18} />
                                    <h3>LinkedIn Connect Note</h3>
                                </div>
                                <button onClick={() => copyToClipboard(materials.linkedinMessage)} className="text-xs flex items-center gap-1 text-blue-600 hover:underline">
                                    <Copy size={14} /> Copy
                                </button>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm text-slate-700 whitespace-pre-wrap">
                                {materials.linkedinMessage}
                            </div>
                            <p className="text-xs text-slate-500 mt-2 text-right">{materials.linkedinMessage.length} / 300 chars</p>
                        </div>
                    </div>
                )}

                {activeTab === 'prep' && materials && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-4 text-slate-900 font-semibold">
                             <MessageSquare size={18} />
                             <h3>Predicted Interview Questions</h3>
                        </div>
                        {materials.interviewQuestions.map((q, idx) => (
                            <div key={idx} className="border-b border-slate-100 last:border-0 pb-6 last:pb-0">
                                <p className="font-medium text-slate-900 mb-3">Q: {q.question}</p>
                                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                                    <p className="text-xs font-bold text-green-700 uppercase mb-2">Suggested STAR Response Approach</p>
                                    <p className="text-sm text-slate-700 leading-relaxed">{q.suggestedAnswer}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};