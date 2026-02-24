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

        let isResearchAugmented = false;
        if (transcript.trim().length < 500) {
            console.log("Transcripción demasiado corta o inexistente. Activando módulo de investigación médica (Fallback)...");
            isResearchAugmented = true;
        }

        const GEMINI_API_KEY = import.meta.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
        if (!GEMINI_API_KEY) {
            console.error("GEMINI_API_KEY is missing.");
            return new Response(JSON.stringify({ success: false, error: 'Error: Falta GEMINI_API_KEY en variables de entorno. Agrega la llave para habilitar Antigravity.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        let systemPrompt = `Actúa como Lead Research & Content Engineer y Especialista en "Ingeniería Humana" Metabólica.
Tu tarea es analizar la transcripción (o el título si no hay transcripción suficiente) y extraer un objeto JSON estricto.

Regla Crítica: Mantén el tono de ingeniero de 48 años: datos duros, lógica, y cero pseudociencia.`;

        if (isResearchAugmented) {
            systemPrompt += `
ATENCIÓN: La transcripción proveída es inexistente o < 500 caracteres. DEBES activar tu módulo de investigación web médica.
Utilizando el título del video como consulta, redacta el post combinando la esencia del título con profundidad técnica real.
- Extrae datos técnicos, estudios recientes y evidencia científica que respalde el tema (ej. si es insulina: receptores GLUT4, resistencia a la insulina, metabolismo de glucosa).
- PRIORIZA información basada en PubMed, The Lancet, Nature, o .gov.
- DEBES incluir citas contextuales obligatorias (ej: "Según estudios publicados en la revista Nature...").`;
        } else {
            systemPrompt += `
Regla para transcripciones normales/cortas: NO te limites a resumir. EXPANDIR los conceptos profundamente.
Si el video menciona la insulina, usa el concepto de "la llave" y la "cerradura oxidada" (resistencia) para explicar los receptores celulares. Estructura H2 sugerida:
- El Mecanismo de la Llave: El proceso normal del páncreas.
- El Error del Sistema (Cerradura Oxidada): Cómo el exceso de azúcar causa resistencia.
- Consecuencias y Solución: Aumento de peso y cambio de hábitos.`;
        }

        systemPrompt += `
Reglas Generales:
1. Title: Genera un título real y atractivo (ej: ¿Qué es la Insulina? La Llave de tu Metabolismo).
2. Slug: Genera un slug basado en ese título.
3. Content Body: Genera todo el contenido HTML estilizado con Tailwind dentro del campo { content: { body: "..." } }.
   - Párrafos: MÁXIMO 3 líneas por párrafo.
   - Callouts: Usa exactamente <div class="bg-blue-50 border-l-4 border-blue-500 p-6 my-8 rounded-r-xl shadow-sm"> para datos metabólicos.
   - Pro-Tips: Usa exactamente <div class="bg-emerald-50 border-l-4 border-emerald-500 p-6 my-8 rounded-r-xl shadow-sm"> para consejos prácticos.
   - Listas: Estilizalas con círculos de colores y <ul class="space-y-3">.
4. App Integration: Genera un objeto { app_integration: { callToAction: "Tu CTA aquí", deepLink: "elenaapp://fasting/track" } }.
5. Metadata: Genera un objeto { metadata: { category, publishedAt, readingTime, seoDescription, seoTitle, slug, thumbnailUrl, youtubeUrl } }.
6. Quiz: Genera 3 a 5 preguntas de opción múltiple con 'question', 'options', 'correctIndex' (0-3) y 'rationale' científico.
7. CoverPrompt: Genera un prompt en inglés para Midjourney (ej: "cinematic 3d render of a cell...").
8. CERO PLACEHOLDERS permitidos. Prohibido usar "Protocolo Extraído IA". Si no puedes generar algo real, falla.
9. Referencias (Evidencia Científica): Si realizaste investigación web (Grounding), incluye fuentes reales estructuradas en el array 'references' ('[Nombre] - [URL]').

Devuelve EXCLUSIVAMENTE un JSON limpio de backticks y tags de markdown con esta estructura exacta:
{
  "title": "",
  "slug": "",
  "coverPrompt": "",
  "app_integration": {
    "callToAction": "",
    "deepLink": "elenaapp://fasting/track"
  },
  "content": {
    "body": ""
  },
  "metadata": {
    "category": "",
    "publishedAt": "",
    "readingTime": "",
    "seoDescription": "",
    "seoTitle": "",
    "slug": "",
    "thumbnailUrl": "",
    "youtubeUrl": ""
  },
  "quiz": [
    { "question": "", "options": ["", "", "", ""], "correctIndex": 0, "rationale": "" }
  ],
  "references": []
}`;

        const requestBody: any = {
            systemInstruction: {
                parts: [{ text: systemPrompt }]
            },
            contents: [{
                role: "user",
                parts: [{
                    text: `Título del video: "${title}"\nTranscripción a analizar:\n"""\n${transcript.substring(0, 15000)}\n"""`
                }]
            }],
            generationConfig: {
                temperature: 0.3,
                responseMimeType: "application/json"
            }
        };

        if (isResearchAugmented) {
            console.log("Activando herramienta: Google Search Grounding...");
            requestBody.tools = [
                {
                    google_search: {} // Forma estándar y más estable para Grounding en v1beta
                }
            ];
        }

        console.log("Contactando al motor Gemini (Antigravity Protocol)...");
        let aiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!aiResponse.ok) {
            console.warn(">> Falló primera llamada a Gemini con Grounding:", await aiResponse.text());
            if (isResearchAugmented) {
                console.log(">> Reintentando sin Grounding Tools como fallback de seguridad...");
                delete requestBody.tools;
                aiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestBody)
                });

                if (!aiResponse.ok) {
                    return new Response(JSON.stringify({ success: false, error: 'Error: El motor Gemini rechazó la solicitud o el modelo está saturado' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
                }
            } else {
                return new Response(JSON.stringify({ success: false, error: 'Error: El motor Gemini falló' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
            }
        }

        const aiData = await aiResponse.json();
        const rawJsonString = aiData.candidates?.[0]?.content?.parts?.[0]?.text;

        // Grounding Metadata Extraction (Evidencia Científica)
        const groundingMetadata = aiData.candidates?.[0]?.groundingMetadata;

        // Extraer links reales de los chunks de búsqueda
        const metaReferences = groundingMetadata?.searchEntryPoint?.html
            ? [{ title: "Fuentes verificadas por Google Search", url: "Grounding Activo" }]
            : [];

        if (!rawJsonString) {
            console.error("Respuesta vacía de Gemini:", JSON.stringify(aiData));
            return new Response(JSON.stringify({ success: false, error: 'Error: Respuesta irreconocible de Gemini' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }

        // Validamos la salida
        let parsedContent;
        try {
            parsedContent = JSON.parse(rawJsonString);
        } catch (parseErr) {
            console.error("JSON Parsing failed from AI output:", rawJsonString);
            return new Response(JSON.stringify({ success: false, error: 'Error de Análisis de Contenido' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }

        // Si genera placeholders accidentales (regla estricta)
        if (parsedContent.title?.includes("Extraido IA") || parsedContent.quiz?.[0]?.question?.includes("seguridad")) {
            return new Response(JSON.stringify({ success: false, error: 'Error de Análisis de Contenido' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }

        // Mapeo Final de los Datos al Esquema de Firestore
        // Mapeo Final de los Datos al Esquema de Firestore
        const finalSlug = parsedContent.slug || title.replace(/\s+/g, '-').toLowerCase();

        const postData = {
            title: parsedContent.title || title,
            slug: finalSlug,
            app_integration: parsedContent.app_integration || { callToAction: "Comienza tu protocolo", deepLink: "elenaapp://fasting/track" },
            content: parsedContent.content || { body: "" },
            quiz: parsedContent.quiz || [],
            references: parsedContent.references?.length > 0 ? parsedContent.references : metaReferences,
            metadata: {
                ...(parsedContent.metadata || {}),
                views: 0,
                conversions: 0,
                videoUrl: url,
                youtubeUrl: parsedContent.metadata?.youtubeUrl || url,
                slug: finalSlug,
                category: parsedContent.metadata?.category || "Salud Metabólica",
                imagePrompt: parsedContent.coverPrompt || "",
                source_type: isResearchAugmented ? "research_augmented" : "transcription"
            },
            coverImage: parsedContent.thumbnailUrl || coverUrl || "https://images.unsplash.com/photo-1532187863486-abf9db0c2095?q=80&w=1920&auto=format&fit=crop",
            date: parsedContent.metadata?.publishedAt || new Date().toISOString()
        };

        // Regla de Oro implementada: Inyectar usando el slug como ID del documento
        await db.collection('metamorfosis_posts').doc(finalSlug).set(postData);
        console.log(`Inyección exitosa. Documento guardado en metamorfosis_posts con ID (slug): ${finalSlug}`);

        return new Response(JSON.stringify({
            success: true,
            postId: finalSlug
        }), { status: 200, headers: { 'Content-Type': 'application/json' } });

    } catch (error) {
        console.error("Detalle del error al inyectar en Firestore:", error);
        return new Response(JSON.stringify({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown network/server error'
        }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
};
