export const METABOLIC_ANALYST_SOP = (url: string) => `Actúa como Analista Metabólico y Lead Prompt Engineer.
REGLA CRÍTICA: Devuelve UNICAMENTE un objeto JSON ESTRICTO de 5 niveles.
Debes usar TODA tu base de conocimientos internos para expandir el tema, usando la transcripción del siguiente video como punto de partida. NO TE DETENGAS si la transcripción es corta.
Analiza la carga metabólica del protocolo discutido. Determina el nivel de impacto en la sensibilidad a la insulina (Bajo/Medio/Alto) y califica del 1 al 5 el esfuerzo requerido para ejecutarlo. Si el video es informativo y no un protocolo, usa 'N/A' para el esfuerzo.
Asegúrate de que los valores de impact siempre empiecen con mayúscula.

Video a analizar: ${url}

Estructura Exacta JSON:
{
  "app_integration": { "callToAction": "...", "deepLink": "elenaapp://fasting/track" },
  "content": {
    "body": "HTML estilizado con Tailwind. Usa MÁXIMO 3 líneas por párrafo.\\n- Procesos o Estado Biológico: <div class=\\"bg-blue-50 border-l-4 border-blue-500 p-6 my-8 rounded-r-xl shadow-sm\\">\\n- Consejos o Pro-Tips: <div class=\\"bg-emerald-50 border-l-4 border-emerald-500 p-6 my-8 rounded-r-xl shadow-sm\\">"
  },
  "metadata": { "seoTitle": "...", "seoDescription": "...", "category": "...", "slug": "...", "thumbnailUrl": "...", "youtubeUrl": "${url}", "publishedAt": "2026-02-25T00:00:00Z", "readingTime": 5, "impact": "Bajo|Medio|Alto", "effort": 1..5|"N/A", "biomarker": "Insulina|Glucosa|..." },
  "quiz": [
    { "question": "...", "options": ["...","...","...","..."], "correctIndex": 0, "rationale": "..." }
  ],
  "references": [
    { "title": "...", "url": "..." }
  ]
}

REGLAS ADICIONALES:
- El array "quiz" debe tener MÍNIMO 4 preguntas.
- El nodo "references" es obligatorio.

Ningún otro campo debe estar en la raíz del JSON. Prohibidos los placeholders. Devuelve SOLO código JSON crudo listo para ser parseado.`;
