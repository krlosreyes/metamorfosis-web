import React from 'react';
import { motion } from 'framer-motion';

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
    // ── 1. Metabolic Risk Color Targeting ─────────────────────────────────
    const isHighRisk = whr > (gender === 'male' ? 0.90 : 0.85);
    const targetColor = isHighRisk ? '#F59E0B' : '#00f5d4';
    const auraColor = isHighRisk ? 'rgba(245,158,11,0.25)' : 'rgba(0,245,212,0.15)';

    // ── 2. Proportional Height Scaling ────────────────────────────────────
    const heightScale = Math.max(0.85, Math.min(1.15, height / 170));

    // ── 3. Advanced Anatomical Engine v2 (Non-linear visceral deformation) ──
    const visceralCurve = Math.log(Math.max(waist, 50) / 50) * 25;
    const hipCurve = Math.log(Math.max(hip, 80) / 80) * 25;

    // BMI-driven torso volume: heavier = wider chest/abdomen
    const bmi = weight / Math.pow(height / 100, 2);
    const bmiOffset = (bmi - 22) * 0.6; // neutral at BMI=22; expands for higher BMI

    const maleShift = gender === 'male' ? 5 : 0; // broader shoulders for male

    // ── 4. RIGHT-HALF Anatomy (viewBox: center = x=100) ───────────────────
    // ARMLESS, SOLID/UNIFIED LEG COLUMN (No division), LOGARITHMIC EXPANSION
    const pts: number[][] = [
        // HEAD
        [0, 12],   // crown center
        [8, 13],   // top-right skull
        [13, 23],  // temple
        [12, 33],  // cheekbone
        [8, 43],   // jaw
        [6, 50],   // chin

        // NECK & SHOULDER (Tapering directly inward, NO ARMS)
        [6, 56],   // neck right
        [14, 60],  // neck base
        [24 + maleShift, 65],   // medial shoulder
        [32 + maleShift, 70],   // deltoid peak

        // ARMLESS TORSO (Outer curve blending from shoulder to lat)
        [28 + maleShift + bmiOffset * 0.4, 85],  // outer chest (wider with BMI)
        [24 + visceralCurve * 0.1 + bmiOffset * 0.6, 110], // upper lat (BMI inflates torso)
        [20 + visceralCurve * 0.2 + bmiOffset * 0.8, 140], // lower lat / rib cage
        [16 + visceralCurve * 0.6 + bmiOffset * 0.5, 170], // natural waist indent
        [22 + visceralCurve * 0.4 + hipCurve * 0.3, 195],  // iliac crest (upper hip curve)

        // HIPS (Preserving hourglass but strictly mapped)
        [30 + hipCurve, 222],       // max hip width / trochanter

        // UNIFIED SLIM OUTER LEG (Reduced thigh volume, acts as outer bounds of a skirt/column)
        [26 + hipCurve * 0.6, 260], // upper outer thigh
        [20 + hipCurve * 0.3, 300], // outer knee
        [16 + hipCurve * 0.1, 340], // outer calf
        [12, 375], // outer ankle
        [14, 390], // outer heel
        [6, 398],  // outer toe

        // NO DIVISION - DIRECT PATH TO CENTER BOTTOM
        [0, 402],  // Base center. This ensures NO gap exists between the legs.
    ];

    // ── 5. Symmetric Mirroring Engine ────────────────────────────────────
    const rightSide = pts.map(p => [100 + p[0], p[1]]);
    const leftSide = pts.slice().reverse().map(p => [100 - p[0], p[1]]);
    const fullPoints = [...rightSide, ...leftSide];

    // ── 6. Generación del Path (Tensión spline calibrada) ─────────────────
    const morphingPath = catmullRom2bezier(fullPoints, 1) + ' Z';

    // ── 7. Dynamic Nodes coordinate tracking (Sincronizado) ────────────────
    const rightShoulderX = 100 + 30 + maleShift;
    const leftShoulderX = 100 - (30 + maleShift);
    const rightHipX = 100 + 26 + hipCurve;
    const leftHipX = 100 - (26 + hipCurve);
    // Knee markers moved slightly inwards for solid block look
    const rightKneeX = 100 + 8 + hipCurve * 0.15;
    const leftKneeX = 100 - (8 + hipCurve * 0.15);
    const waistRadius = Math.max(12, 16 + visceralCurve + bmiOffset * 0.3);

    const spring = { type: 'spring' as const, stiffness: 85, damping: 18 };

    return (
        <div className="relative w-full h-full min-h-0 flex items-center justify-center pointer-events-none overflow-hidden">

            {/* Ambient Aura */}
            <motion.div
                className="absolute w-60 h-60 rounded-full blur-3xl opacity-25"
                animate={{ backgroundColor: auraColor, scale: [1, 1.15, 1] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Holographic SVG Contained */}
            <motion.svg
                width="100%" height="100%"
                viewBox="0 0 200 410"
                preserveAspectRatio="xMidYMid meet"
                className="relative z-10 w-full h-full"
                animate={{ filter: `drop-shadow(0 0 15px ${isHighRisk ? 'rgba(245,158,11,0.5)' : 'rgba(0,245,212,0.5)'})` }}
                transition={spring}
            >
                <defs>
                    <radialGradient id="ms-body-fill" cx="50%" cy="45%" r="55%">
                        <stop offset="0%" stopColor={targetColor} stopOpacity="0.08" />
                        <stop offset="60%" stopColor={targetColor} stopOpacity="0.15" />
                        <stop offset="100%" stopColor={targetColor} stopOpacity="0.25" />
                    </radialGradient>

                    <pattern id="ms-mesh" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
                        <path d="M 6 0 L 0 6 M 0 0 L 6 6" fill="none" stroke={targetColor} strokeWidth="0.3" opacity="0.4" />
                    </pattern>

                    <pattern id="ms-scanlines" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
                        <rect width="4" height="1" fill={targetColor} fillOpacity="0.1" />
                    </pattern>

                    <linearGradient id="ms-sweep" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="transparent" />
                        <stop offset="50%" stopColor={targetColor} stopOpacity="0.6" />
                        <stop offset="100%" stopColor="transparent" />
                    </linearGradient>

                    <clipPath id="ms-clip">
                        <motion.path d={morphingPath} animate={{ d: morphingPath }} transition={spring} />
                    </clipPath>

                    {/* Advanced WebGL-like Shader: Fresnel edge glow */}
                    <filter id="ms-fresnel" x="-30%" y="-10%" width="160%" height="120%">
                        <feMorphology in="SourceAlpha" operator="erode" radius="0.8" result="eroded" />
                        <feComposite in="SourceAlpha" in2="eroded" operator="out" result="edge" />
                        <feGaussianBlur in="edge" stdDeviation="1.5" result="glow" />
                        <feColorMatrix in="glow" type="matrix" result="coloredGlow"
                            values={isHighRisk
                                ? "0 0 0 0 0.96  0 0 0 0 0.62  0 0 0 0 0.04  0 0 0 1.5 0"
                                : "0 0 0 0 0.00  0 0 0 0 0.96  0 0 0 0 0.83  0 0 0 1.5 0"}
                        />
                        <feMerge>
                            <feMergeNode in="coloredGlow" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>

                    <filter id="ms-bloom" x="-40%" y="-20%" width="180%" height="140%">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="b1" />
                        <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="b2" />
                        <feMerge>
                            <feMergeNode in="b2" />
                            <feMergeNode in="b1" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                <motion.g animate={{ scaleY: heightScale }} style={{ originX: '100px', originY: '205px' }} transition={spring}>
                    {/* BASE HOLOGRAPHIC GEOMETRY */}
                    <motion.path
                        d={morphingPath}
                        fill="url(#ms-body-fill)"
                        stroke={targetColor}
                        strokeWidth="1.2"
                        filter="url(#ms-fresnel)"
                        animate={{ d: morphingPath, stroke: targetColor }}
                        transition={spring}
                    />

                    {/* TEXTURED SKIN MESH */}
                    <g clipPath="url(#ms-clip)">
                        <rect x="0" y="0" width="200" height="410" fill="url(#ms-mesh)" style={{ mixBlendMode: 'screen' }} />
                        <rect x="0" y="0" width="200" height="410" fill="url(#ms-scanlines)" style={{ mixBlendMode: 'screen' }} />

                        {/* Animated Sweep Radar */}
                        <motion.rect
                            x="0" width="200" height="30"
                            fill="url(#ms-sweep)"
                            style={{ mixBlendMode: 'screen' }}
                            animate={{ y: [-30, 420] }}
                            transition={{ duration: 2.8, repeat: Infinity, ease: 'linear' }}
                        />
                    </g>

                    {/* BLOOM TRACING ON CONTOUR */}
                    <motion.path
                        d={morphingPath}
                        fill="none"
                        stroke={targetColor}
                        strokeWidth="2"
                        opacity="0.3"
                        filter="url(#ms-bloom)"
                        animate={{ d: morphingPath, stroke: targetColor }}
                        transition={spring}
                    />

                    {/* BIOMETRIC CYAN JOINT NODES */}
                    <g>
                        <circle cx="100" cy="20" r="2.5" fill={targetColor} style={{ filter: `drop-shadow(0 0 5px ${targetColor})` }} />
                        <circle cx="100" cy="50" r="2.5" fill={targetColor} opacity="0.8" style={{ filter: `drop-shadow(0 0 5px ${targetColor})` }} />

                        <motion.circle cx={leftShoulderX} cy="58" r="3" fill={targetColor} style={{ filter: `drop-shadow(0 0 6px ${targetColor})` }} animate={{ cx: leftShoulderX }} transition={spring} />
                        <motion.circle cx={rightShoulderX} cy="58" r="3" fill={targetColor} style={{ filter: `drop-shadow(0 0 6px ${targetColor})` }} animate={{ cx: rightShoulderX }} transition={spring} />

                        <circle cx="100" cy="105" r="2.5" fill={targetColor} style={{ filter: `drop-shadow(0 0 6px ${targetColor})` }} />

                        <motion.ellipse cx="100" cy="160" rx={waistRadius} ry="4" fill="none" stroke={targetColor} strokeWidth="1.5" strokeDasharray="3 2" animate={{ rx: waistRadius, stroke: targetColor }} transition={spring} style={{ filter: `drop-shadow(0 0 6px ${targetColor})` }} />
                        <motion.circle cx={100 - waistRadius} cy="160" r="2.5" fill={targetColor} animate={{ cx: 100 - waistRadius }} transition={spring} style={{ filter: `drop-shadow(0 0 5px ${targetColor})` }} />
                        <motion.circle cx={100 + waistRadius} cy="160" r="2.5" fill={targetColor} animate={{ cx: 100 + waistRadius }} transition={spring} style={{ filter: `drop-shadow(0 0 5px ${targetColor})` }} />

                        <circle cx="100" cy="185" r="2" fill={targetColor} opacity="0.6" />

                        <motion.circle cx={leftHipX} cy="240" r="3" fill={targetColor} style={{ filter: `drop-shadow(0 0 6px ${targetColor})` }} animate={{ cx: leftHipX }} transition={spring} />
                        <motion.circle cx={rightHipX} cy="240" r="3" fill={targetColor} style={{ filter: `drop-shadow(0 0 6px ${targetColor})` }} animate={{ cx: rightHipX }} transition={spring} />

                        <circle cx="100" cy="210" r="2.5" fill={targetColor} opacity="0.6" style={{ filter: `drop-shadow(0 0 4px ${targetColor})` }} />

                        <motion.circle cx={leftKneeX} cy="315" r="3" fill={targetColor} style={{ filter: `drop-shadow(0 0 6px ${targetColor})` }} animate={{ cx: leftKneeX }} transition={spring} />
                        <motion.circle cx={rightKneeX} cy="315" r="3" fill={targetColor} style={{ filter: `drop-shadow(0 0 6px ${targetColor})` }} animate={{ cx: rightKneeX }} transition={spring} />
                    </g>
                </motion.g>

                {/* Laser Scanner Line */}
                <motion.rect
                    x="20" width="160" height="2"
                    fill={targetColor}
                    style={{ filter: `drop-shadow(0 0 10px ${targetColor})` }}
                    animate={{ y: [20, 400, 20], opacity: [0, 0.9, 0] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: 'linear' }}
                />
            </motion.svg>
        </div>
    );
};

export default MorphingSilhouette;
