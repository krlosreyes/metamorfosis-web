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
        const computedTitle = title || 'El verdadero impacto del ayuno en tu metabolismo';
        const postSlug = slug || computedTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

        const postData = {
            title: computedTitle,
            slug: postSlug,
            content: {
                introduction: "Un análisis profundo sobre los mecanismos moleculares del ayuno intermitente y su impacto en la flexibilidad metabólica humana.",
                sections: [
                    "El ayuno prolongado desencadena autofagia, un proceso donde las células recicladas promueven la longevidad y destruyen patógenos intracelulares de forma eficiente.",
                    "Durante la restricción calórica, los niveles de insulina caen drásticamente, lo que permite que el glucagón y el cortisol movilicen las reservas de grasa tenaces.",
                    "Al entrar en cetosis, el hígado produce beta-hidroxibutirato, un súper combustible neuroprotector que reduce la niebla mental y estabiliza la energía todo el día."
                ]
            },
            quiz: [
                {
                    question: "¿Cuál es el beneficio metabólico principal de mantener bajos niveles de insulina?",
                    options: ["Mayor hambre", "Quema de grasa acelerada", "Retención de líquidos", "Aumento de estrés"],
                    correctIndex: 1,
                    rationale: "La baja insulina es la señal bioquímica principal que le indica al cuerpo que debe acceder a los triglicéridos almacenados."
                },
                {
                    question: "¿Qué compuesto fabrica el hígado durante el ayuno que beneficia al cerebro?",
                    options: ["Glucosa", "Beta-hidroxibutirato", "Colesterol", "Triglicéridos"],
                    correctIndex: 1,
                    rationale: "Los cuerpos cetónicos, como el beta-hidroxibutirato, cruzan la barrera hematoencefálica y proveen hasta el 70% de la energía cerebral."
                },
                {
                    question: "¿Qué proceso de limpieza celular se activa tras 16+ horas de ayuno?",
                    options: ["Autofagia", "Mitosis", "Lipogénesis", "Glucogenólisis"],
                    correctIndex: 0,
                    rationale: "La autofagia es un estado de reciclaje donde las células de baja eficiencia celular son destruidas para generar nuevas células robustas."
                }
            ],
            metadata: {
                views: 0,
                conversions: 0,
                videoUrl: url,
                category: "Salud Metabólica"
            },
            coverImage: coverUrl || "https://images.unsplash.com/photo-1542204165-65bf26472b9b?q=80&w=1920&auto=format&fit=crop",
            date: new Date().toISOString()
        };

        // Regla de Oro implementada: Modificada ruta de inyección a 'metamorfosis_posts'
        // Usamos .doc(postSlug).set() si queremos que el ID sea el slug, o .add() según requerimiento
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
