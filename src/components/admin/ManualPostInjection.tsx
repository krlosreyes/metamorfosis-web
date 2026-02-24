import React, { useState, useEffect } from 'react';

const ManualPostInjection = () => {
    const [jsonInput, setJsonInput] = useState('');
    const [isValid, setIsValid] = useState(false);
    const [validationMessage, setValidationMessage] = useState('');
    const [isInjecting, setIsInjecting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Debounce validation
    useEffect(() => {
        const timer = setTimeout(() => {
            setSuccessMessage('');
            setError(null);

            if (!jsonInput.trim()) {
                setIsValid(false);
                setValidationMessage('');
                return;
            }

            try {
                const parsed = JSON.parse(jsonInput);
                const keys = Object.keys(parsed);

                const requiredKeys = ['app_integration', 'content', 'metadata', 'quiz'];
                const missingKeys = requiredKeys.filter(key => !keys.includes(key));

                if (missingKeys.length > 0) {
                    setIsValid(false);
                    setValidationMessage(`Falta nodos raíz: ${missingKeys.join(', ')}`);
                } else if (!parsed.metadata?.slug) {
                    setIsValid(false);
                    setValidationMessage("El objeto 'metadata' debe contener un 'slug' válido.");
                } else {
                    setIsValid(true);
                    setValidationMessage('Esquema 4-Niveles Correcto ✅');
                }
            } catch (e) {
                setIsValid(false);
                setValidationMessage('JSON Inválido (Revisa la sintaxis).');
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [jsonInput]);

    const handleInject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isValid) return;

        setIsInjecting(true);
        setError(null);
        setSuccessMessage('');

        try {
            const parsedJson = JSON.parse(jsonInput);

            const response = await fetch('/api/inject-manual', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(parsedJson)
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setSuccessMessage('¡Inyección Directa Exitosa! Módulo subido a Firestore.');
                setJsonInput(''); // Limpiar tras éxito
            } else {
                throw new Error(data.error || 'Fallo desconocido en la inyección.');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al inyectar JSON');
        } finally {
            setIsInjecting(false);
        }
    };

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-2xl flex flex-col h-full relative overflow-hidden">
            {/* Terminal Top Bar */}
            <div className="flex items-center gap-2 mb-6 border-b border-gray-800 pb-4">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="ml-2 font-mono text-xs text-gray-500 uppercase tracking-widest">Sys.Injector.exe</span>
                <span className="ml-auto px-2 py-1 rounded bg-red-900/30 text-red-500 border border-red-500/50 text-[10px] uppercase font-bold tracking-widest">
                    EMERGENCY BYPASS
                </span>
            </div>

            <form onSubmit={handleInject} className="flex flex-col flex-1 gap-4">
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex justify-between">
                        <span>Payload JSON (4-Level Schema)</span>
                        <span className={isValid ? 'text-[#00C49A]' : jsonInput.trim() ? 'text-red-400' : 'text-gray-500'}>
                            {validationMessage}
                        </span>
                    </label>
                    <textarea
                        value={jsonInput}
                        onChange={(e) => setJsonInput(e.target.value)}
                        placeholder="{\n  &quot;metadata&quot;: { ... },\n  &quot;content&quot;: { ... },\n  &quot;app_integration&quot;: { ... },\n  &quot;quiz&quot;: [ ... ]\n}"
                        className="w-full h-96 bg-black border border-gray-700 rounded-lg p-4 text-[#00C49A] font-mono text-sm focus:outline-none focus:border-red-500 transition-colors resize-none shadow-inner"
                        spellCheck="false"
                        disabled={isInjecting}
                    />
                </div>

                <div className="mt-auto pt-4 flex gap-4">
                    <button
                        type="submit"
                        disabled={!isValid || isInjecting}
                        className="flex-1 py-4 bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(220,38,38,0.4)]"
                    >
                        {isInjecting ? 'Inyectando a Base de Datos...' : 'FORZAR INYECCIÓN A FIRESTORE'}
                    </button>
                </div>
            </form>

            {/* Notificaciones */}
            {successMessage && (
                <div className="mt-6 bg-emerald-900/20 border border-emerald-500/50 rounded-xl p-4 flex items-center gap-3 animate-fade-in-up">
                    <svg className="w-6 h-6 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-mono text-emerald-400 text-sm">{successMessage}</span>
                </div>
            )}

            {error && (
                <div className="mt-6 bg-red-900/20 border border-red-500/50 rounded-xl p-4 flex items-center gap-3 animate-fade-in-up">
                    <svg className="w-6 h-6 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span className="font-mono text-red-400 text-sm font-bold uppercase">{error}</span>
                </div>
            )}
        </div>
    );
};

export default ManualPostInjection;
