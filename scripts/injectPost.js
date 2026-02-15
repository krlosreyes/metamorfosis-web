
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Find Service Account Key
function findServiceAccount() {
    const rootDir = path.resolve(__dirname, '..');
    const files = fs.readdirSync(rootDir);

    // Look for any .json file that contains "private_key" and "client_email"
    for (const file of files) {
        if (file.endsWith('.json') && file !== 'package.json' && file !== 'package-lock.json' && file !== 'tsconfig.json') {
            try {
                const content = JSON.parse(fs.readFileSync(path.join(rootDir, file), 'utf8'));
                if (content.type === 'service_account' && content.project_id && content.private_key) {
                    console.log(`✅ Found Service Account: ${file}`);
                    return content;
                }
            } catch (e) {
                // Ignore parsing errors for non-JSON files or invalid JSON
            }
        }
    }
    return null;
}

const serviceAccount = findServiceAccount();

if (!serviceAccount) {
    console.error('❌ Error: No Service Account file found in the root directory.');
    console.error('Please place your Firebase Service Account JSON file in the root of the project.');
    process.exit(1);
}

initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();

async function uploadPost() {
    // Get JSON file path from args
    const filePath = process.argv[2];

    if (!filePath) {
        console.error('❌ Error: Please provide the path to the JSON file.');
        console.error('Usage: node scripts/injectPost.js <path-to-json-file>');
        process.exit(1);
    }

    try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const postData = JSON.parse(fileContent);

        // Validation
        if (!postData.metadata || !postData.metadata.slug) {
            throw new Error("Invalid Schema: 'metadata.slug' is required.");
        }
        if (!postData.content) {
            throw new Error("Invalid Schema: 'content' is required.");
        }
        if (!postData.app_integration) {
            console.warn("⚠️ Warning: 'app_integration' is missing. Proceeding anyway.");
        }

        // Quiz validation
        if (!postData.quiz || !Array.isArray(postData.quiz)) {
            throw new Error("Invalid Schema: 'quiz' must be an array.");
        }

        if (postData.quiz.length < 3 || postData.quiz.length > 5) {
            throw new Error("Invalid Schema: 'quiz' must contain 3-5 questions.");
        }

        postData.quiz.forEach((q, idx) => {
            if (!q.question || typeof q.question !== 'string') {
                throw new Error(`Invalid Schema: quiz[${idx}].question is required and must be a string.`);
            }
            if (!Array.isArray(q.options) || q.options.length !== 4) {
                throw new Error(`Invalid Schema: quiz[${idx}].options must be an array with exactly 4 items.`);
            }
            q.options.forEach((opt, optIdx) => {
                if (typeof opt !== 'string') {
                    throw new Error(`Invalid Schema: quiz[${idx}].options[${optIdx}] must be a string.`);
                }
            });
            if (typeof q.correctIndex !== 'number' || q.correctIndex < 0 || q.correctIndex > 3) {
                throw new Error(`Invalid Schema: quiz[${idx}].correctIndex must be a number between 0-3.`);
            }
            if (!q.rationale || typeof q.rationale !== 'string') {
                throw new Error(`Invalid Schema: quiz[${idx}].rationale is required and must be a string.`);
            }
        });

        console.log(`✅ Quiz validation passed: ${postData.quiz.length} questions validated.`);

        const slug = postData.metadata.slug;
        const docRef = db.collection('metamorfosis_posts').doc(slug);

        await docRef.set(postData);

        console.log(`✅ Successfully uploaded post: ${slug}`);
        console.log(`📄 Document ID: ${slug}`);

    } catch (error) {
        console.error('❌ Error uploading post:', error.message);
        process.exit(1);
    }
}

uploadPost();
