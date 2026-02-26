import type { APIRoute } from 'astro';
import { uploadImageBuffer } from '../../lib/firebase/storage-admin';

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();
        const { image_prompts, slug } = body;

        if (!slug || typeof slug !== 'string') {
            return new Response(JSON.stringify({ error: "El campo 'slug' es obligatorio." }), {
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

        const openAiApiKey = import.meta.env.OPENAI_API_KEY;
        if (!openAiApiKey) {
            return new Response(JSON.stringify({ error: "Falta OPENAI_API_KEY en el servidor." }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        console.log(`🚀 Iniciando generación de ${image_prompts.length} imágenes vía DALL-E 3...`);
        const generatedUrls: string[] = [];

        // Hacemos el fetch en serie o paralelo. Paralelo es más rápido.
        const promises = image_prompts.map(async (prompt, index) => {
            try {
                console.log(`[Img ${index + 1}] Solicitando a DALL-E 3... Prompt truncado: ${prompt.substring(0, 30)}...`);
                // LLamada a DALL-E 3 mediante REST nativo
                const res = await fetch('https://api.openai.com/v1/images/generations', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${openAiApiKey}`
                    },
                    body: JSON.stringify({
                        model: "dall-e-3",
                        prompt: prompt,
                        n: 1,
                        size: "1024x1024",
                        response_format: "b64_json" // Pedimos base64 para no depender de URLs efímeras
                    })
                });

                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(`Error OpenAI: ${errorData.error?.message || res.statusText}`);
                }

                const data = await res.json();
                const b64Json = data.data[0].b64_json;

                // Convertir b64 a Buffer
                const buffer = Buffer.from(b64Json, 'base64');
                console.log(`[Img ${index + 1}] Generada con éxito. Subiendo a Firebase Storage...`);

                // Subir a Firebase
                const firebasePublicUrl = await uploadImageBuffer(buffer, slug, index);
                console.log(`[Img ${index + 1}] Subida a Firebase en: ${firebasePublicUrl}`);

                return firebasePublicUrl;
            } catch (err: any) {
                console.error(`❌ Error en imagen ${index + 1}:`, err.message);
                return null; // En caso de fallo devolvemos null para no romper el resto del batch
            }
        });

        const results = await Promise.all(promises);

        // Filtramos nulos (fallos)
        const successfulUrls = results.filter((url) => url !== null) as string[];

        return new Response(JSON.stringify({
            success: true,
            urls: successfulUrls
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
