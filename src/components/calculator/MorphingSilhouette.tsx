import React from 'react';
import { motion } from 'framer-motion';
import { MetabolicAnatomyEngine } from '../../utils/MetabolicAnatomyEngine';

interface MorphingSilhouetteProps {
    waist: number;
    hip: number;
    height: number;
    gender: 'male' | 'female';
    whr: number;
    weight: number;
}

// Catmull-Rom → Cubic Bezier spline generator
const catmullRom2bezier = (pts: number[][], tension = 1): string => {
    if (pts.length < 3) return '';
    let d = `M ${pts[0][0]} ${pts[0][1]} `;
    for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[Math.max(0, i - 1)];
        const p1 = pts[i];
        const p2 = pts[i + 1];
        const p3 = pts[Math.min(pts.length - 1, i + 2)];
        const cp1x = p1[0] + (p2[0] - p0[0]) / 6 * tension;
        const cp1y = p1[1] + (p2[1] - p0[1]) / 6 * tension;
        const cp2x = p2[0] - (p3[0] - p1[0]) / 6 * tension;
        const cp2y = p2[1] - (p3[1] - p1[1]) / 6 * tension;
        d += `C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2[0]} ${p2[1]} `;
    }
    return d;
};

const MorphingSilhouette: React.FC<MorphingSilhouetteProps> = ({ waist, hip, height, gender, whr, weight }) => {
    // ── 1. Constants and Themes ─────────────────────────────────
    const isHighRisk = whr > (gender === 'male' ? 0.90 : 0.85);

    // Height scaling proportion
    const heightScale = Math.max(0.85, Math.min(1.15, height / 170));

    // ── 3. Advanced Anatomical Engine v2 (Non-linear visceral deformation) ──
    // --- Inyección del Motor Biomecánico ---
    const deformation = MetabolicAnatomyEngine.getDeformation({ waist, hip, gender });

    // Mapeo a las variables de topología existentes
    const visceralCurve = deformation.xOffset;
    const hipCurve = deformation.hipFlare;

    // Variables estáticas base
    const shoulderBase = gender === 'male' ? 36 : 32;
    const pelvisBase = gender === 'female' ? 34 : 28;

    // Curvas espinales menos extremas
    const thoracicCurve = -2;
    // Integramos la compensación lumbar biomecánica
    const armThickness = gender === 'male' ? 8 : 6;
    const lumbarCurve = 3 + deformation.lumbarShift;

    // ── 4. A-POSE TOPOLOGY MATRIX (Base/Optimal) ──────────
    const basePointsRight = [
        [0, 10], [8, 12], [12, 18], [10, 28], [6, 40], [14, 45], // Head/Neck
        [shoulderBase, 50], [shoulderBase + 30, 65], // Shoulder to Elbow
        [shoulderBase + 55, 75], [shoulderBase + 55, 75 + armThickness], // Hand/Wrist
        [shoulderBase + 30, 65 + armThickness + 4], [shoulderBase - 2, 85], // Under arm to armpit

        [22, 110], // Chest
        [18, 140], [16, 165], // Waist (Thin)
        [20 + lumbarCurve, 190], [pelvisBase, 225], // Hip
        [pelvisBase - 2, 270], [16, 320], [14, 355], // Outer leg
        [10, 385], [12, 398], [4, 400], // Outer foot
        [2, 395], [4, 385], [6, 355], [8, 320], [12, 270], [4, 240], // Inner leg
        [0, 220] // Crotch
    ];

    const generatePath = (multiplier: number) => {
        const layerVisceral = visceralCurve * multiplier;
        const layerHip = hipCurve * multiplier;
        const layerArmFat = (visceralCurve + hipCurve) * 0.15 * multiplier;

        const deformedPointsRight = basePointsRight.map((p, i) => {
            // Apply targeted deformations
            if (i >= 8 && i <= 10) return [p[0], p[1] + layerArmFat]; // Under arm triceps fat
            if (i === 12) return [p[0] + layerVisceral * 0.4, p[1]]; // Chest
            if (i === 13) return [p[0] + layerVisceral * 0.8, p[1]]; // Upper waist
            if (i === 14) return [p[0] + layerVisceral, p[1]]; // Navel waist
            if (i === 15) return [p[0] + layerVisceral * 0.6, p[1]]; // Lower waist
            if (i === 16) return [p[0] + layerHip, p[1]]; // Hip peak
            if (i >= 17 && i <= 18) return [p[0] + layerHip * 0.6, p[1]]; // Upper thigh
            if (i >= 24 && i <= 25) return [p[0] + layerHip * 0.2, p[1]]; // Inner thigh fat
            return p;
        });

        const rightSide = deformedPointsRight.map(p => [100 + p[0], p[1]]);
        const leftSide = deformedPointsRight.slice().reverse().map(p => [100 - p[0], p[1]]);
        return catmullRom2bezier([...rightSide, ...leftSide], 0.75) + ' Z';
    };

    const spring = { type: 'spring' as const, stiffness: 85, damping: 18 };

    return (
        <div className="relative w-full h-full min-h-[500px] flex items-center justify-center overflow-hidden">
            {/* ━━━━━━━━━━━━━━━━━━━━━━━ VISTA CENTRAL ━━━━━━━━━━━━━━━━━━━━━━━ */}
            <motion.svg
                width="100%" height="100%"
                viewBox="-20 0 240 410"
                preserveAspectRatio="xMidYMid meet"
                className="relative z-10 w-full h-full max-w-sm mx-auto"
                transition={spring}
            >
                <defs>
                    <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#d8369b" />     {/* Cabeza Magenta */}
                        <stop offset="35%" stopColor="#75c8e6" />    {/* Pecho Azul/Cian */}
                        <stop offset="65%" stopColor="#64d8eb" />    {/* Vientre Cian brillante */}
                        <stop offset="100%" stopColor="#d8369b" />   {/* Piernas Magenta */}
                    </linearGradient>

                    {/* Generador de Ruido SVG para el borde de Grasa Irregular */}
                    <filter id="fat-blob-filter" x="-20%" y="-20%" width="140%" height="140%">
                        <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
                        <feDisplacementMap in="SourceGraphic" in2="noise" scale="12" xChannelSelector="R" yChannelSelector="G" result="displaced" />
                        <feGaussianBlur in="displaced" stdDeviation="1.5" result="smoothed" />

                        {/* Soft drop shadow to separate the blob from background */}
                        <feDropShadow dx="0" dy="5" stdDeviation="8" floodColor="#000000" floodOpacity="0.4" />
                    </filter>

                    {/* Sombra para separar el cuerpo ideal de la grasa */}
                    <filter id="inner-body-shadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#000000" floodOpacity="0.6" />
                    </filter>
                </defs>

                <motion.g
                    animate={{
                        scaleY: [heightScale, heightScale * 1.005, heightScale],
                        scaleX: [1, 1.01, 1],
                    }}
                    style={{ originX: '100px', originY: '200px' }}
                    transition={{
                        duration: 4, repeat: Infinity, ease: 'easeInOut'
                    }}
                >
                    {/* LAYER 1 (Fondo): Masa Grasa / Overweight (Outer Blob) */}
                    <motion.path
                        d={generatePath(1.0)}
                        fill="#d8369b"
                        filter="url(#fat-blob-filter)"
                        animate={{ d: generatePath(1.0) }}
                        transition={spring}
                    />

                    {/* LAYER 2 (Frente): Cuerpo Ideal/Base (Inner Core) */}
                    <motion.path
                        d={generatePath(0.0)}
                        fill="url(#bodyGradient)"
                        filter="url(#inner-body-shadow)"
                        animate={{ d: generatePath(0.0) }}
                        transition={spring}
                    />
                </motion.g>
            </motion.svg>
        </div>
    );
};

export default MorphingSilhouette;
