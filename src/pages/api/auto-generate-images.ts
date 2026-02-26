import type { APIRoute } from 'astro';
import { uploadImageBuffer } from '../../lib/firebase/storage-admin';

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();
        const { image_prompts, slug, title } = body;

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
            const modelName = 'imagen-3';
            try {
                // Validación Semántica Estricta
                const cleanTitleWords = title.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 3);
                const promptWords = prompt.toLowerCase();

                let matches = 0;
                cleanTitleWords.forEach((word: string) => {
                    if (promptWords.includes(word)) matches++;
                });

                if (matches < 3 && cleanTitleWords.length >= 3) {
                    console.warn(`⚠️ [Metamorfosis-Log] Rechazo Semántico para slug: ${slug}. Prompt no coincide con el título.`);
                    throw new Error(`Rechazo Semántico: El prompt carece de contexto del título ("${title}").`);
                }

                console.log(`[Metamorfosis-Log] Generating image for slug: ${slug} using model: ${modelName}`);

                const strictVisualRule = " No text, no labels, high-quality metabolic health metaphor, minimalist 3D isometric style, professional lighting. Focus on visual communication only.";
                const finalPrompt = prompt + strictVisualRule;

                console.log(`[Img ${index + 1}] Solicitando a Imagen 3... Prompt truncado: ${finalPrompt.substring(0, 40)}...`);

                // LLamada a Gemini (Imagen 3) mediante REST
                const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${googleAiApiKey}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        instances: [
                            {
                                prompt: finalPrompt
                            }
                        ],
                        parameters: {
                            sampleCount: 1
                        }
                    })
                });

                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(`Error Gemini: ${errorData.error?.message || res.statusText}`);
                }

                const data = await res.json();

                // Imagen 3 devuelve base64 en predictions[0].bytesBase64Encoded
                if (!data.predictions || data.predictions.length === 0) {
                    throw new Error('Gemini no devolvió la imagen.');
                }
                const b64Json = data.predictions[0].bytesBase64Encoded;

                // Convertir b64 a Buffer
                const buffer = Buffer.from(b64Json, 'base64');
                console.log(`[Img ${index + 1}] Generada con éxito. Subiendo a Firebase Storage...`);

                // Subir a Firebase
                const firebasePublicUrl = await uploadImageBuffer(buffer, slug, index);
                console.log(`[Img ${index + 1}] Subida a Firebase en: ${firebasePublicUrl}`);

                const timeMs = Date.now() - startTime;

                return {
                    url: firebasePublicUrl,
                    path: `articles/${slug}/visual-${index}.png`,
                    model: modelName,
                    timeMs
                };
            } catch (err: any) {
                console.error(`❌ Error en imagen ${index + 1}:`, err.message);

                // FALLBACK DE RESILIENCIA: Si Gemini o Firebase fallan, devolvemos un placeholder funcional
                // Esto evita que Dashboard.tsx reviente y permite inyectar el texto
                const fallbackUrl = `https://placehold.co/1024x1024/2f3336/ffffff?text=Imagen+${index + 1}+Fallback`;
                console.warn(`⚠️ [Metamorfosis-Log] Usando fallback estático para imagen ${index + 1}`);

                return {
                    url: fallbackUrl,
                    path: `articles/${slug}/visual-${index}-fallback.png`,
                    model: 'placeholder-fallback',
                    timeMs: Date.now() - startTime
                };
            }
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
