
import React, { useState } from 'react';
import { Timestamp } from 'firebase/firestore';

interface DailyLog {
    day: number;
    completed: boolean;
    fastingHours: number;
    cleanEating: boolean;
    timestamp: Timestamp;
}

interface DailyStepProps {
    day: number;
    title: string;
    description: string;
    isLocked: boolean;
    isCompleted: boolean;
    isActive: boolean;
    onComplete: (day: number, fastingHours: number, cleanEating: boolean) => void;
    log?: DailyLog;
}

const DailyStep: React.FC<DailyStepProps> = ({
    day,
    title,
    description,
    isLocked,
    isCompleted,
    isActive,
    onComplete,
    log
}) => {
    const [fastingHours, setFastingHours] = useState(16);
    const [cleanEating, setCleanEating] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate network delay for better UX feel
        setTimeout(() => {
            onComplete(day, fastingHours, cleanEating);
            setIsSubmitting(false);
        }, 800);
    };

    // State: LOCKED
    if (isLocked) {
        return (
            <div className="relative p-6 rounded-2xl bg-gray-900/50 border border-gray-800 opacity-60 backdrop-blur-sm">
                <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center border border-gray-700 shadow-xl">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                        </svg>
                    </div>
                </div>
                <div className="filter blur-sm select-none pointer-events-none">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-500 font-bold uppercase tracking-widest text-sm">Día {day}</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-300 mb-2">{title}</h3>
                    <p className="text-gray-500">{description}</p>
                </div>
            </div>
        );
    }

    // State: COMPLETED
    if (isCompleted) {
        return (
            <div className="p-6 rounded-2xl bg-gradient-to-br from-[#00C49A]/10 to-green-900/10 border border-[#00C49A]/30 shadow-lg relative overflow-hidden group hover:border-[#00C49A]/50 transition-all">
                <div className="absolute top-4 right-4">
                    <div className="w-8 h-8 bg-[#00C49A] rounded-full flex items-center justify-center shadow-lg shadow-[#00C49A]/20">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                    </div>
                </div>

                <div className="flex justify-between items-center mb-4">
                    <span className="text-[#00C49A] font-bold uppercase tracking-widest text-sm">Día {day} • Completado</span>
                </div>

                <h3 className="text-xl font-bold text-white mb-2">{title}</h3>

                <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 gap-4">
                    <div className="text-center bg-black/20 rounded-lg p-2">
                        <div className="text-xs text-gray-400 uppercase">Ayuno</div>
                        <div className="text-lg font-bold text-[#00C49A]">{log?.fastingHours || 0}h</div>
                    </div>
                    <div className="text-center bg-black/20 rounded-lg p-2">
                        <div className="text-xs text-gray-400 uppercase">Comida Limpia</div>
                        <div className="text-lg font-bold text-[#00C49A]">{log?.cleanEating ? 'Sí' : 'No'}</div>
                    </div>
                </div>
            </div>
        );
    }

    // State: ACTIVE
    return (
        <div className="p-1 rounded-2xl bg-gradient-to-r from-[#00C49A] to-[#007BFF] shadow-2xl shadow-blue-500/20 transform scale-[1.02] transition-transform">
            <div className="bg-gray-900 rounded-xl p-6 h-full">
                <div className="flex justify-between items-center mb-6">
                    <span className="inline-block py-1 px-3 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold border border-blue-500/30">
                        DÍA ACTIVO
                    </span>
                    <span className="text-gray-400 font-mono text-sm">Protocolo 7D</span>
                </div>

                <h3 className="text-2xl font-black text-white mb-3">{title}</h3>
                <p className="text-gray-300 mb-8 leading-relaxed border-l-4 border-[#00C49A] pl-4">
                    {description}
                </p>

                <form onSubmit={handleSubmit} className="space-y-6 bg-black/20 p-6 rounded-xl border border-white/5">
                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Registro Diario</h4>

                    {/* Fasting Input */}
                    <div>
                        <label className="block text-gray-300 text-sm font-bold mb-2">
                            Horas de Ayuno
                        </label>
                        <div className="flex items-center gap-4">
                            <input
                                type="range"
                                min="12"
                                max="24"
                                value={fastingHours}
                                onChange={(e) => setFastingHours(parseInt(e.target.value))}
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#00C49A]"
                            />
                            <span className="text-2xl font-bold text-[#00C49A] w-12 text-center">{fastingHours}h</span>
                        </div>
                    </div>

                    {/* Clean Eating Check */}
                    <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl border border-gray-700 hover:border-gray-600 transition-colors cursor-pointer" onClick={() => setCleanEating(!cleanEating)}>
                        <div className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${cleanEating ? 'bg-green-500 border-green-500' : 'border-gray-500'}`}>
                                {cleanEating && <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                            </div>
                            <span className="text-gray-200 font-medium">Comí limpio hoy (Sin procesados)</span>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={!cleanEating || isSubmitting}
                        className={`w-full py-4 rounded-xl font-bold text-lg transition-all transform ${cleanEating && !isSubmitting
                                ? 'bg-gradient-to-r from-[#00C49A] to-[#007BFF] text-white hover:scale-[1.02] shadow-lg hover:shadow-blue-500/25'
                                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                            }`}
                    >
                        {isSubmitting ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Guardando...
                            </span>
                        ) : "Completar Día"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default DailyStep;
