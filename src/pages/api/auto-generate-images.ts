import type { APIRoute } from 'astro';
import { uploadImageBuffer } from '../../lib/firebase/storage-admin';

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();
        const { image_prompts, slug, title, category } = body;

        if (!slug || typeof slug !== 'string') {
            return new Response(JSON.stringify({ error: "El campo 'slug' es obligatorio." }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        if (!title || typeof title !== 'string') {
            return new Response(JSON.stringify({ error: "El campo 'title' es obligatorio para la validación semántica." }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        if (!image_prompts || !Array.isArray(image_prompts)) {
            return new Response(JSON.stringify({ error: "El array 'image_prompts' es obligatorio." }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const googleAiApiKey = import.meta.env.GOOGLE_AI_API_KEY || import.meta.env.GEMINI_API_KEY;
        if (!googleAiApiKey) {
            return new Response(JSON.stringify({ error: "Falta GOOGLE_AI_API_KEY en el servidor." }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        console.log(`🚀 Iniciando generación de ${image_prompts.length} imágenes vía Gemini (Imagen 3)...`);
        const generatedUrls: string[] = [];

        // Hacemos el fetch en serie o paralelo. Paralelo es más rápido.
        const promises = image_prompts.map(async (prompt, index) => {
            const startTime = Date.now();

            // Declaración de Diccionarios Metabólicos
            const metabolicKeys: Record<string, string[]> = {
                "Ayuno": ["reloj", "tiempo", "célula", "ayuno", "fasting", "time", "clock", "cell", "autophagy", "water", "window", "hour", "empty"],
                "Nutricion": ["comida", "plato", "proteína", "glucosa", "food", "plate", "protein", "glucose", "insulin", "diet", "nutrition", "meal", "avocado", "meat", "veg"],
                "Ejercicio": ["músculo", "pesa", "fuerza", "sudor", "muscle", "weight", "strength", "sweat", "gym", "exercise", "workout", "tension", "dumbell", "barbell", "tape"]
            };

            const cleanTitleWords = title.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter((w: string) => w.length > 3);
            const promptWords = prompt.toLowerCase();
            const activeCategoryKeys = category && metabolicKeys[category] ? metabolicKeys[category] : [];

            let semanticMatches = 0;
            cleanTitleWords.forEach((word: string) => { if (promptWords.includes(word)) semanticMatches++; });
            activeCategoryKeys.forEach((key: string) => { if (promptWords.includes(key.toLowerCase())) semanticMatches++; });

            let finalPromptText = prompt;
            if (semanticMatches < 1) {
                console.warn(`⚠️ [Metamorfosis-Log] Activando Fallback Heurístico para Prompt: Usando Título Original del SEO.`);
                finalPromptText = `A conceptual metaphor representing: ${title}`;
            }

            const strictVisualRule = " No text, no labels, high-quality metabolic health metaphor, minimalist 3D isometric style, professional lighting. Focus on visual communication only.";
            const primaryPrompt = finalPromptText + strictVisualRule;

            // El prompt simplificado se usará si el primaryPrompt choca (error 400 por filtro de seguridad) o colapsa el modelo
            const simplifiedPrompt = `Aesthetically pleasing minimalist 3D render representing: ${title}. High quality graphic design, conceptual, no letters, no text.`;

            // Secuencia Jerárquica de Modelos (Cascada Anti-Fallos)
            const modelCascade = ['imagen-3.0-generate-001', 'imagen-3.0-generate-002', 'image-generation-006'];

            let lastGoogleError = null;

            for (const targetModel of modelCascade) {
                console.log(`[Img ${index + 1}] Solicitando a Google Vertex/AI (${targetModel})...`);

                // Intento 1: Primary Pipeline
                try {
                    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:predict?key=${googleAiApiKey}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            instances: [{ prompt: primaryPrompt }],
                            parameters: { sampleCount: 1 }
                        })
                    });

                    if (!res.ok) {
                        const rawText = await res.text();
                        let errOutput = { error: { message: '' } };
                        try { errOutput = JSON.parse(rawText); } catch (e) { }
                        throw new Error(`Primary Reject ${targetModel}: ${errOutput.error?.message || res.statusText || rawText}`);
                    }

                    const rawText = await res.text();
                    let data;
                    try { data = JSON.parse(rawText); } catch (e) { throw new Error(`Invalid JSON Response: ${rawText}`); }

                    if (!data.predictions || data.predictions.length === 0) throw new Error('Cero predicciones devueltas.');

                    const buffer = Buffer.from(data.predictions[0].bytesBase64Encoded, 'base64');
                    const firebasePublicUrl = await uploadImageBuffer(buffer, slug, index);

                    return { url: firebasePublicUrl, path: `articles/${slug}/visual-${index}.png`, model: targetModel, timeMs: Date.now() - startTime };

                } catch (e: any) {
                    console.warn(`⚠️ [Img ${index + 1}] Falló Primary (${targetModel}): ${e.message}`);

                    // Intento 2: Prompt Simplificadísimo al mismo Modelo
                    console.log(`[Img ${index + 1}] Reintentando con Simplified Prompt Heurístico...`);
                    try {
                        const resFallback = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:predict?key=${googleAiApiKey}`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                instances: [{ prompt: simplifiedPrompt }],
                                parameters: { sampleCount: 1 }
                            })
                        });

                        if (!resFallback.ok) {
                            const rawTextFb = await resFallback.text();
                            let errOutputFb = { error: { message: '' } };
                            try { errOutputFb = JSON.parse(rawTextFb); } catch (e) { }
                            throw new Error(`Fallback Reject ${targetModel}: ${errOutputFb.error?.message || resFallback.statusText || rawTextFb}`);
                        }

                        const rawTextFb = await resFallback.text();
                        let dataFallback;
                        try { dataFallback = JSON.parse(rawTextFb); } catch (e) { throw new Error(`Invalid JSON Response Fallback: ${rawTextFb}`); }

                        if (!dataFallback.predictions || dataFallback.predictions.length === 0) throw new Error('Cero predicciones de Fallback devueltas.');

                        const bufferFallback = Buffer.from(dataFallback.predictions[0].bytesBase64Encoded, 'base64');
                        const firebasePublicUrlFallback = await uploadImageBuffer(bufferFallback, slug, index);

                        return { url: firebasePublicUrlFallback, path: `articles/${slug}/visual-${index}.png`, model: targetModel + ' (Simplified)', timeMs: Date.now() - startTime };

                    } catch (errFallback: any) {
                        console.warn(`⚠️ [Img ${index + 1}] Falló Simplified (${targetModel}). Avanzando al siguiente en cascada...`);
                        lastGoogleError = errFallback.message;
                    }
                }
            }

            // Si los 3 Modelos x 2 Prompts = 6 Intentos fallaron, rompemos esa solicitud específicamente sin "placeholders" falsos.
            console.error(`❌ [Img ${index + 1}] Fallo general crítico de Generacion Visual. Causas terminales: ${lastGoogleError}`);
            return null; // El frontend interpretará un array URLs disparado comparado con image_prompts originales, ajustando `status`
        });

        const results = await Promise.all(promises);

        // Filtramos nulos (fallos)
        const successfulResults = results.filter((res) => res !== null) as any[];
        const successfulUrls = successfulResults.map(r => r.url);

        return new Response(JSON.stringify({
            success: true,
            urls: successfulUrls,
            telemetry: successfulResults
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (e: any) {
        console.error('❌ Error fatal en /api/auto-generate-images:', e.message);
        return new Response(JSON.stringify({ error: e.message || 'Error interno del servidor.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
