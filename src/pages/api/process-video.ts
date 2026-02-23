import type { APIRoute } from 'astro';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

export const prerender = false;

// Localiza el Service Account de Firebase dinámicamente como lo hacía injectPost.js
function getServiceAccount() {
    // 1. Prioriza las variables de entorno si están seteadas
    if (import.meta.env.FIREBASE_PRIVATE_KEY) {
        return {
            projectId: import.meta.env.FIREBASE_PROJECT_ID,
            clientEmail: import.meta.env.FIREBASE_CLIENT_EMAIL,
            privateKey: import.meta.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        };
    }

    // 2. Fallback: Escanea la raíz del proyecto buscando el JSON descargado
    const rootDir = process.cwd();
    const files = fs.readdirSync(rootDir);
    for (const file of files) {
        if (file.endsWith('.json') && !file.includes('package') && !file.includes('tsconfig')) {
            try {
                const content = JSON.parse(fs.readFileSync(path.join(rootDir, file), 'utf8'));
                if (content.type === 'service_account' && content.project_id && content.private_key) {
                    return content;
                }
            } catch (e) {
                // Ignorar archivos que no se puedan parsear
            }
        }
    }
    return null;
}

// Inicializa Firebase Admin de forma segura (singleton)
const serviceAccount = getServiceAccount();
if (serviceAccount && getApps().length === 0) {
    initializeApp({
        credential: cert(serviceAccount)
    });
}

export const POST: APIRoute = async ({ request }) => {
    try {
        if (!serviceAccount) {
            throw new Error('Configuración de Firebase Admin no encontrada (Falta el Service Account JSON o Variables de Entorno).');
        }

        const body = await request.json();
        const { url, title, slug, coverUrl } = body;

        if (!url) {
            return new Response(JSON.stringify({ success: false, error: 'URL is required' }), { status: 400 });
        }

        const db = getFirestore();

        // --- LÓGICA DE PROCESAMIENTO MIGRADA ---
        // Generamos la estructura que el sistema espera (Simulando la conversión IA)
        const postSlug = slug || `post-ia-${Date.now()}`;

        const postData = {
            metadata: {
                title: title || 'Protocolo Extraído IA: ' + new URL(url).pathname,
                slug: postSlug,
                date: new Date().toISOString(),
                coverImage: coverUrl || 'https://images.unsplash.com/photo-1542204165-65bf26472b9b',
                views: 0,
                clicks: 0,
                conversions: 0
            },
            content: {
                introduction: 'Este contenido ha sido procesado automáticamente usando nuestro motor de extracción. Origen: ' + url,
                sections: []
            },
            quiz: [
                { question: "Pregunta calibrada de seguridad 1", options: ["A", "B", "C", "D"], correctIndex: 0, rationale: "Base IA" },
                { question: "Pregunta calibrada de seguridad 2", options: ["A", "B", "C", "D"], correctIndex: 1, rationale: "Base IA" },
                { question: "Pregunta calibrada de seguridad 3", options: ["A", "B", "C", "D"], correctIndex: 2, rationale: "Base IA" }
            ],
            app_integration: {
                action_type: 'DOWNLOAD_APP',
                cta_text: 'Descubrir Protocolo'
            }
        };

        // Regla de Ora implementada: db.collection('posts').add(...)
        const docRef = await db.collection('posts').add(postData);

        return new Response(JSON.stringify({
            success: true,
            postId: docRef.id
        }), { status: 200, headers: { 'Content-Type': 'application/json' } });

    } catch (error) {
        console.error("API Error processing video:", error);
        return new Response(JSON.stringify({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown network/server error'
        }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
