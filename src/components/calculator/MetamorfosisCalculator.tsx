import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ControlPanel from './ControlPanel';
import MorphingSilhouette from './MorphingSilhouette';
import RadialGauge from './RadialGauge';

// ─── Math Engine ────────────────────────────────────────────────────────────
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
    } catch (e) { return 0; }
};
const calculateWHR = (waist: number, hip: number): number => hip <= 0 ? 0 : waist / hip;
const calculateFFMI = (weight: number, bodyFat: number, height: number): number => {
    if (height <= 0) return 0;
    const h = height / 100;
    return (weight * (1 - bodyFat / 100)) / (h * h);
};

// ─── Component ──────────────────────────────────────────────────────────────
const MetamorfosisCalculator = () => {
    const [gender, setGender] = useState<'male' | 'female'>('female');
    const [weight, setWeight] = useState<number>(63);
    const [height, setHeight] = useState<number>(163);
    const [waist, setWaist] = useState<number>(60);
    const [hip, setHip] = useState<number>(90);
    const [neck, setNeck] = useState<number>(34);

    const whr = calculateWHR(waist, hip);
    const bf = calculateBodyFat(gender, waist, neck, height, hip);
    const ffmi = calculateFFMI(weight, bf, height);
    const bmi = weight / Math.pow(height / 100, 2);

    const isHighRisk = whr > (gender === 'male' ? 0.90 : 0.85);
    const accent = isHighRisk ? '#F59E0B' : '#2DD4BF';
    const textColor = isHighRisk ? 'text-amber-400' : 'text-teal-400';

    const handleCheckout = (e: React.FormEvent) => {
        e.preventDefault();
        if (typeof window !== 'undefined' && (window as any).ePayco) {
            const handler = (window as any).ePayco.checkout.configure({ key: 'PUBLIC_KEY_EPAYCO', test: true });
            handler.open({
                name: 'Reporte de Longevidad PRO',
                description: 'Análisis Biométrico de Grasa Visceral y FFMI',
                currency: 'usd', amount: '1.99',
                tax_base: '0', tax: '0', country: 'co', lang: 'es',
                external: 'false', method: 'GET',
                confirmation: 'https://ejemplo.com/confirmation',
                response: window.location.origin + '/api/generate-pdf-report?status=success'
            });
        } else {
            alert('El módulo de pagos está cargando...');
        }
    };

    return (
        // ── Outer shell: full viewport below navbar ──────────────────────────
        <div className="fixed top-[80px] left-0 right-0 bottom-0 overflow-hidden
                        bg-[radial-gradient(ellipse_at_20%_20%,_#0d2137_0%,_#07131f_55%,_#040b13_100%)]
                        flex items-center justify-center p-3 md:p-6 font-sans">

            {/* ── Master Cockpit Glass Panel ─────────────────────────────── */}
            <div className="relative w-full max-w-[1440px] h-full max-h-[85vh] flex overflow-hidden
                            rounded-[28px] border border-[#2DD4BF]/40
                            bg-[#0c1f31]/50 backdrop-blur-2xl
                            shadow-[0_0_0_1px_rgba(45,212,191,0.1),0_0_60px_rgba(45,212,191,0.12),inset_0_0_40px_rgba(0,0,0,0.4)]">

                {/* Cockpit neon corner accents */}
                <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-[#2DD4BF] rounded-tl-[28px] pointer-events-none z-30" />
                <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-[#2DD4BF] rounded-tr-[28px] pointer-events-none z-30" />
                <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-[#2DD4BF] rounded-bl-[28px] pointer-events-none z-30" />
                <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-[#2DD4BF] rounded-br-[28px] pointer-events-none z-30" />

                {/* ── Inner Grid: 1.1fr [Avatar] | 1fr [Controls] ─────────── */}
                <div className="w-full h-full grid
                                grid-cols-1 grid-rows-[1fr_auto]
                                md:grid-cols-[1.1fr_1fr] md:grid-rows-1
                                min-h-0 overflow-hidden">

                    {/* ════════════════════════════════════════════════════════
                        LEFT PANEL — Holographic Silhouette
                    ════════════════════════════════════════════════════════ */}
                    <div className="relative flex items-center justify-center overflow-hidden
                                    border-b border-white/5 md:border-b-0 md:border-r md:border-[#2DD4BF]/10">

                        {/* Sonar Grid Background */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-25">
                            <svg width="100%" height="100%" viewBox="0 0 400 600" preserveAspectRatio="xMidYMid slice">
                                <defs>
                                    <radialGradient id="sonar-fade" cx="50%" cy="50%" r="50%">
                                        <stop offset="0%" stopColor="#2DD4BF" stopOpacity="0.6" />
                                        <stop offset="100%" stopColor="#2DD4BF" stopOpacity="0" />
                                    </radialGradient>
                                </defs>
                                {[260, 190, 120, 60].map((r, i) => (
                                    <circle key={i} cx="200" cy="300" r={r} fill="none" stroke="url(#sonar-fade)" strokeWidth="0.5" />
                                ))}
                                <line x1="0" y1="300" x2="400" y2="300" stroke="#2DD4BF" strokeWidth="0.4" strokeOpacity="0.5" />
                                <line x1="200" y1="0" x2="200" y2="600" stroke="#2DD4BF" strokeWidth="0.4" strokeOpacity="0.5" />
                                {/* Diagonal crosshair */}
                                <line x1="0" y1="0" x2="400" y2="600" stroke="#2DD4BF" strokeWidth="0.2" strokeOpacity="0.15" />
                                <line x1="400" y1="0" x2="0" y2="600" stroke="#2DD4BF" strokeWidth="0.2" strokeOpacity="0.15" />
                            </svg>
                        </div>

                        {/* Cockpit header label */}
                        <div className="absolute top-4 left-0 right-0 flex items-center justify-center z-20 pointer-events-none">
                            <span className="text-[10px] font-bold tracking-[0.35em] text-[#2DD4BF]/50 uppercase">
                                SCANNER BIOMÉTRICO ACTIVO
                            </span>
                        </div>

                        {/* MorphingSilhouette */}
                        <MorphingSilhouette waist={waist} hip={hip} height={height} gender={gender} whr={whr} />

                        {/* Metabolic Alert Banner */}
                        <AnimatePresence>
                            {isHighRisk && (
                                <motion.div
                                    key="alert"
                                    initial={{ y: 30, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: 30, opacity: 0 }}
                                    className="absolute bottom-4 left-4 right-4 text-center text-xs
                                               bg-amber-950/80 backdrop-blur-md rounded-xl px-4 py-2
                                               border border-amber-500/50 z-20 shadow-[0_0_20px_rgba(245,158,11,0.25)]"
                                >
                                    <span className="text-amber-400 font-bold">⚠ ALERTA METABÓLICA —</span>
                                    <span className="text-amber-300/80 ml-1">WHR {whr.toFixed(2)} · Riesgo Visceral Elevado</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* ════════════════════════════════════════════════════════
                        RIGHT PANEL — Controls + Gauges + Payment
                    ════════════════════════════════════════════════════════ */}
                    <div className="flex flex-col overflow-hidden min-h-0 p-5 md:p-7 gap-4">

                        {/* Title strip */}
                        <div className="flex-shrink-0 flex items-center justify-between">
                            <div>
                                <h1 className="text-base md:text-lg font-black uppercase tracking-[0.2em] text-[#2DD4BF]
                                               drop-shadow-[0_0_10px_rgba(45,212,191,0.6)]">
                                    BIOMETRÍA
                                </h1>
                                <p className="text-[10px] text-slate-500 tracking-widest uppercase mt-0.5">
                                    Ingresa tus medidas
                                </p>
                            </div>
                            <div className={`text-right ${textColor}`}>
                                <div className="text-xs font-bold tracking-widest uppercase opacity-60">Estado</div>
                                <div className="text-sm font-black">{isHighRisk ? 'Riesgo Alto' : 'Óptimo'}</div>
                            </div>
                        </div>

                        {/* Control Panel Sliders */}
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

                        {/* ── Telemetry Gauges row ─────────────────────────── */}
                        <div className="flex-shrink-0 flex items-center justify-around gap-2
                                        bg-[#050c14]/60 rounded-2xl px-2 py-2
                                        border border-white/5">
                            <div className="flex flex-col items-center w-[48%]">
                                <RadialGauge
                                    value={bmi}
                                    min={12} max={45}
                                    label="IMC"
                                    targetColor={bmi > 25 ? '#F59E0B' : '#2DD4BF'}
                                />
                                <p className="text-[9px] text-slate-500 tracking-widest text-center -mt-1">
                                    {bmi < 18.5 ? 'BAJO PESO' : bmi < 25 ? 'NORMAL' : bmi < 30 ? 'SOBREPESO' : 'OBESIDAD'}
                                </p>
                            </div>
                            <div className="w-px h-16 bg-white/5 flex-shrink-0" />
                            <div className="flex flex-col items-center w-[48%]">
                                <RadialGauge
                                    value={whr}
                                    min={0.6} max={1.1}
                                    label="WHR"
                                    targetColor={isHighRisk ? '#F59E0B' : '#2DD4BF'}
                                />
                                <p className="text-[9px] text-slate-500 tracking-widest text-center -mt-1">
                                    {isHighRisk ? 'RIESGO VISCERAL' : 'PROPORCIÓN SANA'}
                                </p>
                            </div>
                        </div>

                        {/* ── CTA + Payment Footer ─────────────────────────── */}
                        <div className="flex-shrink-0 flex flex-col gap-2 mt-auto">

                            {/* Primary CTA */}
                            <motion.button
                                onClick={() => alert('Generando Diagnóstico...')}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="relative w-full h-[52px] md:h-[60px] rounded-[14px] overflow-hidden
                                           bg-[#2DD4BF] text-[#050c14] font-black uppercase
                                           text-sm md:text-base tracking-[0.2em]
                                           shadow-[0_0_30px_rgba(45,212,191,0.35)]
                                           hover:shadow-[0_0_50px_rgba(45,212,191,0.6)]
                                           transition-shadow duration-300"
                            >
                                <motion.div
                                    className="absolute inset-0 bg-white/20"
                                    animate={{ x: ['-100%', '100%'] }}
                                    transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
                                    style={{ clipPath: 'polygon(0 0, 20% 0, 35% 100%, 0 100%)' }}
                                />
                                VER MI DIAGNÓSTICO INICIAL
                            </motion.button>

                            {/* Payment Providers */}
                            <form onSubmit={handleCheckout} className="flex gap-2">

                                {/* ePayco */}
                                <button
                                    type="submit"
                                    className="flex-1 h-[44px] bg-[#D32F2F] hover:bg-[#E53935]
                                               text-white font-black rounded-[12px] text-base italic
                                               tracking-tight border border-red-400/30
                                               shadow-[0_0_15px_rgba(211,47,47,0.3)]
                                               hover:shadow-[0_0_25px_rgba(229,57,53,0.5)]
                                               transition-all flex items-center justify-center"
                                >
                                    ePayco
                                </button>

                                {/* Google Pay + Apple Pay */}
                                <div className="flex-[1.4] h-[44px] bg-black/80 rounded-[12px]
                                                border border-white/10 flex items-center justify-center
                                                gap-3 cursor-pointer hover:bg-black/90
                                                hover:border-white/20 transition-all">

                                    {/* Google Pay */}
                                    <svg height="18" viewBox="0 0 41 17" fill="none">
                                        <text y="14" fontSize="13" fontWeight="700" fontFamily="sans-serif" fill="white">G</text>
                                        <text x="11" y="14" fontSize="13" fontWeight="400" fontFamily="sans-serif" fill="white">Pay</text>
                                    </svg>

                                    <div className="w-px h-5 bg-white/20" />

                                    {/* Apple Pay */}
                                    <svg height="18" viewBox="0 0 55 17" fill="white">
                                        <path d="M7.4 3.7c.6-.8 1-1.8 1-2.9-.9.1-2 .6-2.6 1.4C5.2 3 4.8 4 4.9 5c1 0 2-.5 2.5-1.3zm.9 1.5c-1.4-.1-2.6.8-3.3.8-.7 0-1.7-.7-2.8-.7-1.5 0-2.9.8-3.6 2.1-1.6 2.7-.4 6.7 1.1 9 .7 1.1 1.6 2.1 2.7 2.1 1.1 0 1.5-.7 2.8-.7 1.3 0 1.7.7 2.9.7 1.1 0 2-1 2.7-2.1.4-.7.8-1.4 1.1-2.1-2.5-1-2.5-4.8 0-5.8-.8-1.3-2.1-2.3-3.6-2.3z" />
                                        <text x="18" y="13" fontSize="11" fontWeight="700" fontFamily="sans-serif" fill="white">Pay</text>
                                    </svg>
                                </div>
                            </form>

                            {/* Price hint */}
                            <p className="text-center text-[9px] text-slate-600 tracking-widest uppercase">
                                Desde $1.99 USD · Pago único · Sin suscripción
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MetamorfosisCalculator;
