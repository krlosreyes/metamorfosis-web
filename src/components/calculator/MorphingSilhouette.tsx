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
    // ── 1. Metabolic Risk Color Targeting ─────────────────────────────────
    const isHighRisk = whr > (gender === 'male' ? 0.90 : 0.85);
    const targetColor = isHighRisk ? '#F59E0B' : '#00f5d4';
    const auraColor = isHighRisk ? 'rgba(245,158,11,0.25)' : 'rgba(0,245,212,0.15)';

    // ── 2. Proportional Height Scaling ────────────────────────────────────
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
    const lumbarCurve = 3 + deformation.lumbarShift;

    // ── 4A. Matriz de Puntos FRONTALES (Maniquí con piernas separadas) ──────────
    const pointsRight = [
        [0, 10], [8, 12], [12, 18], [10, 28], [6, 40], [14, 45], [shoulderBase, 55], // Cabeza/Cuello
        [shoulderBase - 2, 80], [26 + thoracicCurve, 110], // Pecho suave
        [22 + visceralCurve * 0.4, 140], [20 + visceralCurve, 165], // Cintura
        [22 + lumbarCurve + visceralCurve * 0.2, 190], [pelvisBase + hipCurve, 225], // Cadera redondeada, no picuda
        [pelvisBase - 2 + hipCurve * 0.6, 270], [18 + hipCurve * 0.2, 320], [16 + hipCurve * 0.1, 355], // Pierna exterior suave
        [10, 385], [12, 398], [4, 400], // Pie exterior
        [2, 395], [4, 385], [6, 355], [8, 320], [12 + hipCurve * 0.1, 270], [4, 240], // Pierna interior
        [0, 220] // Entrepierna más natural
    ];

    // ── 5A. Symmetric Mirroring Engine (Front View) ────────────────────────────────────
    const rightSide = pointsRight.map(p => [100 + p[0], p[1]]);
    const leftSide = pointsRight.slice().reverse().map(p => [100 - p[0], p[1]]);
    const fullPoints = [...rightSide, ...leftSide];
    const morphingPathFront = catmullRom2bezier(fullPoints, 0.75) + ' Z';

    // ── 7A. Dynamic Nodes coordinate tracking (Front) ────────────────
    const rightShoulderX = 100 + shoulderBase;
    const leftShoulderX = 100 - shoulderBase;
    const rightHipX = 100 + pelvisBase + hipCurve;
    const leftHipX = 100 - (pelvisBase + hipCurve);
    const rightKneeX = 100 + 22 + hipCurve * 0.3;
    const leftKneeX = 100 - (22 + hipCurve * 0.3);
    const waistRadius = Math.max(12, 22 + visceralCurve);

    // ── 4B. LOGARITHMIC ASYMMETRIC PROFILE VIEW ─────────────────────────
    // --- MOTOR DE PERFIL (Curvas orgánicas y postura en S) ---
    const profilePoints = [
        // FRENTE
        [100, 10], [105, 18], [102, 28], [98, 40], [106, 75], // Cabeza y pecho frontal moderado
        [104 + visceralCurve * 1.2, 125], [102 + visceralCurve * 2.0, 165], [100 + visceralCurve * 0.5, 210], // Vientre
        [104 + hipCurve * 0.2, 265], [102, 320], [104, 365], [110, 400], [106, 405], // Pierna frontal

        // ESPALDA
        [94, 405], [90, 395], [88 - hipCurve * 0.1, 360], [94, 320], // Pie trasero y pantorrilla suave
        [86 - hipCurve * 0.3, 270], [80 - hipCurve * 1.0, 220], // Isquiotibial y Glúteo (redondeado)
        [94, 170], [88, 110], [92, 50], [90, 25], // Lumbar (menos hundido), Dorsal suave, Nuca
        [100, 10]
    ];

    // ── 5B. Path Generation (Profile) ─────────────────────────
    const morphingPathProfile = catmullRom2bezier(profilePoints, 0.75) + ' Z';

    // ── 7B. Dynamic Nodes coordinate tracking (Profile) ────────────────
    const profileBellyX = 110 + visceralCurve * 2.0;
    const profileGluteX = 75 - hipCurve * 1.2;
    const profileLumbarX = 92;

    const spring = { type: 'spring' as const, stiffness: 85, damping: 18 };

    return (
        <div className="relative w-full h-full min-h-[500px] flex flex-row items-center justify-center gap-4 overflow-hidden">
            {/* Ambient Aura central */}
            <motion.div
                className="absolute w-80 h-80 rounded-full blur-3xl opacity-25"
                animate={{ backgroundColor: auraColor, scale: [1, 1.15, 1] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* ━━━━━━━━━━━━━━━━━━━━━━━ VISTA FRONTAL ━━━━━━━━━━━━━━━━━━━━━━━ */}
            <div className="w-1/2 h-full relative">
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

                        <clipPath id="ms-clip-front">
                            <motion.path d={morphingPathFront} animate={{ d: morphingPathFront }} transition={spring} />
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

                    <motion.g
                        animate={{
                            scaleY: [heightScale, heightScale * 1.005, heightScale],
                            scaleX: [1, 1.015, 1],
                        }}
                        style={{ originX: '100px', originY: '120px' }}
                        transition={{
                            duration: 4, repeat: Infinity, ease: 'easeInOut'
                        }}
                    >
                        {/* BASE HOLOGRAPHIC GEOMETRY */}
                        <motion.path
                            d={morphingPathFront}
                            fill="url(#ms-body-fill)"
                            stroke={targetColor}
                            strokeWidth="1.2"
                            filter="url(#ms-fresnel)"
                            animate={{ d: morphingPathFront, stroke: targetColor }}
                            transition={spring}
                        />

                        {/* TEXTURED SKIN MESH */}
                        <g clipPath="url(#ms-clip-front)">
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
                            d={morphingPathFront}
                            fill="none"
                            stroke={targetColor}
                            strokeWidth="2"
                            opacity="0.3"
                            filter="url(#ms-bloom)"
                            animate={{ d: morphingPathFront, stroke: targetColor }}
                            transition={spring}
                        />

                        {/* BIOMETRIC CYAN JOINT NODES */}
                        <g>
                            <circle cx="100" cy="15" r="2.5" fill={targetColor} style={{ filter: `drop-shadow(0 0 5px ${targetColor})` }} />
                            <circle cx="100" cy="45" r="2.5" fill={targetColor} opacity="0.8" style={{ filter: `drop-shadow(0 0 5px ${targetColor})` }} />

                            <motion.circle cx={leftShoulderX} cy="55" r="3" fill={targetColor} style={{ filter: `drop-shadow(0 0 6px ${targetColor})` }} animate={{ cx: leftShoulderX }} transition={spring} />
                            <motion.circle cx={rightShoulderX} cy="55" r="3" fill={targetColor} style={{ filter: `drop-shadow(0 0 6px ${targetColor})` }} animate={{ cx: rightShoulderX }} transition={spring} />

                            <circle cx="100" cy="115" r="2.5" fill={targetColor} style={{ filter: `drop-shadow(0 0 6px ${targetColor})` }} />

                            <motion.ellipse cx="100" cy="170" rx={waistRadius} ry="4" fill="none" stroke={targetColor} strokeWidth="1.5" strokeDasharray="3 2" animate={{ rx: waistRadius, stroke: targetColor }} transition={spring} style={{ filter: `drop-shadow(0 0 6px ${targetColor})` }} />
                            <motion.circle cx={100 - waistRadius} cy="170" r="2.5" fill={targetColor} animate={{ cx: 100 - waistRadius }} transition={spring} style={{ filter: `drop-shadow(0 0 5px ${targetColor})` }} />
                            <motion.circle cx={100 + waistRadius} cy="170" r="2.5" fill={targetColor} animate={{ cx: 100 + waistRadius }} transition={spring} style={{ filter: `drop-shadow(0 0 5px ${targetColor})` }} />

                            <circle cx="100" cy="195" r="2" fill={targetColor} opacity="0.6" />

                            <motion.circle cx={leftHipX} cy="225" r="3" fill={targetColor} style={{ filter: `drop-shadow(0 0 6px ${targetColor})` }} animate={{ cx: leftHipX }} transition={spring} />
                            <motion.circle cx={rightHipX} cy="225" r="3" fill={targetColor} style={{ filter: `drop-shadow(0 0 6px ${targetColor})` }} animate={{ cx: rightHipX }} transition={spring} />

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

            {/* ━━━━━━━━━━━━━━━━━━━━━━━ VISTA LATERAL (PERFIL) ━━━━━━━━━━━━━━━━━━━━━━━ */}
            <div className="w-1/2 h-full relative">
                <motion.svg
                    width="100%" height="100%"
                    viewBox="0 0 200 410"
                    preserveAspectRatio="xMidYMid meet"
                    className="relative z-10 w-full h-full"
                    animate={{ filter: `drop-shadow(0 0 15px ${isHighRisk ? 'rgba(245,158,11,0.5)' : 'rgba(0,245,212,0.5)'})` }}
                    transition={spring}
                >
                    <defs>
                        <clipPath id="ms-clip-profile">
                            <motion.path d={morphingPathProfile} animate={{ d: morphingPathProfile }} transition={spring} />
                        </clipPath>
                    </defs>

                    <motion.g
                        animate={{
                            scaleY: [heightScale, heightScale * 1.005, heightScale],
                            scaleX: [1, 1.015, 1],
                        }}
                        style={{ originX: '100px', originY: '120px' }}
                        transition={{
                            duration: 4, repeat: Infinity, ease: 'easeInOut'
                        }}
                    >
                        {/* BASE HOLOGRAPHIC GEOMETRY */}
                        <motion.path
                            d={morphingPathProfile}
                            fill="url(#ms-body-fill)"
                            stroke={targetColor}
                            strokeWidth="1.2"
                            filter="url(#ms-fresnel)"
                            animate={{ d: morphingPathProfile, stroke: targetColor }}
                            transition={spring}
                        />

                        {/* TEXTURED SKIN MESH */}
                        <g clipPath="url(#ms-clip-profile)">
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
                            d={morphingPathProfile}
                            fill="none"
                            stroke={targetColor}
                            strokeWidth="2"
                            opacity="0.3"
                            filter="url(#ms-bloom)"
                            animate={{ d: morphingPathProfile, stroke: targetColor }}
                            transition={spring}
                        />

                        {/* BIOMETRIC JOINT NODES — PROFILE */}
                        <g>
                            {/* Head */}
                            <circle cx="100" cy="15" r="2.5" fill={targetColor} style={{ filter: `drop-shadow(0 0 5px ${targetColor})` }} />

                            {/* Visceral Risk */}
                            <motion.circle cx={profileBellyX} cy="170" r="3.5" fill="#ff9f1c" style={{ filter: 'drop-shadow(0 0 8px #ff9f1c)' }} animate={{ cx: profileBellyX }} transition={spring} />

                            {/* Subcutaneous Fat (Glute) */}
                            <motion.circle cx={profileGluteX} cy="225" r="3.5" fill={targetColor} style={{ filter: `drop-shadow(0 0 8px ${targetColor})` }} animate={{ cx: profileGluteX }} transition={spring} />

                            {/* Visceral-Lumbar Connector Line */}
                            <motion.line x1={profileLumbarX} y1="170" x2={profileBellyX} y2="170" stroke="#ff9f1c" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" animate={{ x2: profileBellyX }} transition={spring} />
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
        </div>
    );
};

export default MorphingSilhouette;
