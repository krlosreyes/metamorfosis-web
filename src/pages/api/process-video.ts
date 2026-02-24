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

        const { url, title, transcript, coverUrl } = body;

        // --- EXTRACCIÓN DE CONTENIDO REAL (Lógica IA) ---
        // Se asume que la transcripción se envía desde el frontend o se extrae previamente.
        // Si no hay transcripción válida suministrada, la AI no podrá procesar (Regla de "Cero Placeholders")
        if (!transcript || transcript.trim().length < 50) {
            console.error("No transcript provided or too short.");
            return new Response(JSON.stringify({ success: false, error: 'Error de Análisis de Contenido' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }

        const OPENAI_API_KEY = import.meta.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY;
        if (!OPENAI_API_KEY) {
            console.error("OPENAI_API_KEY is missing.");
            return new Response(JSON.stringify({ success: false, error: 'Error de Análisis de Contenido' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }

        const systemPrompt = `Actúa como Senior AI Content Engineer en Salud Metabólica.
Tu tarea es analizar la siguiente transcripción de un video de YouTube y extraer un objeto JSON estricto.

Reglas:
1. Title: Extrae el título real y atractivo del video.
2. Slug: Genera un slug basado en ese título (ej: insulina-y-ayuno).
3. Quiz: Genera 3 preguntas de opción múltiple basadas en los puntos clave discutidos en el video, con explicaciones (rationale) científicas, y 'correctIndex' (0-3).
4. Sections: Divide el contenido en 3-4 secciones con títulos H2, asegurando que CADA PÁRRAFO de la sección NO SUPERE LAS 3 LÍNEAS.
5. CERO PLACEHOLDERS permitidos. Prohibido usar "Protocolo Extraído IA" o "Pregunta de seguridad".

Transcripción a analizar:
"""
${transcript.substring(0, 15000) /* Limitamos a ~15k chars para context window */}
"""

Devuelve EXCLUSIVAMENTE un JSON con esta estructura exacta, sin markdown de bloques de código:
{
  "title": "",
  "slug": "",
  "content": {
    "introduction": "",
    "sections": [
       "<h2 class='text-xl font-bold mb-4'>Título de Sección 1</h2><p class='mb-4'>Párrafo corto 1 (max 3 líneas).</p><p class='mb-4'>Párrafo corto 2.</p>",
       "<h2 class='text-xl font-bold mb-4'>Título de Sección 2</h2><p class='mb-4'>Párrafo corto 1.</p>"
    ]
  },
  "quiz": [
    { "question": "", "options": ["", "", "", ""], "correctIndex": 0, "rationale": "" }
  ]
}`;

        console.log("Contactando a la IA para extracción de contenido real...");
        const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [{ role: 'user', content: systemPrompt }],
                temperature: 0.3
            })
        });

        if (!aiResponse.ok) {
            console.error("Fallo de la IA:", await aiResponse.text());
            return new Response(JSON.stringify({ success: false, error: 'Error de Análisis de Contenido' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }

        const aiData = await aiResponse.json();
        const rawJsonString = aiData.choices[0].message.content.trim().replace(/^```json/i, '').replace(/```$/i, '').trim();

        // Validamos la salida
        let parsedContent;
        try {
            parsedContent = JSON.parse(rawJsonString);
        } catch (parseErr) {
            console.error("JSON Parsing failed from AI output:", rawJsonString);
            return new Response(JSON.stringify({ success: false, error: 'Error de Análisis de Contenido' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }

        // Si genera placeholders accidentales (regla estricta)
        if (parsedContent.title?.includes("Extraído IA") || parsedContent.quiz?.[0]?.question?.includes("seguridad")) {
            return new Response(JSON.stringify({ success: false, error: 'Error de Análisis de Contenido' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }

        // Mapeo Final de los Datos al Esquema de Firestore
        const postData = {
            title: parsedContent.title || title,
            slug: parsedContent.slug,
            content: parsedContent.content,
            quiz: parsedContent.quiz,
            metadata: {
                views: 0,
                conversions: 0,
                videoUrl: url,
                category: "Salud Metabólica"
            },
            coverImage: coverUrl || "https://images.unsplash.com/photo-1542204165-65bf26472b9b?q=80&w=1920&auto=format&fit=crop",
            date: new Date().toISOString()
        };

        // Regla de Oro implementada: Inyectar estrictamente en metamorfosis_posts
        const postRef = await db.collection('metamorfosis_posts').add(postData);
        console.log(`Inyección exitosa. Documento guardado en metamorfosis_posts con ID: ${postRef.id}`);

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
