
import React, { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { Timestamp } from 'firebase/firestore';
import {
    getProtocolState,
    initializeProtocol,
    completeDay,
    saveOnboardingData,
    type ProtocolState
} from '../lib/firebase/protocol';
import DailyStep from './DailyStep';

const DAYS_CONTENT = [
    {
        day: 1,
        title: "Día 1",
        food: "Solo agua y café en el ayuno. Rompe con proteína animal.",
        exercise: "Caminata ligera de 20 min."
    },
    {
        day: 2,
        title: "Día 2",
        food: "Cero azúcar. Prioriza grasas saludables para saciedad.",
        exercise: "15 min de flexiones/sentadillas en casa."
    },
    {
        day: 3,
        title: "Día 3",
        food: "Añade espinacas o brócoli. Fibra para tu microbiota.",
        exercise: "Descanso activo. Estiramientos por 10 min."
    },
    {
        day: 4,
        title: "Día 4",
        food: "Día de hidratación profunda. Añade sal a tu agua.",
        exercise: "Caminata de 30 min al sol (ritmo circadiano)."
    },
    {
        day: 5,
        title: "Día 5",
        food: "Corte estricto de lácteos hoy para bajar inflamación.",
        exercise: "Día de fuerza. Tensión mecánica en ayunas."
    },
    {
        day: 6,
        title: "Día 6",
        food: "Carnes magras y grasas. Ventana de comida estricta.",
        exercise: "Movilidad articular para recuperación."
    },
    {
        day: 7,
        title: "Día 7",
        food: "Mantenimiento. Tú controlas la comida, no al revés.",
        exercise: "Evaluación física. Prepárate para el siguiente nivel."
    }
];

export default function ProtocolDashboard() {
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);
    const [protocol, setProtocol] = useState<ProtocolState | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUserId(user.uid);
                await loadProtocol(user.uid);
            } else {
                // For MVP, sign in anonymously if not auth'd to track session
                try {
                    const cred = await signInAnonymously(auth);
                    setUserId(cred.user.uid);
                    await loadProtocol(cred.user.uid);
                } catch (e) {
                    console.warn("Auth failed, initializing Demo Mode");
                    // Fallback to Demo Mode
                    setProtocol({
                        currentDay: 1,
                        daysCompleted: 0,
                        isFinished: false,
                        logs: {},
                        startDate: Timestamp.now()
                    });
                    setLoading(false);
                }
            }
        });
        return () => unsubscribe();
    }, []);

    const loadProtocol = async (uid: string) => {
        setLoading(true);
        try {
            let state = await getProtocolState(uid);
            if (!state) {
                state = await initializeProtocol(uid);
            }
            setProtocol(state);
        } catch (e) {
            console.error(e);
            setError("Error cargando tu progreso. Refresca la página.");
        } finally {
            setLoading(false);
        }
    };

    const handleDayComplete = async (day: number, checkFasting: boolean, checkFood: boolean, checkExercise: boolean) => {
        // Mock Mode Handler
        if (!userId) {
            const newLog = {
                day,
                completed: true,
                checkFasting,
                checkFood,
                checkExercise,
                timestamp: Timestamp.now()
            };

            setProtocol(prev => {
                if (!prev) return null;
                const nextDay = day < 7 ? day + 1 : prev.currentDay;
                const isFinished = day === 7;
                return {
                    ...prev,
                    currentDay: nextDay,
                    daysCompleted: prev.daysCompleted + 1,
                    isFinished: isFinished,
                    logs: {
                        ...prev.logs,
                        [day]: newLog
                    }
                };
            });

            // Scroll to next day smoothly if not finished
            if (day < 7) {
                setTimeout(() => {
                    const nextElement = document.getElementById(`day-${day + 1}`);
                    nextElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 500);
            }
            return;
        }

        if (!protocol) return;
        try {
            const newState = await completeDay(userId, day, checkFasting, checkFood, checkExercise);
            setProtocol(newState as ProtocolState);

            // Scroll to next day smoothly if not finished
            if (!newState.isFinished && day < 7) {
                setTimeout(() => {
                    const nextElement = document.getElementById(`day-${day + 1}`);
                    nextElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 500);
            }
        } catch (e: any) {
            alert(e.message || "Error guardando el día.");
        }
    };

    const handleOnboardingSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const weight = fd.get("weight") as string;
        const fat = fd.get("fat") as string;

        if (!weight || !fat) {
            alert("Por favor llena ambos campos para calibrar tu protocolo.");
            return;
        }

        if (!userId) {
            setProtocol(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    initialWeight: weight,
                    initialFat: fat
                };
            });
            return;
        }

        try {
            const newState = await saveOnboardingData(userId, weight, fat);
            setProtocol(newState as ProtocolState);
        } catch (error) {
            alert("Error guardando datos iniciales.");
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-gray-400">
                <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4"></div>
                <p className="animate-pulse">Sincronizando con el servidor...</p>
            </div>
        );
    }

    if (error) {
        return <div className="text-red-500 text-center p-8 bg-red-900/20 rounded-xl border border-red-800">{error}</div>;
    }

    // Onboarding Phase
    if (protocol && !protocol.initialWeight && protocol.currentDay === 1 && protocol.daysCompleted === 0) {
        return (
            <div className="max-w-2xl mx-auto py-12 px-4 animate-fade-in-up">
                <div className="bg-gray-900 border border-gray-800 p-8 rounded-3xl shadow-xl">
                    <h2 className="text-3xl font-black text-white mb-4">Métricas Base</h2>
                    <p className="text-gray-400 mb-8">
                        Para calibrar tu protocolo, necesitamos tus métricas base. ¿Cuál es tu peso actual y tu porcentaje de grasa estimado (o medida de cintura en cm)?
                    </p>
                    <form onSubmit={handleOnboardingSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">
                                Peso (kg)
                            </label>
                            <input
                                type="number"
                                name="weight"
                                step="0.1"
                                required
                                className="w-full bg-black/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00C49A] transition-colors"
                                placeholder="Ej. 75.5"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">
                                Grasa (%) o Cintura (cm)
                            </label>
                            <input
                                type="number"
                                name="fat"
                                step="0.1"
                                required
                                className="w-full bg-black/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00C49A] transition-colors"
                                placeholder="Ej. 20 o 85"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full py-4 bg-[#00C49A] hover:bg-[#00C49A]/90 text-black font-black text-xl rounded-xl shadow-[0_0_20px_rgba(0,196,154,0.3)] transition-all transform hover:-translate-y-1"
                        >
                            INICIAR PROTOCOLO ➔
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    if (protocol?.isFinished) {
        let totalChecks = 0;
        Object.values(protocol.logs).forEach(log => {
            if (log.checkFasting) totalChecks++;
            if (log.checkFood) totalChecks++;
            if (log.checkExercise) totalChecks++;
        });

        return (
            <div className="text-center py-12 px-4 animate-fade-in-up">
                <div className="bg-gradient-to-br from-[#00C49A]/20 to-blue-600/20 border border-[#00C49A]/30 p-8 rounded-3xl backdrop-blur-md shadow-2xl max-w-2xl mx-auto">
                    <span className="text-6xl mb-6 block">🏆</span>
                    <h2 className="text-4xl font-black text-white mb-4 leading-tight">
                        Protocolo Completado
                    </h2>
                    <div className="bg-black/30 rounded-xl p-6 mb-8 mt-4 outline outline-white/5">
                        <p className="text-xl text-gray-300 leading-relaxed">
                            Iniciaste con <strong className="text-white">{protocol.initialWeight}kg</strong>.<br />
                            Completaste <strong className="text-[#00C49A] text-2xl">{totalChecks}</strong>/21 objetivos esta semana.
                        </p>
                        <p className="mt-4 text-gray-400 font-medium">Tu metabolismo ha salido del estancamiento.</p>
                    </div>

                    <a
                        href="https://buy.stripe.com/test_link_elena_app"
                        target="_blank"
                        className="inline-block w-full sm:w-auto px-8 py-5 bg-gradient-to-r from-[#00C49A] to-blue-600 hover:from-[#00C49A]/90 hover:to-blue-600/90 text-white font-black text-xl rounded-xl shadow-[0_0_30px_rgba(0,196,154,0.4)] transform hover:-translate-y-1 transition-all"
                    >
                        DESCARGAR ELENA APP ➔
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Header / Progress */}
            <div className="bg-gray-900/80 backdrop-blur sticky top-4 z-40 p-4 rounded-xl border border-gray-800 shadow-xl mb-8 flex items-center justify-between gap-4">
                <div className="flex-1">
                    <div className="flex justify-between text-xs uppercase text-gray-500 font-bold mb-1">
                        <span>Progreso del Protocolo</span>
                        <span>{Math.round((protocol?.daysCompleted || 0) / 7 * 100)}%</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-[#00C49A] to-blue-600 transition-all duration-700 ease-out"
                            style={{ width: `${((protocol?.daysCompleted || 0) / 7) * 100}%` }}
                        ></div>
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-2xl font-bold text-white leading-none block">
                        Día {protocol?.currentDay}
                    </span>
                    <span className="text-xs text-blue-400 font-bold uppercase">En Curso</span>
                </div>
            </div>

            {/* List */}
            <div className="space-y-4">
                {DAYS_CONTENT.map((content) => {
                    const isCompleted = (protocol?.logs[content.day]?.completed) || false;
                    const isActive = protocol?.currentDay === content.day;
                    const isLocked = content.day > (protocol?.currentDay || 1);

                    return (
                        <div id={`day-${content.day}`} key={content.day}>
                            <DailyStep
                                {...content}
                                isCompleted={isCompleted}
                                isActive={isActive}
                                isLocked={isLocked}
                                onComplete={handleDayComplete}
                                log={protocol?.logs[content.day]}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
