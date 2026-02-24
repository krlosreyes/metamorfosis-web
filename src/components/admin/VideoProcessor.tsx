import React, { useState, useEffect, useRef } from 'react';

type ProcessState = 'IDLE' | 'ANALYZING' | 'GENERATING_COVER' | 'REVIEW' | 'INJECTING' | 'SUCCESS' | 'ERROR';

const VideoProcessor = () => {
    const [url, setUrl] = useState('');
    const [state, setState] = useState<ProcessState>('IDLE');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [logs, setLogs] = useState<string[]>([]);

    // Review Data
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [coverUrl, setCoverUrl] = useState('');

    const logEndRef = useRef<HTMLDivElement>(null);

    const addLog = (message: string) => {
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
    };

    useEffect(() => {
        if (logEndRef.current) {
            logEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [logs]);

    const handleProcess = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url) return;

        setIsLoading(true);
        setError(null);
        setState('ANALYZING');
        setLogs([]);
        addLog(`>> INITIALIZING PROTOCOL FOR: ${url}`);
        addLog('>> Ejecutando fetch a /api/process-video...');

        try {
            const response = await fetch('/api/process-video', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url, title, slug, coverUrl })
            });
            const data = await response.json();

            if (!response.ok) {
                // Forzar arrojar error para caer en el Catch local
                throw new Error(data.error || 'Error desconocido en el servidor');
            }

            if (data.success) {
                setState('SUCCESS');
                addLog('>> DB INJECTION COMPLETE. System standing by.');
                addLog(`>> Document ID (postId): ${data.postId}`);
                addLog(`>> JSON: ${JSON.stringify(data)}`);
                setTimeout(() => {
                    setState('IDLE');
                    setUrl('');
                    setTitle('');
                    setSlug('');
                    setCoverUrl('');
                    addLog('>> Memory cleared.');
                }, 4000);
            } else {
                throw new Error(data.error || 'Respuesta fallida genérica.');
            }
        } catch (err) {
            setState('ERROR');
            const msg = err instanceof Error ? err.message : "Error Desconocido";
            setError(msg);
            console.error("Pipeline fallido:", err);
            addLog(`>> NETWORK/FALLO DE CONEXIÓN: ${msg}`);
        } finally {
            // Lógica crítica que desbloquea el Dashboard
            setIsLoading(false);
        }
    };

    // Obsolete manual trigger, but keeping state transition visually logic if later restored
    const handleInject = () => { };
    const handleRegenerate = () => { };

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-2xl flex flex-col h-full relative overflow-hidden">
            {/* Terminal Top Bar */}
            <div className="flex items-center gap-2 mb-6 border-b border-gray-800 pb-4">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="ml-2 font-mono text-xs text-gray-500 uppercase tracking-widest">Sys.Processor.exe</span>
            </div>

            <form onSubmit={handleProcess} className="mb-6">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                    YouTube Target URL
                </label>
                <div className="flex gap-2">
                    <input
                        type="url"
                        value={url}
                        onChange={(e) => {
                            setUrl(e.target.value);
                            if (error) {
                                setError(null);
                                setState('IDLE');
                            }
                        }}
                        placeholder="https://youtu.be/..."
                        disabled={isLoading}
                        className="flex-1 bg-black border border-gray-700 rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-blue-500 disabled:opacity-50 transition-colors"
                        required
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !url}
                        className="px-6 py-3 bg-[#00C49A] hover:bg-[#00C49A]/80 text-black font-black uppercase text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? '...' : 'Ejecutar'}
                    </button>
                    {error && (
                        <button
                            type="button"
                            onClick={() => { setUrl(''); setError(null); setState('IDLE'); }}
                            className="px-4 py-3 bg-red-900/40 hover:bg-red-900/60 text-red-500 font-bold uppercase text-sm rounded-lg transition-colors border border-red-500/30"
                        >
                            Limpiar
                        </button>
                    )}
                </div>
            </form>

            {/* Error Notification Alert */}
            {error && (
                <div className="mb-6 bg-red-900/20 border border-red-500/50 rounded-xl p-4 flex flex-col gap-2 animate-fade-in-up">
                    <div className="flex items-center gap-2 text-red-400">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span className="font-bold text-sm uppercase tracking-wider">Error de Pipeline</span>
                    </div>
                    <p className="text-gray-300 text-sm">
                        {error}
                    </p>
                    {error.includes("No transcript") || error.toLowerCase().includes("no tiene subtítulos") ? (
                        <p className="text-yellow-500/90 text-xs mt-1 font-mono">
                            Sugerencia: ¿Deseas activar la investigación web para este video? Borra el link y pégalo nuevamente para accionar el fallback.
                        </p>
                    ) : null}
                </div>
            )}

            {/* Terminal Console */}
            <div className="flex-1 bg-black rounded-xl border border-gray-800 p-4 font-mono text-xs overflow-y-auto mb-6 min-h-[200px] max-h-[250px] shadow-inner">
                {logs.length === 0 ? (
                    <div className="text-gray-600">Waiting for input...</div>
                ) : (
                    logs.map((log, i) => (
                        <div key={i} className={`${log.includes('COMPLETE') || log.includes('SUCCESS') ? 'text-[#00C49A]' : log.includes('ERROR') ? 'text-red-500' : 'text-gray-300'} mb-1`}>
                            {log}
                        </div>
                    ))
                )}
                {state !== 'IDLE' && state !== 'REVIEW' && state !== 'SUCCESS' && (
                    <div className="text-blue-500 animate-pulse mt-2">_</div>
                )}
                <div ref={logEndRef} />
            </div>

            {/* Pipeline Visualizer (Progress) */}
            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest mb-6 px-2">
                <div className={`flex flex-col items-center gap-2 ${state === 'ANALYZING' || state === 'GENERATING_COVER' || state === 'REVIEW' || state === 'INJECTING' || state === 'SUCCESS' ? 'text-blue-400' : 'text-gray-600'}`}>
                    <div className={`w-3 h-3 rounded-full ${state === 'ANALYZING' ? 'bg-blue-500 animate-ping' : state !== 'IDLE' ? 'bg-blue-500' : 'bg-gray-700'}`}></div>
                    Analizando
                </div>
                <div className={`flex-1 h-px bg-gray-800 mx-2 ${state !== 'IDLE' && state !== 'ANALYZING' ? 'bg-blue-500/50' : ''}`}></div>
                <div className={`flex flex-col items-center gap-2 ${state === 'GENERATING_COVER' || state === 'REVIEW' || state === 'INJECTING' || state === 'SUCCESS' ? 'text-purple-400' : 'text-gray-600'}`}>
                    <div className={`w-3 h-3 rounded-full ${state === 'GENERATING_COVER' ? 'bg-purple-500 animate-ping' : state === 'REVIEW' || state === 'INJECTING' || state === 'SUCCESS' ? 'bg-purple-500' : 'bg-gray-700'}`}></div>
                    Generando IA
                </div>
                <div className={`flex-1 h-px bg-gray-800 mx-2 ${state === 'REVIEW' || state === 'INJECTING' || state === 'SUCCESS' ? 'bg-purple-500/50' : ''}`}></div>
                <div className={`flex flex-col items-center gap-2 ${state === 'INJECTING' || state === 'SUCCESS' ? 'text-orange-400' : 'text-gray-600'}`}>
                    <div className={`w-3 h-3 rounded-full ${state === 'INJECTING' ? 'bg-orange-500 animate-ping' : state === 'SUCCESS' ? 'bg-orange-500' : 'bg-gray-700'}`}></div>
                    Inyectando
                </div>
            </div>

            {/* Review Phase UI */}
            {state === 'REVIEW' && (
                <div className="animate-fade-in-up bg-gray-800/80 rounded-xl p-5 border border-[#00C49A]/30">
                    <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                        Revisión Requerida
                    </h3>

                    <div className="mb-4 group relative">
                        <img src={coverUrl} alt="Generated Cover" className="w-full h-32 object-cover rounded-lg border border-gray-700" />
                        <button
                            onClick={handleRegenerate}
                            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold uppercase tracking-widest transition-opacity rounded-lg backdrop-blur-sm"
                        >
                            Regenerar Arte ↻
                        </button>
                    </div>

                    <div className="space-y-3 mb-6">
                        <div>
                            <label className="block text-[10px] text-gray-400 uppercase tracking-widest mb-1">Título SEO</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-black border border-gray-700 rounded-md px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] text-gray-400 uppercase tracking-widest mb-1">URL Slug</label>
                            <input
                                type="text"
                                value={slug}
                                onChange={(e) => setSlug(e.target.value)}
                                className="w-full bg-black border border-gray-700 rounded-md px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none font-mono"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleInject}
                        className="w-full py-3 bg-gradient-to-r from-[#00C49A] to-blue-600 text-white font-black uppercase tracking-widest rounded-lg hover:shadow-[0_0_20px_rgba(0,196,154,0.4)] transition-all transform hover:-translate-y-1"
                    >
                        CONFIRMAR INYECCIÓN
                    </button>
                </div>
            )}
        </div>
    );
};

export default VideoProcessor;
