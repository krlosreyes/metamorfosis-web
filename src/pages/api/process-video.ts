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

        const { url, title, coverUrl } = body;

        let videoId = '';
        try {
            const urlObj = new URL(url);
            videoId = urlObj.searchParams.get('v') || urlObj.pathname.split('/').pop() || '';
            if (!videoId) throw new Error("Invalid Video ID");
        } catch {
            console.error("URL Invalida:", url);
            return new Response(JSON.stringify({ success: false, error: 'Error: URL de YouTube Inválida' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        console.log("ID de Video detectado:", videoId);

        // --- EXTRACCIÓN ROBUSTA DE TRANSCRIPCIÓN (Nativa) ---
        let transcript = '';
        try {
            console.log("Descargando subtítulos del video...");
            const videoPage = await fetch(`https://www.youtube.com/watch?v=${videoId}`);
            const html = await videoPage.text();

            const captionsJsonText = html.split('"captions":')?.[1]?.split(',"videoDetails"')?.[0];
            if (!captionsJsonText) throw new Error("Video no tiene subtítulos habilitados.");

            const captions = JSON.parse(captionsJsonText);
            const tracks = captions?.playerCaptionsTracklistRenderer?.captionTracks || [];

            if (tracks.length === 0) throw new Error("Video no tiene subtítulos habilitados.");

            // Trata de buscar subtítulos en Español explícitamente, si no, agarra el primero
            const track = tracks.find((t: any) => t.languageCode === 'es' || t.languageCode.includes('es')) || tracks[0];

            console.log(`Usando subtítulo en idioma: ${track.languageCode}`);
            const xmlResponse = await fetch(track.baseUrl);
            const xmlText = await xmlResponse.text();

            // Limpiar XML a texto puro
            transcript = xmlText.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim();

        } catch (error) {
            console.error("Fallo obteniendo la transcripción de YouTube:", error);
            return new Response(JSON.stringify({ success: false, error: 'Error: El video no tiene subtítulos disponibles para procesar' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }

        console.log("Longitud de transcripción obtenida:", transcript.length);

        if (transcript.trim().length < 10) {
            console.error("La transcripción es demasiado corta para generar contenido.");
            return new Response(JSON.stringify({ success: false, error: 'Error: El video no tiene subtítulos disponibles para procesar' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }

        const OPENAI_API_KEY = import.meta.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY;
        if (!OPENAI_API_KEY) {
            console.error("OPENAI_API_KEY is missing.");
            return new Response(JSON.stringify({ success: false, error: 'Error de Análisis de Contenido' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }

        const systemPrompt = `Actúa como Senior AI Content Engineer y Especialista en "Ingeniería Humana" Metabólica.
Tu tarea es analizar la siguiente transcripción de un video corto (Short) y su título, y extraer un objeto JSON estricto.

Regla Crítica para Shorts: NO te limites a resumir. EXPANDIR los conceptos profundamente. 
Si el video menciona la insulina, usa el concepto de "la llave" y la "cerradura oxidada" (resistencia a la insulina) para explicar los receptores celulares y el exceso de glucosa. Usa exactamente esta estructura de H2 si aplica:
- El Mecanismo de la Llave: El proceso normal del páncreas.
- El Error del Sistema (Cerradura Oxidada): Cómo el exceso de azúcar causa resistencia.
- Consecuencias y Solución: Aumento de peso y cambio de hábitos.

Reglas:
1. Title: Genera un título real y atractivo (ej: ¿Qué es la Insulina? La Llave de tu Metabolismo).
2. Slug: Genera un slug basado en ese título (ej: que-es-la-insulina-clave-salud).
3. Quiz: Genera 3 preguntas de opción múltiple basadas en los puntos clave discutidos en la transcripción, con explicaciones (rationale) científicas, y 'correctIndex' (0-3). Mapea bien las respuestas según los tiempos de la transcripción corta.
4. Sections: Divide el contenido en 3-4 secciones con títulos H2, asegurando que CADA PÁRRAFO NO SUPERE LAS 3 LÍNEAS.
5. CoverPrompt: Genera un prompt en inglés para Midjourney (ej: "cinematic 3d render of a cell being opened by a cyan energy key, dark technological background, hyper-detailed, 8k").
6. CERO PLACEHOLDERS. Prohibido usar "Protocolo Extraído IA". Si no puedes generar algo real, falla contundentemente.

Título del video: "${title}"
Transcripción a analizar:
"""
${transcript.substring(0, 15000)}
"""

Devuelve EXCLUSIVAMENTE un JSON con esta estructura exacta, sin markdown:
{
  "title": "",
  "slug": "",
  "coverPrompt": "",
  "content": {
    "introduction": "",
    "sections": [
       "<h2 class='text-xl font-bold mb-4'>Título de Sección 1</h2><p class='mb-4'>Párrafo corto 1 (max 3 líneas).</p><p class='mb-4'>Párrafo corto 2.</p>"
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
            slug: parsedContent.slug || title.replace(/\s+/g, '-').toLowerCase(),
            content: parsedContent.content,
            quiz: parsedContent.quiz,
            metadata: {
                views: 0,
                conversions: 0,
                videoUrl: url,
                category: "Salud Metabólica",
                imagePrompt: parsedContent.coverPrompt || ""
            },
            coverImage: coverUrl || "https://images.unsplash.com/photo-1532187863486-abf9db0c2095?q=80&w=1920&auto=format&fit=crop", // Tecnológico placeholder
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
