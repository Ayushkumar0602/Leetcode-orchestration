import { GoogleGenerativeAI } from "@google/generative-ai";
import 'dotenv/config';

function getApiKeys() {
  const keys = [];
  let index = 1;
  while (true) {
    const key = process.env[`GEMINI_API_KEY_${index}`];
    if (key) {
      keys.push(key);
      index++;
    } else if (index === 1 && process.env.GEMINI_API_KEY) {
      keys.push(process.env.GEMINI_API_KEY);
      break;
    } else {
      break;
    }
  }
  return keys;
}

const RESUME_PROMPT = `
You are an expert resume parser. I will provide you with an image or PDF of a resume. 
Your goal is to extract the details from the resume into a strict JSON format matching exactly this schema:

{
  "bio": "A short, one-line professional summary or tagline (derived from the summary section)",
  "github": "github.com/username (if present, extract only the hostname + path, no https)",
  "linkedin": "linkedin.com/in/username (same domain format)",
  "portfolio": "yoursite.com (any personal website link)",
  "skills": ["Python", "Java", "React", "... list of technical skills exactly as written"],
  "certifications": ["AWS Certified...", "..."],
  "experience": [
    {
      "role": "Software Engineer Intern",
      "company": "Google",
      "duration": "May 2023 - Aug 2023"
    }
  ],
  "education": [
    {
      "degree": "B.Tech in Computer Science",
      "institution": "MIT",
      "year": "2020 - 2024"
    }
  ],
  "projects": [
    {
      "name": "Project Name",
      "desc": "Short 1-senctence description of the project.",
      "link": "github.com/project (if present)"
    }
  ]
}

Return ONLY the raw valid JSON object. Do not include markdown formatting like \`\`\`json. Ensure all arrays exist even if empty.
`;

async function parseResumeWithAI(base64Data, mimeType) {
  const keys = getApiKeys();
  if (keys.length === 0) throw new Error("No Gemini API keys found");

  let lastError;
  for (let i = 0; i < keys.length; i++) {
    try {
      const genAI = new GoogleGenerativeAI(keys[i]);
      const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite-preview" }); // Pro is better for documents

      const result = await model.generateContent([
        { inlineData: { data: base64Data, mimeType: mimeType } },
        RESUME_PROMPT
      ]);

      let text = result.response.text().trim();
      text = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();

      return JSON.parse(text);

    } catch (err) {
      lastError = err;
      console.error(`Resume parser failed with key ${i + 1}:`, err.message);
      continue;
    }
  }
  throw new Error("Failed to parse resume after trying all keys. Last error: " + lastError.message);
}

export { parseResumeWithAI };
