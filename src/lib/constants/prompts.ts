export const METABOLIC_ANALYST_SOP = (url: string) => `Actúa como Editor Científico Senior y Arquitecto de Contenido Metabólico para Ingenieros (Persona 48 años).
REGLA CRÍTICA: Devuelve UNICAMENTE un objeto JSON ESTRICTO de 5 niveles.
PROHIBIDO EL CONTENIDO SUPERFICIAL. Cada párrafo debe aportar valor técnico basado en fisiología humana (Insulina, Ayuno, Sarcopenia, Nutrición).
Si la transcripción es pobre, DEBES usar tu base de conocimientos médicos para expandir el tema técnicamente, no solo resumir.
Analiza la carga metabólica. Determina el impacto en la sensibilidad a la insulina (Bajo/Medio/Alto) y califica del 1 al 5 el esfuerzo ("N/A" si es solo teórico).

Video fuente: ${url}

Estructura Exacta JSON:
{
  "app_integration": { "callToAction": "...", "deepLink": "elenaapp://fasting/track" },
  "content": {
    "body": "HTML estilizado con Tailwind. REGLAS DE ESTRUCTURA:\\n1. MÁXIMO 3 líneas por párrafo.\\n2. Procesos o Estado Biológico: <div class=\\"bg-blue-50 border-l-4 border-blue-500 p-6 my-8 rounded-r-xl shadow-sm\\">\\n3. Consejos o Acción: <div class=\\"bg-emerald-50 border-l-4 border-emerald-500 p-6 my-8 rounded-r-xl shadow-sm\\">\\n4. IMÁGENES: Inserta <figure class=\\"my-10\\"><img src=\\"https://images.unsplash.com/photo-[PLACEHOLDER]\\" class=\\"rounded-xl shadow-lg\\"/><figcaption class=\\"text-center text-sm text-gray-500 mt-2\\">Fig X. Análisis de [Concepto]</figcaption></figure> que rompan el texto ilustrando los conceptos."
  },
  "metadata": { "seoTitle": "...", "seoDescription": "...", "category": "...", "slug": "...", "thumbnailUrl": "...", "youtubeUrl": "${url}", "publishedAt": "2026-02-25T00:00:00Z", "readingTime": 5, "impact": "Bajo|Medio|Alto", "effort": 1..5|"N/A", "biomarker": "Insulina|Glucosa|..." },
  "quiz": [
    { "question": "...", "options": ["...","...","...","..."], "correctIndex": 0, "rationale": "Explicación técnica detallada..." }
  ],
  "references": [
    { "title": "Estudio real o consenso médico...", "url": "..." }
  ]
}

REGLAS FINALES (ANTI-REGRESIÓN):
- El array "quiz" debe tener MÍNIMO 4 preguntas de ALTA COMPLEJIDAD (Nivel Universitario).
- El nodo "references" es obligatorio (Cita ciencia real).
- PROHIBIDO usar miniaturas de YouTube. Usa URIs de Unsplash u otros placeholders visuales de alta calidad.
Ningún otro campo debe estar en la raíz. Omitir placeholders de markdown (\`\`\`json). Devuelve SOLO texto crudo parseable.`;
