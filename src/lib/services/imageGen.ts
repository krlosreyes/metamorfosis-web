export interface ImageGenResult {
    url: string;
    success: boolean;
    error?: string;
}

/**
 * Service to interface with Google's Gemini 2.5 Flash Image (Nano Banana).
 * Provides high-speed, high-fidelity technical diagrams and aesthetic medical visuals
 * to replace placeholders in the generated articles.
 */
export const generateMedicalVisual = async (technicalPrompt: string): Promise<ImageGenResult> => {
    // 1. Build the stylized prompt focusing on scientific and high-fidelity aesthetics.
    const optimizedPrompt = `Create a highly technical, aesthetic medical or metabolic diagram/illustration emphasizing: ${technicalPrompt}. 
    Style: Minimalist, clean backgrounds, vector art style, dark mode compatible, glowing neon blue and emerald green accents. 
    Content: Human physiology, molecular structures, data charts, or clean medical technology context. Do NOT include any text or words in the image.`;

    try {
        // En un entorno de producción real, esto llamaría a la API:
        // const response = await fetch('https://api.fal.ai/v1/models/nano-banana...', { ... })
        // return { url: response.data.image_url, success: true };

        // MOCK INTEGRATION: Simulamos un delay de red a Nano Banana para UX.
        // Simulamos devolver una de 4 imágenes curadas de alta tecnología metabólica para la demo.
        await new Promise(resolve => setTimeout(resolve, 2500));

        const mockMedicalImages = [
            "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&q=80&w=1200", // ADN / Molecular
            "https://images.unsplash.com/photo-1559757175-9b88b7dc3f98?auto=format&fit=crop&q=80&w=1200", // Medical abstract
            "https://images.unsplash.com/photo-1629904853716-f0bc54eea481?auto=format&fit=crop&q=80&w=1200", // Tech / Brain / Network
            "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=1200"  // Science lab
        ];

        // Pick a random mock image to simulate variation based on prompt
        const randomImage = mockMedicalImages[Math.floor(Math.random() * mockMedicalImages.length)];

        return {
            url: randomImage,
            success: true
        };

    } catch (error) {
        console.error("Failed to generate image via Nano Banana API:", error);
        return {
            url: "https://placehold.co/1200x800/1e293b/00C49A?text=Nano+Banana+API+Error",
            success: false,
            error: error instanceof Error ? error.message : "Desconocido"
        };
    }
};
