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

        // --- EXTRACCIÓN DE METADATOS (YouTube Data API v3) ---
        let finalTitle = title;
        let finalCoverUrl = coverUrl;
        let videoDescription = "";

        const YOUTUBE_API_KEY = import.meta.env.YOUTUBE_API_KEY || process.env.YOUTUBE_API_KEY;
        if (YOUTUBE_API_KEY) {
            try {
                console.log("Extrayendo metadatos profundos desde YouTube Data API v3...");
                const ytResponse = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${YOUTUBE_API_KEY}`);
                if (ytResponse.ok) {
                    const ytData = await ytResponse.json();
                    if (ytData.items && ytData.items.length > 0) {
                        const snippet = ytData.items[0].snippet;
                        finalTitle = snippet.title || finalTitle;
                        videoDescription = snippet.description || "";
                        finalCoverUrl = snippet.thumbnails?.maxres?.url || snippet.thumbnails?.high?.url || finalCoverUrl;
                        console.log(`[YouTube API] Metadatos consolidados: ${finalTitle}`);
                    }
                } else {
                    console.warn(">> Fallo en YouTube API, usando scraping/UI de fallback.");
                }
            } catch (err) {
                console.warn(">> Error contactando YouTube API, usando fallback:", err);
            }
        } else {
            console.warn(">> YOUTUBE_API_KEY no detectada. Usando metadatos crudos del Frontend.");
        }

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

            const track = tracks.find((t: any) => t.languageCode === 'es' || t.languageCode.includes('es')) || tracks[0];

            console.log(`Usando subtítulo en idioma: ${track.languageCode}`);
            const xmlResponse = await fetch(track.baseUrl);
            const xmlText = await xmlResponse.text();

            transcript = xmlText
                .replace(/<[^>]+>/g, ' ')
                .replace(/&amp;/g, '&')
                .replace(/&#39;/g, "'")
                .replace(/&quot;/g, '"')
                .replace(/\s+/g, ' ')
                .trim();

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

        const OPENAI_API_KEY = import.meta.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY;
        if (!OPENAI_API_KEY) {
            console.error("OPENAI_API_KEY is missing.");
            return new Response(JSON.stringify({ success: false, error: 'Error: Falta OPENAI_API_KEY' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        let systemPrompt = `Actúa como Senior Full-Stack Architect y Especialista Médico.
REGLA CRÍTICA: Devuelve UNICAMENTE un objeto JSON ESTRICTO de 4 niveles.
Debes usar TODA tu base de conocimientos internos para expandir el tema, usando la transcripción como punto de partida. NO TE DETENGAS si la transcripción es corta.
Estructura Exacta:
1. app_integration: { "callToAction": "...", "deepLink": "elenaapp://fasting/track" }
2. content.body: HTML estilizado con Tailwind. Usa MÁXIMO 3 líneas por párrafo.
   - Procesos o Estado Biológico: <div class="bg-blue-50 border-l-4 border-blue-500 p-6 my-8 rounded-r-xl shadow-sm">
   - Consejos o Pro-Tips: <div class="bg-emerald-50 border-l-4 border-emerald-500 p-6 my-8 rounded-r-xl shadow-sm">
3. metadata: { seoTitle, seoDescription, category, slug, thumbnailUrl, youtubeUrl, publishedAt, readingTime }
4. quiz: Array de 3 a 5 preguntas reales con 'question', 'options' (array de 4 strings), 'correctIndex' (int 0-3), y 'rationale'.

Ningún otro campo debe estar en la raíz del JSON. Prohibidos los placeholders.`;

        const requestBody = {
            model: "gpt-4o-mini",
            response_format: { type: "json_object" },
            temperature: 0.3,
            messages: [
                {
                    role: "system",
                    content: systemPrompt
                },
                {
                    role: "user",
                    content: `Título: "${finalTitle}"\nDescripción Original: "${videoDescription.substring(0, 1500)}"\nTranscripción: """${transcript.substring(0, 15000)}"""\n\nINSTRUCCIONES EXTRA: Ignora tu configuración por defecto. Responde EXCLUSIVAMENTE con el JSON exigido en el System Prompt.`
                }
            ]
        };

        console.log("Contactando a la Red OpenAI (gpt-4o-mini)...");
        const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify(requestBody)
        });

        if (!aiResponse.ok) {
            const errBody = await aiResponse.text();
            console.warn(">> Falló llamada a OpenAI:", errBody);
            return new Response(JSON.stringify({ success: false, error: 'Error: El motor resolvió un fallo de conexión u OpenAI rechazó la clave.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }

        const aiData = await aiResponse.json();
        const rawJsonString = aiData.choices?.[0]?.message?.content;

        if (!rawJsonString) {
            console.error("Respuesta vacía de OpenAI.");
            return new Response(JSON.stringify({ success: false, error: 'Error: Análisis de Contenido Vacío' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }

        let parsedContent;
        try {
            const cleaned = rawJsonString.replace(/```json/gi, '').replace(/```/g, '').trim();
            parsedContent = JSON.parse(cleaned);
        } catch (parseErr) {
            console.error("JSON Parsing failed:", rawJsonString);
            return new Response(JSON.stringify({ success: false, error: 'Error de Análisis Estructural' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }

        const finalSlug = parsedContent.metadata?.slug || finalTitle.replace(/\s+/g, '-').toLowerCase();

        const postData = {
            app_integration: parsedContent.app_integration || { callToAction: "Inicia tu rastreo", deepLink: "elenaapp://fasting/track" },
            content: parsedContent.content || { body: "" },
            metadata: {
                category: parsedContent.metadata?.category || "Metabolismo",
                publishedAt: parsedContent.metadata?.publishedAt || new Date().toISOString(),
                readingTime: parsedContent.metadata?.readingTime || "5 min",
                seoDescription: parsedContent.metadata?.seoDescription || "Artículo médico nativo.",
                seoTitle: parsedContent.metadata?.seoTitle || finalTitle,
                slug: finalSlug,
                thumbnailUrl: parsedContent.metadata?.thumbnailUrl || finalCoverUrl || "",
                youtubeUrl: parsedContent.metadata?.youtubeUrl || url,
                views: 0,
                conversions: 0,
                source_type: transcript.length < 500 ? "knowledge_augmented" : "transcription"
            },
            quiz: parsedContent.quiz || []
        };

        if (postData.content.body.length < 100) {
            return new Response(JSON.stringify({ success: false, error: 'Error: Contenido Generado Insuficiente' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }

        await db.collection('metamorfosis_posts').doc(finalSlug).set(postData);
        console.log(`Inyección ejecutada con éxito. ID Documento: ${finalSlug}`);

        return new Response(JSON.stringify({ success: true, postId: finalSlug }), { status: 200, headers: { 'Content-Type': 'application/json' } });

    } catch (error) {
        console.error("Detalle del error Crítico:", error);
        return new Response(JSON.stringify({
            success: false,
            error: error instanceof Error ? error.message : 'Error inesperado del Servidor'
        }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
};
