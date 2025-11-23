export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  targetRoles: string[];
  industries: string[];
  coreQualifications: string[];
  keyAchievements: string[];
  logistics: {
    location: string;
    license: string;
    citizenship: string;
  };
}

export interface JobAnalysisResult {
  matchScore: number;
  summary: string;
  matchingKeywords: string[];
  missingKeywords: string[];
  culturalFit: string;
  recommendedAction: 'Apply' | 'Network' | 'Skip';
}

export interface GeneratedContent {
  coverLetter: string;
  linkedinMessage: string;
  interviewQuestions: Array<{
    question: string;
    suggestedAnswer: string;
  }>;
}

export interface JobSearchResult {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  url?: string;
  analysis?: JobAnalysisResult;
  status: 'pending' | 'analyzing' | 'matched' | 'rejected' | 'applied';
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  JOB_ANALYZER = 'JOB_ANALYZER',
  AUTO_PILOT = 'AUTO_PILOT',
  INTERVIEW_PREP = 'INTERVIEW_PREP'
}