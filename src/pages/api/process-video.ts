import type { APIRoute } from 'astro';
import { db } from '../../lib/firebaseAdmin';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
    try {
        console.log("Iniciando inyección en Firestore...");

        const body = await request.json();

        // Validación de datos robusta
        if (!body || Object.keys(body).length === 0 || !body.url) {
            console.error("Payload vacío o URL ausente.");
            return new Response(JSON.stringify({ success: false, error: 'Error: Contenido no generado' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        const { url, title, slug, coverUrl } = body;

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

        // Regla de Oro implementada: Inyección mediante db.collection().add()
        const postRef = await db.collection('posts').add(postData);
        console.log(`Inyección exitosa. Documento guardado con ID: ${postRef.id}`);

        return new Response(JSON.stringify({
            success: true,
            postId: postRef.id
        }), { status: 200, headers: { 'Content-Type': 'application/json' } });

    } catch (error) {
        console.error("Detalle del error al inyectar en Firestore:", error);
        return new Response(JSON.stringify({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown network/server error'
        }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
