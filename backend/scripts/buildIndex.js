require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') }); // load backend env
const { createClient } = require('@supabase/supabase-js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { db, collection, getDocs } = require('../firebase');

// Add these to backend/.env or just hardcode for the script since they are public in your other files
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://vnnkhcqswoeqnghztpvh.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjkxODg5MiwiZXhwIjoyMDg4NDk0ODkyfQ.1t1U_yv6lloUu_Tgp-Mh7GgC_3ugH-RN34SrZNXvuyU';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// You can use any of your Gemini keys
const GEMINI_API_KEY = process.env.GEMINI_API_KEY_1 || process.env.GEMINI_API_KEY_2;
if (!GEMINI_API_KEY) throw new Error("Missing Gemini API Key");

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
// We use Google's free text embedding model
const embedModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });

async function getEmbedding(text) {
    const result = await embedModel.embedContent(text);
    return result.embedding.values;
}

// Ensure the index doesn't already have these by upserting
async function upsertToSupabase(knowledgeBlocks) {
    console.log(`Upserting ${knowledgeBlocks.length} records to Supabase...`);
    
    // Process in smaller batches to avoid rate limits / payload size limits
    const BATCH_SIZE = 50;
    for (let i = 0; i < knowledgeBlocks.length; i += BATCH_SIZE) {
        const batch = knowledgeBlocks.slice(i, i + BATCH_SIZE);
        const { error } = await supabase.from('knowledge_base').upsert(batch);
        
        if (error) {
            console.error('Batch upsert failed:', error);
        } else {
            console.log(`Successfully upserted batch ${i / BATCH_SIZE + 1} of ${Math.ceil(knowledgeBlocks.length / BATCH_SIZE)}`);
        }
    }
}

async function indexCourses() {
    console.log("Fetching Courses...");
    const snap = await getDocs(collection(db, 'youtubecourses'));
    const blocks = [];
    
    for (const doc of snap.docs) {
        const data = doc.data();
        const content = `Course Title: ${data.title}\nDescription: ${data.description}\nInstructor: ${data.instructor || 'Unknown'}\nCategory: ${data.category || 'General'}`;
        
        console.log(`Embedding course: ${data.title}`);
        const vector = await getEmbedding(content);
        
        blocks.push({
            id: `course_${doc.id}`,
            type: 'course',
            title: data.title || 'Untitled Course',
            content: content,
            url: `/learn/${data.slug || doc.id}`,
            metadata: { category: data.category, instructor: data.instructor },
            embedding: vector
        });
        
        // Wait 300ms between requests to avoid google limits
        await new Promise(r => setTimeout(r, 300));
    }
    
    return blocks;
}

async function indexProblems() {
    console.log("Fetching DSA Problems...");
    const snap = await getDocs(collection(db, 'stats'));
    const blocks = [];
    
    for (const doc of snap.docs) {
        const data = doc.data();
        if (!data.title) continue; // Skip malformed docs
        
        const tags = Array.isArray(data.tags) ? data.tags.join(', ') : '';
        const content = `Problem Title: ${data.title}\nDifficulty: ${data.difficulty}\nTags: ${tags}\nDescription: ${data.description || 'No description'}`;
        
        console.log(`Embedding problem: ${data.title}`);
        const vector = await getEmbedding(content);
        
        blocks.push({
            id: `problem_${doc.id}`,
            type: 'problem',
            title: data.title,
            content: content,
            url: `/solvingpage/${data.id || doc.id}`, // the numeric ID is typically used for the route
            metadata: { difficulty: data.difficulty, tags: data.tags },
            embedding: vector
        });
        
        await new Promise(r => setTimeout(r, 300));
    }
    
    return blocks;
}

async function main() {
    try {
        console.log("Starting Knowledge Base Indexing...");
        
        const courses = await indexCourses();
        const problems = await indexProblems();
        
        const allKnowledge = [...courses, ...problems];
        
        if (allKnowledge.length > 0) {
            await upsertToSupabase(allKnowledge);
            console.log("✅ Custom Knowledge Base built successfully!");
        } else {
            console.log("No content found to index.");
        }
        
        process.exit(0);
    } catch (error) {
        console.error("Critical error during indexing:", error);
        process.exit(1);
    }
}

main();
