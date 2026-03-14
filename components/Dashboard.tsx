import React, { useRef, useState } from 'react';
import { UserProfile } from '../types';
import { parseResume } from '../services/geminiService';
// BUG FIX #5: Removed unused recharts imports (BarChart, Bar, XAxis, YAxis,
// CartesianGrid, Tooltip, ResponsiveContainer, Cell) — they were imported but
// never rendered, causing unnecessary bundle bloat.
import {
  MapPin,
  Phone,
  Mail,
  Briefcase,
  CheckCircle2,
  Upload,
  Loader2,
  FileText,
  Award,
  TrendingUp
} from 'lucide-react';

interface DashboardProps {
  userProfile: UserProfile;
  setUserProfile: (profile: UserProfile) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ userProfile, setUserProfile }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['application/pdf', 'text/plain'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Please upload a PDF or plain text file.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1];

        try {
          const newProfile = await parseResume(base64Data, file.type);
          setUserProfile(newProfile);
        } catch (error) {
          console.error("Failed to parse resume", error);
          setUploadError("Could not analyse this resume. Please ensure it is a clear PDF or Text file.");
        } finally {
          setIsUploading(false);
        }
      };
      reader.onerror = () => {
        setUploadError("Failed to read file. Please try again.");
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error(error);
      setUploadError("An unexpected error occurred.");
      setIsUploading(false);
    }

    // Reset input so the same file can be re-uploaded if needed
    e.target.value = '';
  };

  return (
    <div className="space-y-6 animate-fade-in relative">
      {/* Upload Overlay */}
      {isUploading && (
        <div className="absolute inset-0 bg-white/90 z-50 flex flex-col items-center justify-center rounded-xl backdrop-blur-sm">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
          <p className="text-lg font-semibold text-slate-800">Analysing Resume with AI...</p>
          <p className="text-sm text-slate-500">Extracting skills, achievements, and career history.</p>
        </div>
      )}

      {/* Profile Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 flex flex-col items-end gap-2">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".pdf,application/pdf,text/plain"
            onChange={handleFileUpload}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 disabled:opacity-50 text-blue-700 text-sm font-semibold rounded-lg transition-colors"
          >
            <Upload size={16} />
            Update from Resume
          </button>
          {uploadError && (
            <p className="text-xs text-red-600 font-medium max-w-xs text-right">{uploadError}</p>
          )}
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h2 className="text-3xl font-bold text-slate-900">{userProfile.name}</h2>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold uppercase rounded-full tracking-wide">
                Candidate Profile
              </span>
            </div>
            <p className="text-slate-600 text-base leading-relaxed mb-6 max-w-3xl mt-2">
              {userProfile.summary}
            </p>

            <div className="flex flex-wrap gap-3 text-sm text-slate-500 font-medium">
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
            <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <Briefcase size={16} /> Target Roles
            </h4>
            <ul className="space-y-2">
              {userProfile.targetRoles.slice(0, 5).map((role, idx) => (
                <li key={idx} className="flex items-center gap-2 text-sm text-blue-800">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0" />
                  <span className="truncate">{role}</span>
                </li>
              ))}
              {userProfile.targetRoles.length > 5 && (
                <li className="text-xs text-blue-500 font-medium pl-3.5">
                  +{userProfile.targetRoles.length - 5} more
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core Qualifications */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 lg:col-span-2">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Award size={18} className="text-blue-600" /> Core Qualifications
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {userProfile.coreQualifications.map((qual, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="mt-1.5 h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                <p className="text-sm text-slate-700 leading-snug">{qual}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Target Industries */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-blue-600" /> Target Industries
          </h3>
          <div className="space-y-3">
            {userProfile.industries.map((industry, idx) => (
              <div key={idx} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors group">
                <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
                  {idx + 1}
                </div>
                <span className="text-slate-700 font-medium text-sm">{industry}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Key Achievements */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
          <FileText size={18} className="text-blue-600" /> Key Achievements & Impact
        </h3>
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