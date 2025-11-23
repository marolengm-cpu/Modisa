import React, { useRef, useState } from 'react';
import { UserProfile } from '../types';
import { parseResume } from '../services/geminiService';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Award, 
  TrendingUp, 
  Users, 
  Briefcase,
  CheckCircle2,
  Upload,
  Loader2,
  FileText
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

interface DashboardProps {
  userProfile: UserProfile;
  setUserProfile: (profile: UserProfile) => void;
}

const skillData = [
  { name: 'Procurement', value: 95 },
  { name: 'Ops Mgmt', value: 90 },
  { name: 'Supply Chain', value: 85 },
  { name: 'ERP (SAP)', value: 80 },
  { name: 'Negotiation', value: 90 },
  { name: 'Budgeting', value: 85 },
];

const colors = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#2563eb', '#3b82f6'];

export const Dashboard: React.FC<DashboardProps> = ({ userProfile, setUserProfile }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64String = reader.result as string;
        // Strip the data: prefix to get pure base64
        const base64Data = base64String.split(',')[1];
        
        try {
          const newProfile = await parseResume(base64Data, file.type);
          setUserProfile(newProfile);
        } catch (error) {
          console.error("Failed to parse resume", error);
          alert("Could not analyze this resume. Please ensure it is a clear PDF or Text file.");
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error(error);
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in relative">
      {/* Upload Overlay/Status */}
      {isUploading && (
        <div className="absolute inset-0 bg-white/80 z-50 flex flex-col items-center justify-center rounded-xl backdrop-blur-sm">
           <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
           <p className="text-lg font-semibold text-slate-800">Analyzing Resume with Gemini...</p>
           <p className="text-sm text-slate-500">Extracting skills, achievements, and career history.</p>
        </div>
      )}

      {/* Profile Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4">
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept=".pdf,application/pdf,text/plain" 
            onChange={handleFileUpload}
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-semibold rounded-lg transition-colors"
          >
            <Upload size={16} />
            Update from Resume
          </button>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-3xl font-bold text-slate-900">{userProfile.name}</h2>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold uppercase rounded-full tracking-wide">
                Candidate Profile
              </span>
            </div>
            <p className="text-slate-600 text-lg leading-relaxed mb-6 max-w-3xl">
              {userProfile.summary}
            </p>
            
            <div className="flex flex-wrap gap-4 text-sm text-slate-500 font-medium">
              <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-100">
                <MapPin size={16} className="text-blue-500" />
                {userProfile.location}
              </div>
              <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-100">
                <Mail size={16} className="text-blue-500" />
                {userProfile.email}
              </div>
              <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-100">
                <Phone size={16} className="text-blue-500" />
                {userProfile.phone}
              </div>
            </div>
          </div>
          
          <div className="w-full md:w-64 bg-blue-50 rounded-lg p-4 border border-blue-100 mt-12 md:mt-0">
            <h4 className="font-semibold text-blue-900 mb-3">Target Roles</h4>
            <ul className="space-y-2">
              {userProfile.targetRoles.slice(0, 4).map((role, idx) => (
                <li key={idx} className="flex items-center gap-2 text-sm text-blue-800">
                  <Briefcase size={14} />
                  <span className="truncate">{role}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core Competencies Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-lg font-bold text-slate-900">Core Qualifications</h3>
             <FileText size={18} className="text-slate-400" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {userProfile.coreQualifications.map((qual, idx) => (
               <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="mt-1 h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                  <p className="text-sm text-slate-700">{qual}</p>
               </div>
             ))}
          </div>
        </div>

        {/* Target Industries */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Target Industries</h3>
          <div className="space-y-3">
            {userProfile.industries.map((industry, idx) => (
              <div key={idx} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors group">
                <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  {idx + 1}
                </div>
                <span className="text-slate-700 font-medium text-sm">{industry}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Key Achievements Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-6">Key Achievements & Impact</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {userProfile.keyAchievements.map((achievement, idx) => (
            <div key={idx} className="flex gap-3 items-start p-3 border border-slate-100 rounded-lg hover:border-green-200 hover:bg-green-50/30 transition-all">
              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-slate-700 text-sm leading-snug">{achievement}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};