import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_URL = 'https://leetcode-orchestration.onrender.com/api/public/courses';
const DIST_DIR = path.resolve(__dirname, 'dist');
const COURSES_DIR = path.join(DIST_DIR, 'courses');

async function generateCoursePreviews() {
    console.log('Fetching public courses for dynamic OG tags generation...');
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`Failed to fetch courses: ${response.statusText}`);
        }
        const data = await response.json();
        const courses = data.courses || [];

        if (courses.length === 0) {
            console.log('No public courses found.');
            return;
        }

        // Read the built index.html
        const indexPath = path.join(DIST_DIR, 'index.html');
        if (!fs.existsSync(indexPath)) {
            console.error('dist/index.html not found. Make sure this script runs AFTER vite build.');
            process.exit(1);
        }

        const baseHtml = fs.readFileSync(indexPath, 'utf-8');

        // Ensure dist/courses directory exists
        if (!fs.existsSync(COURSES_DIR)) {
            fs.mkdirSync(COURSES_DIR, { recursive: true });
        }

        let generatedCount = 0;

        for (const course of courses) {
            if (!course.slug) continue;
            
            console.log(`Generating static preview HTML for course: ${course.slug}`);
            
            const title = `${course.title} | Whizan AI`;
            const description = course.shortDescription || course.description || 'Master software engineering concepts with our interactive AI-powered course.';
            const image = course.thumbnailUrl || 'https://whizan.xyz/og-image.png';
            const url = `https://whizan.xyz/courses/${course.slug}`;

            // Replace meta tags in HTML
            let modifiedHtml = baseHtml
                // Replace title
                .replace(/<title>.*?<\/title>/s, `<title>${title}</title>`)
                // Replace description meta
                .replace(/<meta\s+name="description"\s+content=".*?"\s*\/>/s, `<meta name="description" content="${description.replace(/"/g, '&quot;')}" />`)
                // Replace OG title
                .replace(/<meta\s+property="og:title"\s+content=".*?"\s*\/>/s, `<meta property="og:title" content="${title.replace(/"/g, '&quot;')}" />`)
                // Replace OG description
                .replace(/<meta\s+property="og:description"\s+content=".*?"\s*\/>/s, `<meta property="og:description" content="${description.replace(/"/g, '&quot;')}" />`)
                // Replace OG image
                .replace(/<meta\s+property="og:image"\s+content=".*?"\s*\/>/s, `<meta property="og:image" content="${image}" />`)
                // Replace OG url
                .replace(/<meta\s+property="og:url"\s+content=".*?"\s*\/>/s, `<meta property="og:url" content="${url}" />`)
                // Replace Twitter title
                .replace(/<meta\s+name="twitter:title"\s+content=".*?"\s*\/>/s, `<meta name="twitter:title" content="${title.replace(/"/g, '&quot;')}" />`)
                // Replace Twitter description
                .replace(/<meta\s+name="twitter:description"\s+content=".*?"\s*\/>/s, `<meta name="twitter:description" content="${description.replace(/"/g, '&quot;')}" />`)
                // Replace Twitter image
                .replace(/<meta\s+name="twitter:image"\s+content=".*?"\s*\/>/s, `<meta name="twitter:image" content="${image}" />`);

            // Ensure the specific course directory exists (e.g., dist/courses/dsa-playlist)
            const coursePath = path.join(COURSES_DIR, course.slug);
            if (!fs.existsSync(coursePath)) {
                fs.mkdirSync(coursePath, { recursive: true });
            }

            // Write the modified index.html to dist/courses/[slug]/index.html
            fs.writeFileSync(path.join(coursePath, 'index.html'), modifiedHtml, 'utf-8');
            generatedCount++;
        }

        console.log(`✅ Successfully generated ${generatedCount} custom static HTML previews in dist/courses/`);

    } catch (err) {
        console.error('Error in generate_course_previews.js:', err);
    }
}

generateCoursePreviews();
