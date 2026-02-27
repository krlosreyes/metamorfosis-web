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
    // Exact defaults from Image 6 Prompt
    const [gender, setGender] = useState<'male' | 'female'>('female');
    const [weight, setWeight] = useState<number>(63);
    const [height, setHeight] = useState<number>(163);
    const [waist, setWaist] = useState<number>(60);
    const [hip, setHip] = useState<number>(90);
    const [neck, setNeck] = useState<number>(34);
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
        <div className="fixed top-[80px] left-0 right-0 bottom-0 overflow-hidden bg-[radial-gradient(circle_at_30%_30%,_#0b1e2d_0%,_#07131f_60%,_#050c14_100%)] text-white p-[40px] font-sans flex items-center justify-center">

            {/* Inner Cockpit Container - Pure dark UI */}
            <div className="w-full h-full flex overflow-hidden">

                {/* exactly proportional grid adapting to mobile sizes gracefully */}
                <div className="w-full h-full grid grid-cols-1 grid-rows-[minmax(200px,1fr)_auto] md:grid-cols-[1.1fr_0.9fr] md:grid-rows-1 items-stretch gap-[56px] z-10">

                    {/* Visual Reactive Avatar / Left Panel */}
                    <div className="w-full h-full flex flex-col items-center justify-center relative order-1 md:order-1 rounded-[28px] overflow-hidden shadow-[0_0_20px_rgba(0,245,212,0.1)] bg-[#0c1f31] p-[32px]">

                        {/* Background Sonar / Targeting Grid */}
                        <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-40">
                            <svg width="100%" height="100%" viewBox="0 0 400 600" preserveAspectRatio="xMidYMid slice" className="absolute">
                                <circle cx="200" cy="300" r="280" fill="none" stroke="#2DD4BF" strokeWidth="0.5" />
                                <circle cx="200" cy="300" r="200" fill="none" stroke="#2DD4BF" strokeWidth="0.5" />
                                <circle cx="200" cy="300" r="120" fill="none" stroke="#2DD4BF" strokeWidth="0.5" />
                                <line x1="0" y1="300" x2="400" y2="300" stroke="#2DD4BF" strokeWidth="0.5" />
                                <line x1="200" y1="0" x2="200" y2="600" stroke="#2DD4BF" strokeWidth="0.5" />
                            </svg>
                        </div>

                        <MorphingSilhouette
                            waist={waist}
                            hip={hip}
                            height={height}
                            gender={gender}
                            whr={whr}
                        />

                        {isHighVisceralFat && (
                            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="absolute bottom-6 text-center text-xs text-gray-400 px-6 max-w-sm bg-[#0B1120]/80 backdrop-blur-md rounded-xl p-3 border border-amber-500/30 z-20">
                                <span className="text-amber-500 font-bold block mb-1">ALERTA METABÓLICA</span>
                                Coeficiente Visceral ({whr.toFixed(2)}) bloqueando leptina.
                            </motion.div>
                        )}
                    </div>

                    {/* Sliders Data & Gauges / Right Panel */}
                    <div className="w-full h-full flex flex-col justify-between order-2 md:order-2 overflow-hidden gap-[32px] relative min-h-0">

                        {/* Unified Dark Data Container */}
                        <div className="w-full flex-1 flex flex-col bg-[#0c1f31] rounded-[24px] border border-[rgba(0,245,212,0.25)] shadow-[0_0_20px_rgba(0,245,212,0.1)] p-[32px] overflow-hidden min-h-0">
                            <div className="flex-shrink-0">
                                <ControlPanel
                                    gender={gender} setGender={setGender}
                                    weight={weight} setWeight={setWeight}
                                    height={height} setHeight={setHeight}
                                    waist={waist} setWaist={setWaist}
                                    hip={hip} setHip={setHip}
                                    neck={neck} setNeck={setNeck}
                                    textColor={textColor}
                                />
                            </div>

                            {/* Radial Telemetry Gauges relocated here 0-80 and 0-0.8 */}
                            <div className="flex justify-around items-center flex-shrink min-h-0 mt-auto pt-2">
                                <RadialGauge
                                    value={bmi}
                                    min={0} max={80}
                                    label="IMC"
                                    targetColor={bmi > 25 ? '#F59E0B' : '#2DD4BF'}
                                />
                                <RadialGauge
                                    value={whr}
                                    min={0} max={0.8}
                                    label="WHR"
                                    targetColor={textColor === 'text-amber-500' ? '#F59E0B' : '#2DD4BF'}
                                />
                            </div>
                        </div>

                        {/* Integrated e-Commerce Footer Panel */}
                        <div className="flex flex-col gap-3 md:gap-4 flex-shrink-0 relative z-20">

                            {/* Neon CTA Button */}
                            <button
                                onClick={() => alert('Generando Diagnóstico...')}
                                className="w-full bg-[#00f5d4] hover:bg-[#00e3c5] text-[#0c1f31] text-sm md:text-lg font-black uppercase tracking-widest h-[64px] rounded-[16px] transition-all hover:scale-[1.02] relative shadow-[0_0_20px_rgba(0,245,212,0.3)] hover:shadow-[0_0_30px_rgba(0,245,212,0.6)]"
                            >
                                <motion.div className="absolute inset-0 bg-[#00f5d4] opacity-20 rounded-[16px]" animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2 }} />
                                VER MI DIAGNÓSTICO INICIAL
                            </button>

                            {/* Prominent Payment Providers row */}
                            <form onSubmit={handleCheckout} className="flex gap-3 md:gap-4">

                                {/* ePayco Red Bold Button */}
                                <button type="submit" className="flex-1 bg-[#E02A2A] hover:bg-red-500 text-white font-black h-[56px] rounded-[16px] transition-all hover:scale-[1.02] shadow-lg flex justify-center items-center border border-red-500/50 hover:shadow-[0_0_15px_rgba(224,42,42,0.4)]">
                                    <span className="text-xl md:text-2xl italic tracking-tighter">ePayco</span>
                                </button>

                                {/* GPay / Apple Pay RESTYLED to Black/Gray */}
                                <div className="flex-1 bg-black text-white border border-[#1E293B] hover:border-gray-600 rounded-[16px] flex justify-center items-center gap-4 md:gap-6 shadow-lg cursor-pointer hover:bg-gray-900 transition-all font-black hover:scale-[1.02]">
                                    <svg className="h-5 md:h-6" viewBox="0 0 50 20" fill="currentColor">
                                        <text x="0" y="15" fontSize="16" fontWeight="bold">G Pay</text>
                                    </svg>
                                    <div className="w-px h-5 md:h-6 bg-[#1E293B]"></div>
                                    <svg className="h-5 md:h-6" viewBox="0 0 50 20" fill="currentColor">
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
