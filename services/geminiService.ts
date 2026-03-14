import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, JobAnalysisResult, GeneratedContent, JobSearchResult } from "../types";

// Always use the named parameter for apiKey initialization
const getAI = () => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// BUG FIX #1: 'gemini-3-flash-preview' does not exist.
// Correct model is 'gemini-2.5-flash'. All references updated below.
const MODEL = 'gemini-2.5-flash';

const getSystemInstruction = (profile: UserProfile) => `
You are a high-end executive career coach and automation assistant for ${profile.name}, a senior ${profile.targetRoles[0] || 'Executive'} based in ${profile.location}.
Your goal is to help them secure a senior leadership role.
Always use specific metrics from their profile achievements in your outputs.
Tone: Professional, confident, strategic, and executive-level.
Context: South African job market (ZAR currency).
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
    - keyAchievements: Extract quantifiable achievements (e.g., "Saved R3M", "Managed 50 people").
    - logistics: Extract location, license info (if any), and citizenship (if any).
  `;

  const response = await ai.models.generateContent({
    model: MODEL,
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
    Name: ${userProfile.name}
    Summary: ${userProfile.summary}
    Location: ${userProfile.location}
    Target Roles: ${userProfile.targetRoles.join(', ')}
    Core Qualifications: ${userProfile.coreQualifications.join(', ')}
    Key Achievements: ${userProfile.keyAchievements.join(', ')}
    Industries: ${userProfile.industries.join(', ')}

    Return a JSON object with:
    1. matchScore (0-100 integer)
    2. summary (One sentence on why it fits or doesn't)
    3. matchingKeywords (List of matched skills/requirements, max 8 items)
    4. missingKeywords (List of critical missing skills, max 5 items)
    5. culturalFit (1-2 sentence assessment of industry alignment)
    6. recommendedAction (must be exactly one of: Apply, Network, or Skip)
  `;

  const response = await ai.models.generateContent({
    model: MODEL,
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
    Based on the Job Description and the User Profile, generate application materials.
    
    Generate:
    1. A highly persuasive Cover Letter (max 350 words) highlighting specific achievements from the profile relevant to the job. Use South African English. Reference specific metrics.
    2. A short, punchy LinkedIn connection message to the hiring manager (max 300 chars).
    3. Three likely interview questions for this specific role and suggested STAR method answers using the profile's real achievements.

    JOB DESCRIPTION:
    ${jobDescription}

    USER PROFILE:
    Name: ${userProfile.name}
    Summary: ${userProfile.summary}
    Location: ${userProfile.location}
    Achievements: ${userProfile.keyAchievements.join(' | ')}
    Qualifications: ${userProfile.coreQualifications.join(' | ')}
  `;

  const response = await ai.models.generateContent({
    model: MODEL,
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
              },
              required: ['question', 'suggestedAnswer']
            }
          }
        },
        required: ['coverLetter', 'linkedinMessage', 'interviewQuestions']
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  return JSON.parse(text) as GeneratedContent;
};

export const findRelevantJobs = async (
  userProfile: UserProfile,
  dateRange: string = 'within the last 7 days'
): Promise<JobSearchResult[]> => {
  const ai = getAI();

  // BUG FIX #2: Use effective location — prefer logistics.location over profile.location
  // and guard against undefined with a safe fallback
  const location = (userProfile.logistics?.location || userProfile.location || 'South Africa').trim();
  const roles = userProfile.targetRoles.slice(0, 3).join(" or ");

  const searchPrompt = `Find 5 active, currently open job postings for ${roles} positions located in ${location}, posted ${dateRange}. Focus on senior and executive-level roles requiring 10+ years of experience. Include the direct application URL for each posting if available.`;

  const searchResponse = await ai.models.generateContent({
    model: MODEL,
    contents: searchPrompt,
    config: {
      tools: [{ googleSearch: {} }]
    }
  });

  const rawSearchText = searchResponse.text || '';
  const groundingChunks = searchResponse.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

  if (!rawSearchText) return [];

  const extractPrompt = `
    Extract job listings from the following search result text into a structured JSON array.
    Only include real, verifiable job postings. For each job provide:
    - title: exact job title
    - company: hiring company name
    - location: job location (city, province, country)
    - description: detailed role description and requirements (min 100 words)
    - url: direct link to the job posting (use '#' if not available)
    
    If fewer than 5 real postings are found, return only those found. Do not invent jobs.
    
    TEXT TO PROCESS:
    ${rawSearchText}
  `;

  const extractResponse = await ai.models.generateContent({
    model: MODEL,
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
            url: { type: Type.STRING }
          },
          required: ['title', 'company', 'location', 'description']
        }
      }
    }
  });

  const text = extractResponse.text;
  if (!text) return [];

  let jobs: any[] = [];
  try {
    jobs = JSON.parse(text);
    if (!Array.isArray(jobs)) return [];
  } catch {
    return [];
  }

  return jobs.map((job: any, index: number) => ({
    id: `job-${Date.now()}-${index}`,
    title: job.title || 'Untitled Position',
    company: job.company || 'Unknown Company',
    location: job.location || location,
    description: job.description || '',
    url: job.url && job.url !== '#'
      ? job.url
      : (groundingChunks[index]?.web?.uri || '#'),
    status: 'pending' as const
  }));
};
