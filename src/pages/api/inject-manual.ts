import type { APIRoute } from 'astro';
import { savePostToFirestore } from '../../lib/firebase/posts-service';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
    try {
        const payload = await request.json();

        // Server-side strict validation
        const requiredKeys = ['app_integration', 'content', 'metadata', 'quiz'];
        for (const key of requiredKeys) {
            if (!payload[key]) {
                return new Response(JSON.stringify({
                    success: false,
                    error: `Validation Error: Missing root node '${key}'`
                }), { status: 400, headers: { 'Content-Type': 'application/json' } });
            }
        }

        const slug = payload.metadata.slug;
        if (!slug) {
            return new Response(JSON.stringify({
                success: false,
                error: `Validation Error: Missing 'metadata.slug'`
            }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        console.log(`[Manual Injector] Initiating emergency database injection for ID: ${slug}`);

        await savePostToFirestore(slug, payload);

        console.log(`[Manual Injector] Success. Inserted document ID: ${slug}`);

        return new Response(JSON.stringify({ success: true, slug }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error("Detalle del error al inyectar manual en Firestore:", error);
        return new Response(JSON.stringify({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown network/server error'
        }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
};
