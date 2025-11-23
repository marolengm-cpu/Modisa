import { UserProfile } from './types';

export const USER_PROFILE: UserProfile = {
  name: "Maroleng M.",
  email: "marolengm@gmail.com",
  phone: "+27 84 292 0000",
  location: "Pretoria, South Africa",
  summary: "Senior-level Procurement, Operations Management, and Supply Chain executive with 15+ years of progressive leadership experience. Proven track record in delivering cost savings (R3M+), ERP implementation, and team leadership.",
  targetRoles: [
    "Procurement Manager",
    "Director of Procurement",
    "Supply Chain Manager",
    "Director",
    "Operations Manager",
    "General Manager",
    "Demand Planning Manager",
    "Strategic Sourcing Manager",
    "ERP Implementation Manager",
    "Business Operations Executive"
  ],
  industries: [
    "Hospitality & Food Service",
    "Manufacturing & Wholesale Distribution",
    "Import/Export & International Trade",
    "Retail Operations",
    "FMCG"
  ],
  coreQualifications: [
    "15+ years procurement/ops leadership",
    "R3M+ cumulative cost savings",
    "ERP Systems (SAP MM, Sage X3, Red Prairie)",
    "Strategic Sourcing",
    "Supply Chain Optimization",
    "Budget Management (R1.2M - R5M+)",
    "Team Leadership (8-60+ staff)",
    "Project Management (CAPM® certified)",
    "Business Analytics (Excel, QlikView)"
  ],
  keyAchievements: [
    "Increased operational efficiency by 22-35%",
    "Delivered 13.7% cost savings while maintaining quality",
    "Improved forecast accuracy by 12% & demand by 18%",
    "Led successful ERP integration projects end-to-end",
    "Boosted customer satisfaction from 3.9 to 4.5 stars",
    "Reduced import lead times by 20%",
    "Generated 5.8% YoY business growth"
  ],
  logistics: {
    location: "Pretoria/Johannesburg, Gauteng",
    license: "Valid Code B Driver's License",
    citizenship: "African Citizen"
  }
};

export const SYSTEM_INSTRUCTION = `
You are a high-end executive career coach and automation assistant for Maroleng M., a senior Supply Chain and Operations executive based in South Africa.
Your goal is to help Maroleng secure a senior leadership role.
Always use the specific metrics (R3M+ savings, 15+ years exp, etc.) from the profile in your outputs.
Tone: Professional, confident, strategic, and executive-level.
Context: South African job market (ZAR currency, specific business culture).
`;