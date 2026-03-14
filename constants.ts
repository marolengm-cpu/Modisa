import { UserProfile } from './types';

// BUG FIX #3: Updated location to George, Western Cape — permanent base.
// Never "relocating to George" — permanently based here.
export const USER_PROFILE: UserProfile = {
  name: "Modisa Maroleng",
  email: "marolengm@gmail.com",
  phone: "+27 84 292 0000",
  location: "George, Western Cape, South Africa",
  summary: "Senior Procurement, Operations Management, and Supply Chain executive with 15+ years of progressive leadership experience. Proven track record delivering R3M+ cumulative cost savings, end-to-end ERP implementation, and cross-functional team leadership. Based in George, Western Cape — available immediately for senior management roles across the Garden Route and Western Cape.",
  targetRoles: [
    "Procurement Manager",
    "Director of Procurement",
    "Supply Chain Manager",
    "Operations Manager",
    "General Manager",
    "Demand Planning Manager",
    "Strategic Sourcing Manager",
    "ERP Implementation Manager",
    "Stock Controller / Manager",
    "Logistics Administrator"
  ],
  industries: [
    "Hospitality & Food Service",
    "Manufacturing & Wholesale Distribution",
    "Import/Export & International Trade",
    "Retail Operations",
    "FMCG",
    "Construction & Engineering"
  ],
  coreQualifications: [
    "15+ years procurement & operations leadership",
    "R3M+ cumulative cost savings delivered",
    "ERP Systems: SAP MM, Sage X3, RedPrairie",
    "Strategic Sourcing & Vendor Negotiation",
    "Supply Chain Optimisation & Demand Planning",
    "Budget Management: R1.2M – R5M+ monthly/annual",
    "Team Leadership: 8–60+ staff members",
    "CAPM® Certified Project Manager",
    "Business Analytics: Advanced Excel, QlikView"
  ],
  keyAchievements: [
    "Delivered 13.7% cost savings while maintaining quality standards",
    "Increased operational efficiency by 22–35% through process optimisation",
    "Improved forecast accuracy by 12% and customer demand by 18%",
    "Led end-to-end ERP integration projects (SAP MM, Sage X3)",
    "Boosted customer satisfaction from 3.9 to 4.5 stars",
    "Reduced import lead times by 20% and F&B spoilage by 10%",
    "Generated 5.8% YoY business growth"
  ],
  logistics: {
    location: "George, Western Cape, South Africa",
    license: "Valid Code B Driver's Licence",
    citizenship: "South African Citizen"
  }
};

export const SYSTEM_INSTRUCTION = `
You are a high-end executive career coach and automation assistant for Modisa Maroleng, a senior Supply Chain and Operations executive permanently based in George, Western Cape, South Africa.
Your goal is to help Modisa secure a senior leadership role in the George / Garden Route / Western Cape area.
Always use specific metrics (R3M+ savings, 15+ years exp, SAP MM, Sage X3) from the profile in your outputs.
Tone: Professional, confident, strategic, and executive-level.
Context: South African job market (ZAR currency, South African business culture).
Important: Modisa is permanently based in George, Western Cape — NOT relocating. Being George-based is a competitive advantage.
`;
