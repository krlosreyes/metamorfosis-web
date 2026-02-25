import React, { useState, useEffect } from 'react';
import { validatePostSchema } from '../../lib/validators/postValidator'; // <-- NUEVO PATH

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

            const { isValid: newIsValid, message: newMessage } = validatePostSchema(jsonInput);

            setIsValid(newIsValid);
            setValidationMessage(newMessage || '');
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

    const handleClear = () => {
        setJsonInput('');
        setIsValid(false);
        setValidationMessage('');
        setSuccessMessage('');
        setError(null);
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
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center justify-between">
                        <div className="flex gap-4 items-center">
                            <span>Payload JSON (5-Level Schema)</span>
                            <button
                                type="button"
                                onClick={handleClear}
                                title="Limpiar JSON"
                                className="p-1 text-gray-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded transition-colors"
                            >
                                <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21" /><path d="M22 21H7" /><path d="m5 11 9 9" /></svg>
                            </button>
                        </div>
                        <span className={isValid ? 'text-[#00C49A]' : 'hidden'}>
                            {isValid && 'Esquema 5-Niveles Correcto ✅'}
                        </span>
                    </label>
                    <textarea
                        value={jsonInput}
                        onChange={(e) => setJsonInput(e.target.value)}
                        placeholder="{\n  &quot;metadata&quot;: { ... },\n  &quot;content&quot;: { ... },\n  &quot;app_integration&quot;: { ... },\n  &quot;quiz&quot;: [ ... ],\n  &quot;references&quot;: [ ... ]\n}"
                        className="w-full h-96 bg-black border border-gray-700 rounded-lg p-4 text-[#00C49A] font-mono text-sm focus:outline-none focus:border-red-500 transition-colors resize-none shadow-inner"
                        spellCheck="false"
                        disabled={isInjecting}
                    />
                </div>

                {!isValid && validationMessage && (
                    <div className="bg-red-950/50 border border-red-800 rounded-lg p-4 flex gap-3 shadow-[0_0_10px_rgba(153,27,27,0.3)] animate-fade-in-up">
                        <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></svg>
                        <div className="flex-1">
                            <h4 className="text-red-400 font-bold uppercase tracking-wider text-xs mb-1">Error de Validación JSON</h4>
                            <pre className="text-red-200 font-mono text-xs whitespace-pre-wrap break-words">
                                {validationMessage}
                            </pre>
                        </div>
                    </div>
                )}

                <div className="mt-auto pt-4 flex gap-4">
                    <button
                        type="submit"
                        disabled={!isValid || isInjecting}
                        className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(5,150,105,0.4)]"
                    >
                        {isInjecting ? 'Procesando...' : 'Crear Artículo'}
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
