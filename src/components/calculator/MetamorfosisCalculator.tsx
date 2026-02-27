import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ControlPanel from './ControlPanel';
import MorphingSilhouette from './MorphingSilhouette';
import RadialGauge from './RadialGauge';

// U.S. Navy Standard Math Engine functions
const calculateBodyFat = (gender: 'male' | 'female', waist: number, neck: number, height: number, hip: number): number => {
    if (waist <= 0 || neck <= 0 || height <= 0 || (gender === 'female' && hip <= 0)) return 0;
    try {
        if (gender === 'male') {
            const fat = 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(height)) - 450;
            return Math.max(2, Math.min(60, fat));
        } else {
            const fat = 495 / (1.29579 - 0.35004 * Math.log10(waist + hip - neck) + 0.22100 * Math.log10(height)) - 450;
            return Math.max(10, Math.min(60, fat));
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
    const [gender, setGender] = useState<'male' | 'female'>('female');
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
    const bmi = weight / Math.pow(height / 100, 2);

    // Hooks & Reactive Logic
    const isHighVisceralFat = whr > (gender === 'male' ? 0.90 : 0.85);
    const textColor = isHighVisceralFat ? 'text-amber-500' : 'text-teal-400';

    const handleCheckout = (e: React.FormEvent) => {
        e.preventDefault();
        if (typeof window !== 'undefined' && (window as any).ePayco) {
            const handler = (window as any).ePayco.checkout.configure({
                key: 'PUBLIC_KEY_EPAYCO',
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
                method: "GET",
                confirmation: "https://ejemplo.com/confirmation",
                response: window.location.origin + "/api/generate-pdf-report?status=success"
            };
            handler.open(data);
        } else {
            alert('El módulo de pagos está cargando...');
        }
    };

    return (
        <div className="fixed inset-0 top-[80px] h-[calc(100vh-80px)] overflow-hidden bg-[#030712] text-white p-4 md:p-8 font-sans flex items-center justify-center">

            {/* Inner Cockpit Container - Pure dark UI */}
            <div className="w-full max-w-[1200px] h-full max-h-[90vh] flex overflow-hidden">

                <div className="w-full h-full grid grid-cols-1 grid-rows-[45%_55%] md:grid-cols-[1.1fr_1fr] items-stretch gap-6 md:gap-8 z-10 w-full">

                    {/* Visual Reactive Avatar */}
                    <div className="w-full h-full flex flex-col items-center justify-center relative order-1 md:order-1 border-2 border-[#2DD4BF] rounded-[32px] overflow-hidden shadow-[0_0_40px_rgba(45,212,191,0.1)] bg-[#0B1120]">

                        <MorphingSilhouette
                            waist={waist}
                            hip={hip}
                            height={height}
                            gender={gender}
                            whr={whr}
                        />

                        {isHighVisceralFat && (
                            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="absolute bottom-6 text-center text-xs text-gray-400 px-6 max-w-sm bg-[#0B1120]/80 backdrop-blur-md rounded-xl p-3 border border-amber-500/30">
                                <span className="text-amber-500 font-bold block mb-1">ALERTA METABÓLICA</span>
                                Coeficiente Visceral ({whr.toFixed(2)}) bloqueando leptina.
                            </motion.div>
                        )}
                    </div>

                    {/* Sliders Data & Gauges */}
                    <div className="w-full h-full flex flex-col justify-start order-2 md:order-2 overflow-y-auto overflow-x-hidden pr-2 pb-8 custom-scrollbar gap-6 relative">

                        <ControlPanel
                            gender={gender} setGender={setGender}
                            weight={weight} setWeight={setWeight}
                            height={height} setHeight={setHeight}
                            waist={waist} setWaist={setWaist}
                            hip={hip} setHip={setHip}
                            neck={neck} setNeck={setNeck}
                            textColor={textColor}
                        />

                        {/* Radial Telemetry Gauges relocated here */}
                        <div className="flex justify-around items-center pt-2">
                            <RadialGauge
                                value={bmi}
                                min={0} max={60}
                                label="IMC"
                                targetColor={bmi > 25 ? '#F59E0B' : '#2DD4BF'}
                            />
                            <RadialGauge
                                value={whr}
                                min={0} max={1.2}
                                label="WHR"
                                targetColor={textColor === 'text-amber-500' ? '#F59E0B' : '#2DD4BF'}
                            />
                        </div>

                        {/* Integrated e-Commerce Footer Panel */}
                        <div className="flex flex-col gap-4 mt-auto pt-4 relative z-20">
                            <button
                                onClick={() => alert('Generando Diagnóstico...')}
                                className="w-full bg-[#2DD4BF] hover:bg-teal-400 text-[#030712] text-sm md:text-lg font-black uppercase tracking-widest py-4 rounded-[20px] transition-all hover:scale-[1.02] relative shadow-[0_0_20px_rgba(45,212,191,0.3)] hover:shadow-[0_0_30px_rgba(45,212,191,0.6)]"
                            >
                                <motion.div className="absolute inset-0 bg-[#2DD4BF] opacity-20 rounded-[20px]" animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2 }} />
                                VER MI DIAGNÓSTICO INICIAL
                            </button>

                            <form onSubmit={handleCheckout} className="flex gap-4">
                                <button type="submit" className="flex-1 bg-[#E02A2A] hover:bg-red-500 text-white font-black py-4 rounded-[20px] transition-all hover:scale-[1.02] shadow-lg flex justify-center items-center border-t border-red-500/50 hover:shadow-[0_0_15px_rgba(224,42,42,0.4)]">
                                    <span className="text-2xl italic tracking-tighter">ePayco</span>
                                </button>

                                <div className="flex-1 bg-[#09090b] border border-gray-800 rounded-[20px] flex justify-center items-center gap-6 shadow-lg">
                                    <svg className="h-6 text-white" viewBox="0 0 50 20" fill="currentColor">
                                        <text x="0" y="15" fontSize="16" fontWeight="bold">G Pay</text>
                                    </svg>
                                    <div className="w-px h-6 bg-gray-800"></div>
                                    <svg className="h-6 text-white" viewBox="0 0 50 20" fill="currentColor">
                                        <path d="M12 9c0-1.8 1.4-2.8 2.2-3.3-1-1.1-2.6-1.3-3.1-1.3-1.3-.1-2.6.7-3.3.7-.7 0-1.7-.6-2.8-.6-1.5 0-2.9.8-3.6 2.1-1.6 2.8-.4 6.9 1.1 9.1.7 1.1 1.6 2.2 2.7 2.2 1.1 0 1.5-.7 2.8-.7 1.3 0 1.7.7 2.8.7 1.2 0 1.9-1.1 2.6-2.1.9-1.3 1.3-2.6 1.3-2.7 0-.1-2.5-1-2.5-3.8zm-1.8-6.1c.6-.7 1-1.7 1-2.7 0-.1 0-.2 0-.2-1 0-2 .6-2.6 1.4-.5.6-.9 1.6-.8 2.5.1 0 .2.1.2.1 1 0 1.7-.5 2.2-1.1z" />
                                        <text x="20" y="15" fontSize="16" fontWeight="bold">Pay</text>
                                    </svg>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MetamorfosisCalculator;
