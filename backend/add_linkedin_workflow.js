const { createClient } = require('@supabase/supabase-js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://vnnkhcqswoeqnghztpvh.supabase.co';
// Ensure we use the service key from env if available, or fallback
let supabaseKey = process.env.SUPABASE_SERVICE_KEY;
if (!supabaseKey) {
   // Fallback to the one found in setup_supabase.js
   supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjkxODg5MiwiZXhwIjoyMDg4NDk0ODkyfQ.1t1U_yv6lloUu_Tgp-Mh7GgC_3ugH-RN34SrZNXvuyU';
}
const supabase = createClient(supabaseUrl, supabaseKey);

const keys = [];
for (const [key, value] of Object.entries(process.env)) {
  if (key.startsWith('GEMINI_API_KEY') && value.trim()) {
    keys.push(...value.split(',').map(v => v.trim()).filter(v => v));
  }
}
if (keys.length === 0) {
    console.error("No GEMINI_API_KEY found in .env");
    process.exit(1);
}
const genAI = new GoogleGenerativeAI(keys[0]);

async function run() {
  const title = "LinkedIn Apply Workflow";
  const type = "workflow";
  const url = "https://www.linkedin.com";
  
  // Detailed instruction covering all prompting conditions requested by user
  const content = `When the user's objective is to apply for a job on LinkedIn, prioritize the following sequence of actions rigidly to prevent hallucinations:
1. Identify Apply Type: Find the "Easy Apply" button (usually has text like 'Easy Apply'). If only a standard "Apply" button is available, recognize that it will navigate externally. Click the appropriate Apply button (action: 'click').
2. Contact Info step: If you see required fields for Email or Phone Country Code/Number, use the 'type' action to input the user's details if they are blank. Once valid, click the "Next" button.
3. Resume Upload step: If you encounter a "Resume" section, locate the upload button or verify a resume is already selected. Click "Next".
4. Additional Questions step: If presented with radio buttons (e.g., "Will you now or in the future require sponsorship?", "Are you legally authorized to work?"), evaluate the question context and use the 'click' action on the exact 'el-*' ID of the appropriate radio option. For specific text inputs ("How many years of experience..."), use the 'type' action with a numeric value. Click "Review" or "Next".
5. Review Step: When you reach the "Review your application" screen, do not stop. Click the "Submit application" button.
6. Post-Submit: If a completion modal appears saying "Application sent", click the "Done" or "Dismiss" button to finish the job sequence. Then output action: 'done'.
7. Error Handling Loop Guard: If you click 'Next' and the modal does not change, scan the DOM for error messages (e.g., "This field is required", "Enter a valid number"). Find the missing input field, fill it, and click 'Next' again. Do not hallucinate URLs!`;

  const embedModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
  
  // Create an optimal embedding query that will match strongly when the user asks to "apply to jobs" on linkedin
  const embedText = "https://www.linkedin.com linkedin.com apply to jobs linkedin apply workflow easy apply sequence";
  const result = await embedModel.embedContent(embedText);
  const embedding = result.embedding.values;

  // We delete an existing one to avoid duplicates if re-run
  await supabase.from('knowledge_base').delete().eq('title', title);

  const { data, error } = await supabase.from('knowledge_base').insert([{
     id: require('crypto').randomUUID(),
     title,
     content,
     type,
     url,
     embedding
  }]);

  if (error) {
     console.error("Insertion failed:", error);
  } else {
     console.log("Successfully inserted LinkedIn workflow into knowledge DB.");
  }
}

run();
