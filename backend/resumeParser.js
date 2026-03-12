const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');
dotenv.config();

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

const GITHUB_README_PROMPT = `
You are an expert technical writer and code analyzer. I will provide you with the README content (and possibly other context) of a GitHub repository.
Your goal is to extract and structure the project details into a strict JSON format matching exactly this schema:

{
  "overview": "A comprehensive 2-3 paragraph overview of what the project is, the problem it solves, and its primary use case.",
  "features": ["Feature 1 description", "Feature 2 description", "..."],
  "techStack": ["React", "Node.js", "Docker", "... list of specific technologies used"],
  "architecture": "A brief explanation of how the project is structured or how the components interact (if discernible), otherwise 'Architecture details not specified.'",
  "setupInstructions": "A concise step-by-step markdown string on how to run or install the project (e.g. \`npm install\` then \`npm run dev\`), or 'Setup instructions not provided.' if missing."
}

Return ONLY the raw valid JSON object. Do not include markdown formatting like \`\`\`json. Ensure all arrays exist even if empty.
`;

async function fetchGithubReadme(url) {
  try {
    // Extract owner/repo
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/i);
    if (!match) return null;
    const owner = match[1];
    let repo = match[2].replace(/\.git$/, '');

    // GitHub API requires a User-Agent header
    const headers = { 'User-Agent': 'CodeArena-AI-Parser' };
    
    // Attempt to fetch the default branch README
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, { headers });
    if (!res.ok) return null;
    
    const data = await res.json();
    if (data.content && data.encoding === 'base64') {
        const text = Buffer.from(data.content, 'base64').toString('utf-8');
        return text;
    }
    return null;
  } catch (err) {
    console.error("Failed to fetch GitHub README:", err.message);
    return null;
  }
}

async function parseGithubReadme(githubUrl) {
  if (!githubUrl || typeof githubUrl !== 'string') return null;

  const readmeText = await fetchGithubReadme(githubUrl);
  if (!readmeText) return null;

  const keys = getApiKeys();
  if (keys.length === 0) throw new Error("No Gemini API keys found");

  let lastError;
  for (let i = 0; i < keys.length; i++) {
    try {
      const genAI = new GoogleGenerativeAI(keys[i]);
      // Use flash-lite for fast text processing
      const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite-preview" });

      const result = await model.generateContent([
        `Here is the README content for the repository at ${githubUrl}:\n\n${readmeText.substring(0, 15000)}`, // avoid enormous prompts
        GITHUB_README_PROMPT
      ]);

      let text = result.response.text().trim();
      text = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();

      const parsed = JSON.parse(text);
      return parsed;

    } catch (err) {
      lastError = err;
      console.error(`GitHub parser failed with key ${i + 1}:`, err.message);
      continue;
    }
  }
  return null; // Return null if parsing fails rather than throwing, to not break the enclosing flow
}

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

      const parsedProfile = JSON.parse(text);
      
      // Auto-parse GitHub links for projects
      if (parsedProfile.projects && Array.isArray(parsedProfile.projects)) {
        await Promise.all(parsedProfile.projects.map(async (proj) => {
            if (proj.link && proj.link.toLowerCase().includes('github.com')) {
                const extendedData = await parseGithubReadme(proj.link);
                if (extendedData) {
                    proj.extendedData = extendedData;
                }
            }
        }));
      }

      return parsedProfile;

    } catch (err) {
      lastError = err;
      console.error(`Resume parser failed with key ${i + 1}:`, err.message);
      continue;
    }
  }
  throw new Error("Failed to parse resume after trying all keys. Last error: " + (lastError ? lastError.message : 'Unknown'));
}

module.exports = { parseResumeWithAI, parseGithubReadme };
