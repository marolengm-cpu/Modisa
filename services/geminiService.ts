
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, JobAnalysisResult, GeneratedContent, JobSearchResult } from "../types";

// Always use the named parameter for apiKey initialization
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const getSystemInstruction = (profile: UserProfile) => `
You are a high-end executive career coach and automation assistant for ${profile.name}, a senior ${profile.targetRoles[0] || 'Executive'} based in ${profile.location}.
Your goal is to help them secure a senior leadership role.
Always use the specific metrics (e.g., "${profile.keyAchievements[0] || ''}") from the profile in your outputs.
Tone: Professional, confident, strategic, and executive-level.
Context: ${profile.logistics.location} job market.
`;

export const parseResume = async (fileBase64: string, mimeType: string): Promise<UserProfile> => {
  const ai = getAI();
  const prompt = `
    Analyze this resume document and extract a structured UserProfile JSON.
    Map the content to the following structure exactly.
    
    Structure Requirements:
    - targetRoles: Extract specific job titles they are targeting or are qualified for.
    - industries: Extract industries they have worked in.
    - coreQualifications: Summarize top skills/qualifications as a list of strings.
    - keyAchievements: Extract quantifiable achievements (e.g., "Saved $1M", "Managed 50 people").
    - logistics: Extract location, license info (if any), and citizenship (if any).
  `;

  // Fix: use gemini-3-flash-preview as per guidelines for basic text tasks
  // Fix: use contents: { parts: [...] } for multi-part content
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: mimeType,
            data: fileBase64
          }
        },
        { text: prompt }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          email: { type: Type.STRING },
          phone: { type: Type.STRING },
          location: { type: Type.STRING },
          summary: { type: Type.STRING },
          targetRoles: { type: Type.ARRAY, items: { type: Type.STRING } },
          industries: { type: Type.ARRAY, items: { type: Type.STRING } },
          coreQualifications: { type: Type.ARRAY, items: { type: Type.STRING } },
          keyAchievements: { type: Type.ARRAY, items: { type: Type.STRING } },
          logistics: {
            type: Type.OBJECT,
            properties: {
              location: { type: Type.STRING },
              license: { type: Type.STRING },
              citizenship: { type: Type.STRING }
            }
          }
        },
        required: ['name', 'summary', 'targetRoles', 'coreQualifications', 'keyAchievements']
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("Failed to parse resume");
  return JSON.parse(text) as UserProfile;
};

export const analyzeJobFit = async (jobDescription: string, userProfile: UserProfile): Promise<JobAnalysisResult> => {
  const ai = getAI();
  const prompt = `
    Analyze the following Job Description against the User Profile.
    
    JOB DESCRIPTION:
    ${jobDescription}

    USER PROFILE:
    ${JSON.stringify(userProfile)}

    Return a JSON object with:
    1. matchScore (0-100)
    2. summary (One sentence on why it fits or doesn't)
    3. matchingKeywords (List of matched skills/requirements)
    4. missingKeywords (List of critical missing skills)
    5. culturalFit (Assessment of industry alignment)
    6. recommendedAction (Apply, Network, or Skip)
  `;

  // Fix: use gemini-3-flash-preview as per guidelines
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      systemInstruction: getSystemInstruction(userProfile),
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          matchScore: { type: Type.NUMBER },
          summary: { type: Type.STRING },
          matchingKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
          missingKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
          culturalFit: { type: Type.STRING },
          recommendedAction: { type: Type.STRING, enum: ['Apply', 'Network', 'Skip'] }
        },
        required: ['matchScore', 'summary', 'matchingKeywords', 'missingKeywords', 'culturalFit', 'recommendedAction']
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  return JSON.parse(text) as JobAnalysisResult;
};

export const generateApplicationMaterials = async (jobDescription: string, userProfile: UserProfile): Promise<GeneratedContent> => {
  const ai = getAI();
  const prompt = `
    Based on the Job Description and the User Profile, generate:
    1. A highly persuasive Cover Letter (max 350 words) highlighting specific achievements from the profile relevant to the job.
    2. A short, punchy LinkedIn connection message to the hiring manager (max 300 chars).
    3. Three likely interview questions for this specific role and suggested STAR method answers using the profile's real achievements.

    JOB DESCRIPTION:
    ${jobDescription}

    USER PROFILE:
    ${JSON.stringify(userProfile)}
  `;

  // Fix: use gemini-3-flash-preview as per guidelines
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      systemInstruction: getSystemInstruction(userProfile),
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          coverLetter: { type: Type.STRING },
          linkedinMessage: { type: Type.STRING },
          interviewQuestions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                suggestedAnswer: { type: Type.STRING }
              }
            }
          }
        }
      }
    }
  });

   const text = response.text;
  if (!text) throw new Error("No response from AI");
  return JSON.parse(text) as GeneratedContent;
};

export const findRelevantJobs = async (userProfile: UserProfile, dateCriteria: string = 'recently'): Promise<JobSearchResult[]> => {
  const ai = getAI();
  
  // Dynamic search prompt based on user profile
  const roles = userProfile.targetRoles.slice(0, 3).join(" or ");
  const location = userProfile.logistics.location || userProfile.location;
  
  const searchPrompt = `Find 5 recent, active job postings for ${roles} positions in ${location} that were posted ${dateCriteria}. Focus on senior/executive roles matching 10+ years experience.`;
  
  // Fix: use gemini-3-flash-preview as per guidelines for text tasks with tools
  const searchResponse = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: searchPrompt,
    config: {
      tools: [{ googleSearch: {} }]
    }
  });

  const rawSearchText = searchResponse.text;
  const groundingChunks = searchResponse.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

  const extractPrompt = `
    Extract job listings from the following text into a structured JSON array.
    For each job, provide a title, company, location, a detailed description/summary, and the direct URL to the job posting if available in the text or grounding metadata.
    
    TEXT TO PROCESS:
    ${rawSearchText}
  `;

  // Fix: use gemini-3-flash-preview as per guidelines
  const extractResponse = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: extractPrompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            company: { type: Type.STRING },
            location: { type: Type.STRING },
            description: { type: Type.STRING },
            url: { type: Type.STRING, description: "The direct link to the job post" }
          },
          required: ['title', 'company', 'location', 'description']
        }
      }
    }
  });

  const text = extractResponse.text;
  if (!text) return [];
  
  const jobs = JSON.parse(text);
  
  return jobs.map((job: any, index: number) => ({
    id: `job-${Date.now()}-${index}`,
    title: job.title,
    company: job.company,
    location: job.location,
    description: job.description,
    url: job.url || groundingChunks[index]?.web?.uri || '#', 
    status: 'pending'
  }));
};
