import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ControlPanel from './ControlPanel';
import MorphingSilhouette from './MorphingSilhouette';

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
    const [step, setStep] = useState<'measuring' | 'results'>('measuring');

    // Calc Values
    const whr = calculateWHR(waist, hip);
    const bf = calculateBodyFat(gender, waist, neck, height, hip);
    const ffmi = calculateFFMI(weight, bf, height);

    // Hooks & Reactive Logic
    const isHighVisceralFat = whr > (gender === 'male' ? 0.90 : 0.85);
    const avatarShadowColor = isHighVisceralFat ? 'rgba(245, 158, 11, 0.5)' : 'rgba(45, 212, 191, 0.2)';
    const textColor = isHighVisceralFat ? 'text-amber-500' : 'text-teal-400';

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
        <div className="min-h-screen bg-[#030712] text-white p-6 md:p-12 font-sans relative overflow-hidden flex items-center justify-center">

            <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-[1.1fr_1fr] items-center gap-12 md:gap-16 z-10">
                {/* Visual Reactive Avatar (Mobile First: Top, Desktop: Left) */}
                <div className="w-full flex flex-col items-center justify-center relative order-1 md:order-1">

                    {/* Reactive SVG Silhouette Morphing Engine */}
                    <MorphingSilhouette
                        waist={waist}
                        hip={hip}
                        height={height}
                        gender={gender}
                        whr={whr}
                    />

                    {/* Metric Readouts */}
                    <div className="grid grid-cols-2 gap-4 mt-8 w-full max-w-md">
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
                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mt-6 text-center text-sm text-gray-400 px-6 max-w-md">
                            <span className="text-amber-500 font-bold block mb-1">¿Sabías qué?</span>
                            Tu coeficiente de Grasa Visceral ({whr.toFixed(2)}) está interfiriendo con la señalización de leptina en este momento.
                        </motion.div>
                    )}
                </div>

                {/* Sliders Data (Mobile First: Bottom, Desktop: Right) */}
                <div className="w-full flex flex-col justify-center order-2 md:order-2">
                    <ControlPanel
                        gender={gender} setGender={setGender}
                        weight={weight} setWeight={setWeight}
                        height={height} setHeight={setHeight}
                        waist={waist} setWaist={setWaist}
                        hip={hip} setHip={setHip}
                        neck={neck} setNeck={setNeck}
                        textColor={textColor}
                    />

                    {step === 'measuring' && (
                        <button
                            onClick={() => setStep('results')}
                            className="mt-8 w-full bg-teal-500 hover:bg-teal-400 text-gray-900 font-black uppercase tracking-widest py-4 rounded-xl transition-all hover:scale-[1.02] shadow-[0_0_20px_rgba(45,212,191,0.4)]"
                        >
                            Ver mi Diagnóstico Inicial
                        </button>
                    )}
                </div>
                {/* Glassmorphism ePayco Checkout Overlay */}
                {step === 'results' && (
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
        </div>
    );
};

export default MetamorfosisCalculator;
