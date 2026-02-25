export const validatePostSchema = (jsonString: string): { isValid: boolean; error: string | null } => {
    if (!jsonString.trim()) {
        return { isValid: false, error: null }; // Estado inicial vacío (sin error rojo)
    }

    let parsed;

    // 1. Validación de Sintaxis Clásica (Parseo JSON)
    try {
        parsed = JSON.parse(jsonString);
    } catch (e: any) {
        // Obtenemos el mensaje de sintaxis original del motor JS (Ej: "Unexpected token '}' at position 45")
        return { isValid: false, error: `[SyntaxError] Falla de estructura JSON cruda:\\n> ${e.message}` };
    }

    // Asegurar que el Payload es un Objeto y no un array u otro primitivo
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        return { isValid: false, error: `[TypeError] El payload debe ser un objeto JSON (iniciar con '{' y terminar con '}').` };
    }

    // 2. Validación Estructural (Nodos Raíz 5 Niveles)
    const requiredKeys = ['app_integration', 'content', 'metadata', 'quiz', 'references'];
    const keys = Object.keys(parsed);
    const missingKeys = requiredKeys.filter(key => !keys.includes(key));

    if (missingKeys.length > 0) {
        return { isValid: false, error: `[SchemaError] Faltan los siguientes Nodos Raíz estrictos:\\n> ${missingKeys.join(', ')}` };
    }

    // 3. Validación Lógica de Negocio 
    // Metadata -> Slug Vital
    if (!parsed.metadata?.slug || typeof parsed.metadata.slug !== 'string' || parsed.metadata.slug.trim() === '') {
        return { isValid: false, error: `[LogicError] El nodo 'metadata.slug' es obligatorio y debe ser un String válido no vacío.` };
    }

    // Quiz -> Minimo 4
    if (!Array.isArray(parsed.quiz)) {
        return { isValid: false, error: `[LogicError] El nodo 'quiz' debe ser un Array (Lista).` };
    }
    if (parsed.quiz.length < 4) {
        return { isValid: false, error: `[LogicError] Nivel Académico Insuficiente:\\n> El array 'quiz' contiene ${parsed.quiz.length} preguntas.\\n> Mínimo Requerido: 4 preguntas completas.` };
    }

    // References -> Minimo 1
    if (!Array.isArray(parsed.references)) {
        return { isValid: false, error: `[LogicError] El nodo 'references' debe ser un Array (Lista).` };
    }
    if (parsed.references.length === 0) {
        return { isValid: false, error: `[LogicError] Falta de Autoridad Científica:\\n> El array 'references' no puede estar vacío.\\n> Incluya al menos una fuente médica o estudio.` };
    }

    // Si sobrevive al embudo, es un Payload de Metamorfosis Válido.
    return { isValid: true, error: null };
};
