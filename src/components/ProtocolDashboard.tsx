
import React, { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { Timestamp } from 'firebase/firestore';
import {
    getProtocolState,
    initializeProtocol,
    completeDay,
    type ProtocolState
} from '../lib/firebase/protocol';
import DailyStep from './DailyStep';

const DAYS_CONTENT = [
    {
        day: 1,
        title: "Protocolo de Eliminación",
        description: "Hoy es tu día de 'reset'. Tu objetivo es simple: 16 horas de ayuno y eliminar azúcar, ultraprocesados y alcohol. Bebe agua con sal."
    },
    {
        day: 2,
        title: "Activación Metabólica",
        description: "Introduce movimiento ligero antes de romper tu ayuno. Una caminata de 20 minutos es suficiente para potenciar la quema de grasa."
    },
    {
        day: 3,
        title: "Carga de Nutrientes",
        description: "Rompe tu ayuno con proteína de alta calidad y grasas saludables. Aguacate, huevos, aceite de oliva. Nada de carbohidratos refinados."
    },
    {
        day: 4,
        title: "Ayuno Extendido (Opcional)",
        description: "Si te sientes con energía, intenta llegar a las 18 horas de ayuno hoy. La autofagia (limpieza celular) se intensifica."
    },
    {
        day: 5,
        title: "Sueño Reparador",
        description: "Tu prioridad hoy es dormir 8 horas. Sin pantallas 1 hora antes de dormir. El sueño es cuando tu cuerpo quema más grasa."
    },
    {
        day: 6,
        title: "Entrenamiento de Fuerza",
        description: "Haz una sesión de fuerza en ayunas o justo antes de comer. Estimula tus músculos para que absorban los nutrientes."
    },
    {
        day: 7,
        title: "Día de Celebración & Siguiente Nivel",
        description: "Has completado la semana. Tu cuerpo está más limpio y eficiente. Es hora de llevar esto al siguiente nivel con ElenaApp."
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

    const handleDayComplete = async (day: number, fastingHours: number, cleanEating: boolean) => {
        // Mock Mode Handler
        if (!userId) {
            const newLog = {
                day,
                completed: true,
                fastingHours,
                cleanEating,
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
            const newState = await completeDay(userId, day, fastingHours, cleanEating);
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

    if (protocol?.isFinished) {
        return (
            <div className="text-center py-12 px-4 animate-fade-in-up">
                <div className="bg-gradient-to-br from-[#00C49A]/20 to-blue-600/20 border border-[#00C49A]/30 p-8 rounded-3xl backdrop-blur-md shadow-2xl max-w-2xl mx-auto">
                    <span className="text-6xl mb-6 block">🏆</span>
                    <h2 className="text-4xl font-black text-white mb-4 leading-tight">
                        ¡Misión Cumplida!
                    </h2>
                    <p className="text-xl text-gray-300 mb-8">
                        Has completado los 7 días de reinicio. Tu cuerpo ha iniciado la metamorfosis.
                        <br /><br />
                        <strong className="text-[#00C49A]">No te detengas ahora.</strong> Desbloquea tu potencial completo en la Elena App.
                    </p>

                    <a
                        href="https://buy.stripe.com/test_link_elena_app"
                        target="_blank"
                        className="inline-block w-full sm:w-auto px-8 py-5 bg-gradient-to-r from-[#00C49A] to-blue-600 hover:from-[#00C49A]/90 hover:to-blue-600/90 text-white font-black text-xl rounded-xl shadow-lg hover:shadow-[#00C49A]/50 transform hover:-translate-y-1 transition-all"
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
