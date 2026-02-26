import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// U.S. Navy Standard Math Engine functions
const calculateBodyFat = (gender: 'male' | 'female', waist: number, neck: number, height: number, hip: number): number => {
    // Basic approximation (for more accurate conversions look up exact navy formula)
    // cm log base 10 formulas
    if (waist <= 0 || neck <= 0 || height <= 0 || (gender === 'female' && hip <= 0)) return 0;

    try {
        if (gender === 'male') {
            const fat = 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(height)) - 450;
            return Math.max(2, Math.min(60, fat)); // clamp between 2 and 60%
        } else {
            const fat = 495 / (1.29579 - 0.35004 * Math.log10(waist + hip - neck) + 0.22100 * Math.log10(height)) - 450;
            return Math.max(10, Math.min(60, fat)); // clamp between 10 and 60%
        }
    } catch (e) {
        return 0;
    }
};

const calculateWHR = (waist: number, hip: number): number => {
    if (hip <= 0) return 0;
    return waist / hip;
};

const calculateFFMI = (weight: number, bodyFat: number, height: number): number => {
    if (height <= 0) return 0;
    const heightInMeters = height / 100;
    const fatFreeMass = weight * (1 - (bodyFat / 100));
    return fatFreeMass / (heightInMeters * heightInMeters);
};

const MetamorfosisCalculator = () => {
    const [gender, setGender] = useState<'male' | 'female'>('male');
    const [weight, setWeight] = useState<number>(80);
    const [height, setHeight] = useState<number>(175);
    const [waist, setWaist] = useState<number>(90);
    const [hip, setHip] = useState<number>(100);
    const [neck, setNeck] = useState<number>(38);
    const [showOverlay, setShowOverlay] = useState(false);

    // Calc Values
    const whr = calculateWHR(waist, hip);
    const bf = calculateBodyFat(gender, waist, neck, height, hip);
    const ffmi = calculateFFMI(weight, bf, height);

    // Hooks & Reactive Logic
    const isHighVisceralFat = whr > (gender === 'male' ? 0.90 : 0.85);
    const avatarShadowColor = isHighVisceralFat ? 'rgba(245, 158, 11, 0.5)' : 'rgba(45, 212, 191, 0.2)';
    const textColor = isHighVisceralFat ? 'text-amber-500' : 'text-teal-400';

    useEffect(() => {
        // Show ePayco overlay automatically after basic interactions if body fat implies insight
        const timeout = setTimeout(() => {
            if (bf > 0 && whr > 0) {
                setShowOverlay(true);
            }
        }, 3000);
        return () => clearTimeout(timeout);
    }, [bf, whr]);

    const handleCheckout = (e: React.FormEvent) => {
        e.preventDefault();
        // Invoke ePayco logic
        if (typeof window !== 'undefined' && (window as any).ePayco) {
            const handler = (window as any).ePayco.checkout.configure({
                key: 'PUBLIC_KEY_EPAYCO', // Replace with real key or dynamically pass it
                test: true
            });
            const data = {
                name: "Reporte de Longevidad PRO",
                description: "Análisis Biométrico de Grasa Visceral y FFMI",
                currency: "usd",
                amount: "1.99",
                tax_base: "0",
                tax: "0",
                country: "co",
                lang: "es",
                external: "false",
                // Method 'GET' is crucial for redirection after success as requested
                method: "GET",
                confirmation: "https://ejemplo.com/confirmation", // Will be overridden by checkout script mostly
                response: window.location.origin + "/api/generate-pdf-report?status=success"
            };
            handler.open(data);
        } else {
            alert('El módulo de pagos está cargando...');
        }
    };

    return (
        <div className="min-h-screen bg-[#030712] text-white flex flex-col md:flex-row p-6 md:p-12 font-sans relative overflow-hidden">

            {/* Left Column: Sliders Data */}
            <div className="w-full md:w-1/2 flex flex-col gap-6 z-10">
                <h2 className="text-3xl font-black uppercase tracking-tighter text-teal-400 mb-4">Cockpit Biométrico</h2>

                <div className="flex gap-4 mb-4">
                    <button
                        className={`flex-1 py-3 rounded-xl border ${gender === 'male' ? 'bg-teal-500/20 border-teal-500 text-teal-400' : 'bg-gray-900 border-gray-700 text-gray-400'} uppercase font-bold tracking-widest transition-all`}
                        onClick={() => setGender('male')}
                    >Masculino</button>
                    <button
                        className={`flex-1 py-3 rounded-xl border ${gender === 'female' ? 'bg-teal-500/20 border-teal-500 text-teal-400' : 'bg-gray-900 border-gray-700 text-gray-400'} uppercase font-bold tracking-widest transition-all`}
                        onClick={() => setGender('female')}
                    >Femenino</button>
                </div>

                <div className="space-y-6">
                    <SliderField label="Peso" value={weight} min={40} max={150} unit="kg" setter={setWeight} activeColor={textColor} />
                    <SliderField label="Altura" value={height} min={140} max={220} unit="cm" setter={setHeight} activeColor={textColor} />
                    <SliderField label="Cintura" value={waist} min={50} max={150} unit="cm" setter={setWaist} activeColor={textColor} />
                    <SliderField label="Cadera" value={hip} min={50} max={160} unit="cm" setter={setHip} activeColor={textColor} />
                    <SliderField label="Cuello" value={neck} min={25} max={60} unit="cm" setter={setNeck} activeColor={textColor} />
                </div>
            </div>

            {/* Right Column: Visual Reactive Avatar */}
            <div className="w-full md:w-1/2 flex flex-col items-center justify-center relative mt-12 md:mt-0 z-10">

                {/* SVG Silhouette */}
                <motion.div
                    animate={{ scale: [0.98, 1, 0.98] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                    className="relative w-64 h-96 flex justify-center"
                    style={{ filter: `drop-shadow(0 0 25px ${avatarShadowColor})` }}
                >
                    <svg viewBox="0 0 100 200" className="w-full h-full text-gray-800" fill="currentColor">
                        {/* Simplified Abstract Core Avatar */}
                        <circle cx="50" cy="20" r="12" className={textColor} />
                        <path d={`M35 40 Q 50 ${isHighVisceralFat ? 80 : 35} 65 40 L 70 90 Q 50 ${isHighVisceralFat ? 130 : 95} 30 90 Z`} className="text-gray-900 transition-all duration-500" stroke="currentColor" strokeWidth="2" />
                        <rect x="40" y="90" width="8" height="60" rx="4" />
                        <rect x="52" y="90" width="8" height="60" rx="4" />
                    </svg>

                    {/* Aura Indicator */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center w-full">
                        {isHighVisceralFat && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute -top-16 left-1/2 transform -translate-x-1/2 w-48 text-center bg-amber-500/20 border border-amber-500/50 p-2 rounded text-xs text-amber-500 uppercase tracking-widest font-bold backdrop-blur-md">
                                Alerta Visceral
                            </motion.div>
                        )}
                    </div>
                </motion.div>

                {/* Metric Readouts */}
                <div className="grid grid-cols-2 gap-4 mt-8 w-full max-w-sm">
                    <div className="bg-gray-900/50 border border-gray-800 p-4 rounded-xl text-center">
                        <span className="block text-gray-500 text-[10px] uppercase tracking-widest mb-1">Cintura/Cadera (WHR)</span>
                        <span className={`text-2xl font-black ${textColor}`}>{whr.toFixed(2)}</span>
                    </div>
                    <div className="bg-gray-900/50 border border-gray-800 p-4 rounded-xl text-center">
                        <span className="block text-gray-500 text-[10px] uppercase tracking-widest mb-1">Grasa Corporal</span>
                        <span className={`text-2xl font-black ${textColor}`}>{bf.toFixed(1)}%</span>
                    </div>
                </div>

                {isHighVisceralFat && (
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mt-6 text-center text-sm text-gray-400 px-6">
                        <span className="text-amber-500 font-bold block mb-1">¿Sabías qué?</span>
                        Tu coeficiente de Grasa Visceral ({whr.toFixed(2)}) está interfiriendo con la señalización de leptina en este momento.
                    </motion.div>
                )}
            </div>

            {/* Glassmorphism ePayco Checkout Overlay */}
            {showOverlay && (
                <motion.div
                    initial={{ backdropFilter: "blur(0px)", backgroundColor: "rgba(3, 7, 18, 0)" }}
                    animate={{ backdropFilter: "blur(12px)", backgroundColor: "rgba(3, 7, 18, 0.85)" }}
                    className="absolute inset-0 z-50 flex items-center justify-center p-6"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        className="bg-gray-900/90 border border-teal-500/30 p-8 rounded-3xl w-full max-w-md shadow-[0_0_50px_rgba(45,212,191,0.15)] text-center relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 to-indigo-500"></div>
                        <h3 className="text-2xl font-black uppercase tracking-tighter text-white mb-2">Desbloquea tu Biología</h3>
                        <p className="text-gray-400 text-sm mb-6">Hemos detectado patrones en tu índice FFMI (Masa Libre de Grasa: <span className="text-teal-400 font-bold">{ffmi.toFixed(1)}</span>). Descubre cómo revertir tu resistencia metabólica exacta.</p>

                        <form onSubmit={handleCheckout}>
                            <button type="submit" className="w-full bg-teal-500 hover:bg-teal-400 text-gray-900 font-black uppercase tracking-widest py-4 rounded-xl transition-all hover:scale-[1.02] shadow-[0_0_20px_rgba(45,212,191,0.4)] mb-4 flex justify-center items-center gap-2">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                Reporte PRO ($1.99 USD)
                            </button>

                            {/* Wallets Trust Badges */}
                            <div className="flex justify-center items-center gap-4 opacity-50 grayscale hover:grayscale-0 transition-all cursor-default">
                                {/* Apple Pay SVG Mock */}
                                <svg className="h-6" viewBox="0 0 50 20" fill="currentColor">
                                    <path d="M12 9c0-1.8 1.4-2.8 2.2-3.3-1-1.1-2.6-1.3-3.1-1.3-1.3-.1-2.6.7-3.3.7-.7 0-1.7-.6-2.8-.6-1.5 0-2.9.8-3.6 2.1-1.6 2.8-.4 6.9 1.1 9.1.7 1.1 1.6 2.2 2.7 2.2 1.1 0 1.5-.7 2.8-.7 1.3 0 1.7.7 2.8.7 1.2 0 1.9-1.1 2.6-2.1.9-1.3 1.3-2.6 1.3-2.7 0-.1-2.5-1-2.5-3.8zm-1.8-6.1c.6-.7 1-1.7 1-2.7 0-.1 0-.2 0-.2-1 0-2 .6-2.6 1.4-.5.6-.9 1.6-.8 2.5.1 0 .2.1.2.1 1 0 1.7-.5 2.2-1.1z" />
                                    <text x="20" y="15" fontSize="14" fontWeight="bold">Pay</text>
                                </svg>
                                {/* Google Pay SVG Mock */}
                                <svg className="h-6" viewBox="0 0 50 20" fill="currentColor">
                                    <text x="0" y="15" fontSize="14" fontWeight="bold">G Pay</text>
                                </svg>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
};

// Subcomponent for Sliders to reduce boilerplate
const SliderField = ({ label, value, min, max, unit, setter, activeColor }: { label: string, value: number, min: number, max: number, unit: string, setter: (val: number) => void, activeColor: string }) => {
    return (
        <div className="w-full">
            <div className="flex justify-between items-end mb-1">
                <label className="text-gray-400 font-mono text-[10px] uppercase tracking-widest">{label}</label>
                <div className={`font-black text-xl ${activeColor} transition-colors`}>{value}<span className="text-gray-500 text-sm ml-1">{unit}</span></div>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                value={value}
                onChange={(e) => setter(Number(e.target.value))}
                className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-teal-500 hover:accent-teal-400 transition-all focus:outline-none"
            />
        </div>
    );
};

export default MetamorfosisCalculator;
