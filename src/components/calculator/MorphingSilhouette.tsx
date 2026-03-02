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
    // Theme colors determination
    const optimalColor = '#00f5d4'; // Cyan - Baseline
    const intermediateColor = gender === 'female' ? '#ff007f' : '#3a86ff'; // Magenta / Blueish
    const riskColor = gender === 'female' ? '#ff003c' : '#fb8500'; // Deep Red / Strong Orange

    // We keep targetColor for telemetry nodes to glow
    const targetColor = isHighRisk ? '#F59E0B' : '#2DD4BF';
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

    // ── 5A. Matrices de Múltiples Capas (Frontal) ──────────────────────
    // Capa 1: Óptima (Sin curva visceral ni de cadera)
    const pointsOptimalRight = [
        [0, 10], [8, 12], [12, 18], [10, 28], [6, 40], [14, 45], [shoulderBase, 55],
        [shoulderBase - 2, 80], [26 + thoracicCurve, 110], // Pecho suave
        [22, 140], [20, 165], // Cintura sin expansión
        [22 + lumbarCurve, 190], [pelvisBase, 225], // Cadera sin expansión
        [pelvisBase - 2, 270], [18, 320], [16, 355], // Pierna sin expansión
        [10, 385], [12, 398], [4, 400],
        [2, 395], [4, 385], [6, 355], [8, 320], [12, 270], [4, 240], // GAP interior
        [0, 220]
    ];
    const rightSideOptimal = pointsOptimalRight.map(p => [100 + p[0], p[1]]);
    const leftSideOptimal = pointsOptimalRight.slice().reverse().map(p => [100 - p[0], p[1]]);
    const frontOptimal = catmullRom2bezier([...rightSideOptimal, ...leftSideOptimal], 0.75) + ' Z';

    // Capa 2: Intermedia (Mitad de la expansión actual)
    const pointsInterRight = pointsOptimalRight.map((p, i) => {
        if (i >= 9 && i <= 15) return [p[0] + pointsRight[i][0] * 0.5 - p[0] * 0.5, p[1]]; // Interpolar X
        return p;
    });
    const rightSideInter = pointsInterRight.map(p => [100 + p[0], p[1]]);
    const leftSideInter = pointsInterRight.slice().reverse().map(p => [100 - p[0], p[1]]);
    const frontInter = catmullRom2bezier([...rightSideInter, ...leftSideInter], 0.75) + ' Z';

    // Capa 3: Riesgo (Máxima expansión definida por inputs)
    const rightSideRisk = pointsRight.map(p => [100 + p[0], p[1]]);
    const leftSideRisk = pointsRight.slice().reverse().map(p => [100 - p[0], p[1]]);
    const frontRisk = catmullRom2bezier([...rightSideRisk, ...leftSideRisk], 0.75) + ' Z';

    // ── 7A. Dynamic Nodes coordinate tracking (Front) ────────────────
    const rightShoulderX = 100 + shoulderBase;
    const leftShoulderX = 100 - shoulderBase;
    const rightHipX = 100 + pelvisBase + hipCurve;
    const leftHipX = 100 - (pelvisBase + hipCurve);
    const rightKneeX = 100 + 18 + hipCurve * 0.2;
    const leftKneeX = 100 - (18 + hipCurve * 0.2);
    const waistRadius = Math.max(12, 20 + visceralCurve);

    // ── 4B. LOGARITHMIC ASYMMETRIC PROFILE VIEW ─────────────────────────
    // FRENTE (De arriba hacia abajo) -> ESPALDA (De abajo hacia arriba)
    const profilePoints = [
        [100, 10], [105, 18], [102, 28], [98, 40], [106, 75], // Cabeza y pecho
        [104 + visceralCurve * 1.2, 125], [102 + visceralCurve * 2.0, 165], [100 + visceralCurve * 0.5, 210], // Vientre
        [104 + hipCurve * 0.2, 265], [102, 320], [104, 365], [110, 400], [106, 405], // Pierna frontal

        [94, 405], [90, 395], [88 - hipCurve * 0.1, 360], [94, 320], // Pierna trasera
        [86 - hipCurve * 0.3, 270], [80 - hipCurve * 1.0, 220], // Isquiotibial y Glúteo
        [94, 170], [88, 110], [92, 50], [90, 25], // Lumbar y Dorsal
        [100, 10]
    ];

    // ── 5B. Matrices de Múltiples Capas (Perfil) ──────────────────────
    const profilePointsOptimal = [
        [100, 10], [105, 18], [102, 28], [98, 40], [106, 75], // Cabeza y pecho
        [104, 125], [102, 165], [100, 210], // Vientre plano
        [104, 265], [102, 320], [104, 365], [110, 400], [106, 405], // Pierna frontal

        [94, 405], [90, 395], [88, 360], [94, 320], // Pierna trasera
        [86, 270], [80, 220], // Glúteo plano
        [94, 170], [88, 110], [92, 50], [90, 25], // Espalda
        [100, 10]
    ];
    const profileOptimal = catmullRom2bezier(profilePointsOptimal, 0.75) + ' Z';

    const profilePointsInter = profilePointsOptimal.map((p, i) => {
        // Interpolar expansión en vientre y glúteo
        if ((i >= 5 && i <= 8) || (i >= 16 && i <= 18)) {
            return [p[0] + profilePoints[i][0] * 0.5 - p[0] * 0.5, p[1]];
        }
        return p;
    });
    const profileInter = catmullRom2bezier(profilePointsInter, 0.75) + ' Z';

    const profileRisk = catmullRom2bezier(profilePoints, 0.75) + ' Z';

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
                        {/* Layer Gradients */}
                        <radialGradient id="grad-optimal" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor={optimalColor} stopOpacity="0.4" />
                            <stop offset="100%" stopColor={optimalColor} stopOpacity="0.8" />
                        </radialGradient>

                        <radialGradient id="grad-inter" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor={optimalColor} stopOpacity="0.2" />
                            <stop offset="50%" stopColor={intermediateColor} stopOpacity="0.5" />
                            <stop offset="100%" stopColor={riskColor} stopOpacity="0.5" />
                        </radialGradient>

                        <radialGradient id="grad-risk" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor={riskColor} stopOpacity="0.1" />
                            <stop offset="70%" stopColor={riskColor} stopOpacity="0.4" />
                            <stop offset="100%" stopColor={riskColor} stopOpacity="0.7" />
                        </radialGradient>

                        <filter id="inner-shadow" x="-20%" y="-20%" width="140%" height="140%">
                            <feOffset dx="0" dy="4" />
                            <feGaussianBlur stdDeviation="5" result="offset-blur" />
                            <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse" />
                            <feFlood floodColor="black" floodOpacity="0.7" result="color" />
                            <feComposite operator="in" in="color" in2="inverse" result="shadow" />
                            <feComposite operator="over" in="shadow" in2="SourceGraphic" />
                        </filter>

                        <pattern id="ms-scanlines" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
                            <rect width="4" height="1" fill={targetColor} fillOpacity="0.1" />
                        </pattern>

                        <clipPath id="ms-clip-front">
                            <motion.path d={frontRisk} animate={{ d: frontRisk }} transition={spring} />
                        </clipPath>

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
                        {/* LAYER 3: RISK (Outer Core) */}
                        <motion.path
                            d={frontRisk}
                            fill="url(#grad-risk)"
                            stroke={riskColor}
                            strokeWidth="1"
                            animate={{ d: frontRisk, stroke: riskColor }}
                            transition={spring}
                            style={{ filter: `drop-shadow(0 0 15px ${riskColor}40)` }}
                        />

                        {/* LAYER 2: INTERMEDIATE (Middle Core) */}
                        <motion.path
                            d={frontInter}
                            fill="url(#grad-inter)"
                            stroke={intermediateColor}
                            strokeWidth="1"
                            filter="url(#inner-shadow)"
                            animate={{ d: frontInter, stroke: intermediateColor }}
                            transition={spring}
                        />

                        {/* LAYER 1: OPTIMAL (Inner biological baseline) */}
                        <motion.path
                            d={frontOptimal}
                            fill="url(#grad-optimal)"
                            stroke={optimalColor}
                            strokeWidth="1.5"
                            filter="url(#inner-shadow)"
                            animate={{ d: frontOptimal, stroke: optimalColor }}
                            transition={spring}
                            style={{ filter: `drop-shadow(0 0 10px ${optimalColor}cc)` }}
                        />

                        {/* VERTICAL HUD TEXT */}
                        <text x="100" y="200" fill="white" fontSize="11" fontWeight="900"
                            textAnchor="middle" letterSpacing="6" opacity="0.9"
                            transform="rotate(-90 100 200)" style={{ mixBlendMode: 'overlay' }}>
                            METAMORFOSIS
                        </text>

                        {/* TEXTURED MESH */}
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
                            d={frontOptimal}
                            fill="none"
                            stroke={optimalColor}
                            strokeWidth="2"
                            opacity="0.5"
                            filter="url(#ms-bloom)"
                            animate={{ d: frontOptimal, stroke: optimalColor }}
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

                        {/* LEFT HUD TECHNICAL TEXTS */}
                        <g className="opacity-80">
                            <text x="5" y="60" fill="#00f5d4" fontSize="5" fontWeight="bold" letterSpacing="1">ESCANEO METABÓLICO</text>
                            <line x1="5" y1="63" x2="35" y2="63" stroke="#00f5d4" strokeWidth="0.5" />

                            <text x="5" y="140" fill="#00f5d4" fontSize="4" letterSpacing="0.5">ANÁLISIS DE TEJIDO EN CAPAS</text>

                            <text x="5" y="220" fill="#00f5d4" fontSize="4" letterSpacing="0.5">IDENTIFICACIÓN DE FORMA</text>

                            <text x="5" y="320" fill="#00f5d4" fontSize="4" letterSpacing="0.5">PUNTO DE INICIO BIOMÉTRICO</text>
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
                            <motion.path d={profileRisk} animate={{ d: profileRisk }} transition={spring} />
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
                        {/* LAYER 3: RISK */}
                        <motion.path
                            d={profileRisk}
                            fill="url(#grad-risk)"
                            stroke={riskColor}
                            strokeWidth="1"
                            animate={{ d: profileRisk, stroke: riskColor }}
                            transition={spring}
                            style={{ filter: `drop-shadow(0 0 15px ${riskColor}40)` }}
                        />

                        {/* LAYER 2: INTERMEDIATE */}
                        <motion.path
                            d={profileInter}
                            fill="url(#grad-inter)"
                            stroke={intermediateColor}
                            strokeWidth="1"
                            filter="url(#inner-shadow)"
                            animate={{ d: profileInter, stroke: intermediateColor }}
                            transition={spring}
                        />

                        {/* LAYER 1: OPTIMAL */}
                        <motion.path
                            d={profileOptimal}
                            fill="url(#grad-optimal)"
                            stroke={optimalColor}
                            strokeWidth="1.5"
                            filter="url(#inner-shadow)"
                            animate={{ d: profileOptimal, stroke: optimalColor }}
                            transition={spring}
                            style={{ filter: `drop-shadow(0 0 10px ${optimalColor}cc)` }}
                        />

                        {/* TEXT VERTICAL */}
                        <text x="100" y="200" fill="white" fontSize="11" fontWeight="900"
                            textAnchor="middle" letterSpacing="6" opacity="0.9"
                            transform="rotate(-90 100 200)" style={{ mixBlendMode: 'overlay' }}>
                            METAMORFOSIS
                        </text>

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
                            d={profileOptimal}
                            fill="none"
                            stroke={optimalColor}
                            strokeWidth="2"
                            opacity="0.5"
                            filter="url(#ms-bloom)"
                            animate={{ d: profileOptimal, stroke: optimalColor }}
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
