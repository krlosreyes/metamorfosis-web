import React from 'react';
import { motion } from 'framer-motion';

interface MorphingSilhouetteProps {
    waist: number;
    hip: number;
    height: number;
    gender: 'male' | 'female';
    whr: number;
}

// Organic spline generator: Catmull-Rom to Cubic Bezier
const catmullRom2bezier = (points: number[][], tension = 1) => {
    if (points.length < 3) return "";
    let d = `M ${points[0][0]} ${points[0][1]} `;
    for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[Math.max(0, i - 1)];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[Math.min(points.length - 1, i + 2)];

        const cp1x = p1[0] + (p2[0] - p0[0]) / 6 * tension;
        const cp1y = p1[1] + (p2[1] - p0[1]) / 6 * tension;

        const cp2x = p2[0] - (p3[0] - p1[0]) / 6 * tension;
        const cp2y = p2[1] - (p3[1] - p1[1]) / 6 * tension;

        d += `C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2[0]} ${p2[1]} `;
    }
    return d;
};

const MorphingSilhouette: React.FC<MorphingSilhouetteProps> = ({ waist, hip, height, gender, whr }) => {
    // 1. Metabolic Risk Logic
    const isHighVisceralFat = whr > (gender === 'male' ? 0.90 : 0.85);
    const targetColor = isHighVisceralFat ? '#ff9f1c' : '#00f5d4';
    const auraColor = isHighVisceralFat ? 'rgba(255, 159, 28, 0.4)' : 'rgba(0, 245, 212, 0.15)';

    // 2. Physical Proportion (Y Axis)
    const baseHeight = 175;
    const heightScale = Math.max(0.85, Math.min(1.15, height / baseHeight));

    // 3. Endocrine Deformation Math (X Axis)
    const wOffset = (waist * 0.45) - 27;     // Baseline waist 60
    const hOffset = (hip * 0.45) - 40.5;     // Baseline hip 90

    // Prevent arms from clipping torso
    const bodySpread = Math.max(0, wOffset, hOffset);
    const armShift = Math.max(0, bodySpread * 0.85);

    // 4. Mathematical Anatomy Engine (A-Pose Configuration based on Reference Image)
    const shoulderShift = gender === 'male' ? 5 : 0;

    const pointsRight = [
        [0, 15],       // 0: Head Top
        [10, 16],      // 1: Top Right
        [16, 25],      // 2: Head Upper Side
        [16, 35],      // 3: Cheek
        [12, 45],      // 4: Jaw
        [10, 52],      // 5: Neck
        [18, 55],      // 6: Traps
        [32, 62],      // 7: Upper Shoulder
        [43 + shoulderShift, 70],  // 8: Outer Shoulder / Deltoid
        [46 + shoulderShift + armShift * 0.5, 95], // 9: Outer Bicep
        [46 + shoulderShift + armShift * 0.7, 120], // 10: Outer Tricep/Elbow
        [45 + shoulderShift + armShift, 150], // 11: Outer Forearm High
        [48 + shoulderShift + armShift, 180], // 12: Outer Forearm Low
        [46 + shoulderShift + armShift, 200], // 13: Outer Wrist
        [48 + shoulderShift + armShift, 220], // 14: Outer Hand
        [45 + shoulderShift + armShift, 235], // 15: Fingertips
        [38 + shoulderShift + armShift, 235], // 16: Inner Fingers
        [38 + shoulderShift + armShift, 220], // 17: Inner Hand
        [39 + shoulderShift + armShift, 205], // 18: Inner Thumb/Wrist
        [40 + shoulderShift + armShift, 180], // 19: Inner Forearm Low
        [36 + shoulderShift + armShift, 150], // 20: Inner Elbow
        [35 + shoulderShift + armShift * 0.7, 120], // 21: Inner Bicep
        [33 + shoulderShift + armShift * 0.5, 95],  // 22: Armpit High
        [28 + shoulderShift * 0.5, 80],       // 23: Armpit curve
        [32 + wOffset * 0.2, 110],            // 24: Upper Lat / Ribs
        [28 + wOffset * 0.5, 135],            // 25: Mid Torso
        [22 + wOffset, 165],                // 26: Waist
        [28 + wOffset * 0.3 + hOffset * 0.3, 190], // 27: Upper Hip
        [38 + hOffset, 220],                // 28: Hip / Outer Thigh High
        [36 + hOffset * 0.8, 260],            // 29: Outer Thigh Mid
        [24 + hOffset * 0.2, 300],            // 30: Outer Knee
        [27 + hOffset * 0.1, 340],            // 31: Outer Calf
        [18, 380],                          // 32: Outer Ankle
        [22, 390],                          // 33: Outer Foot
        [8, 395],                           // 34: Foot Bottom
        [4, 385],                           // 35: Inner Foot
        [7, 375],                           // 36: Inner Ankle
        [12, 340],                          // 37: Inner Calf
        [9, 300],                           // 38: Inner Knee
        [16 + hOffset * 0.3, 260],            // 39: Inner Thigh Mid
        [12 + hOffset * 0.1, 230],            // 40: Inner Thigh High
        [3, 210],                           // 41: Crotch curve
        [0, 205]                            // 42: Center Crotch
    ];

    // 5. Symmetric Mirroring Engine
    const rightSide = pointsRight.map(p => [100 + p[0], p[1]]);
    const leftSide = pointsRight.slice().reverse().map(p => [100 - p[0], p[1]]);
    const fullPoints = [...rightSide, ...leftSide];

    // 6. Generate the ultra-smooth hyper-realistic continuous path
    const morphingPath = catmullRom2bezier(fullPoints, 1) + " Z";

    // Dynamic Nodes coordinate tracking directly mapping to new A-Pose
    const rightShoulderX = 100 + 43 + shoulderShift;
    const leftShoulderX = 100 - (43 + shoulderShift);
    const rightElbowX = 100 + 46 + shoulderShift + armShift * 0.85;
    const leftElbowX = 100 - (46 + shoulderShift + armShift * 0.85);
    const rightWristX = 100 + 46 + shoulderShift + armShift;
    const leftWristX = 100 - (46 + shoulderShift + armShift);
    const rightKneeX = 100 + 24 + hOffset * 0.2;
    const leftKneeX = 100 - (24 + hOffset * 0.2);
    const rightHipX = 100 + 38 + hOffset;
    const leftHipX = 100 - (38 + hOffset);
    const waistRadius = Math.max(10, 22 + wOffset);

    return (
        <div className="relative w-full h-full min-h-0 flex items-center justify-center pointer-events-none overflow-hidden">

            {/* Metabolic Aura */}
            <motion.div
                className="absolute w-64 h-64 rounded-full blur-3xl opacity-30"
                animate={{
                    backgroundColor: auraColor,
                    scale: [1, 1.15, 1],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Holographic Wireframe SVG */}
            <motion.svg
                width="100%"
                height="100%"
                viewBox="0 0 200 400"
                preserveAspectRatio="xMidYMid meet"
                className="relative z-10 w-full h-full"
                animate={{
                    filter: `drop-shadow(0 0 15px ${isHighVisceralFat ? 'rgba(255, 159, 28, 0.5)' : 'rgba(0, 245, 212, 0.5)'})`
                }}
                transition={{ type: "spring", stiffness: 80, damping: 15 }}
            >
                <defs>
                    <radialGradient id="body-glow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor={targetColor} stopOpacity={0.3} />
                        <stop offset="60%" stopColor={targetColor} stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#0c1f31" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#0b1e2d" stopOpacity={1} />
                    </radialGradient>

                    <pattern id="mesh-pattern" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
                        <path d="M 8 0 L 0 8 M 0 0 L 8 8" fill="none" stroke="rgba(0,245,212,0.25)" strokeWidth="0.5" />
                    </pattern>

                    {/* SVG Implementation of WebGL Fragment Shader */}
                    <filter id="hologram-shader" x="-50%" y="-50%" width="200%" height="200%">
                        {/* 1. Procedural Noise Modulation (fract(sin(dot...))) */}
                        <feTurbulence type="fractalNoise" baseFrequency="0.1" numOctaves="2" result="noise" />
                        <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0   0 0.96 0 0 0   0 0.83 0 0 0   0 0 0 0.05 0" result="coloredNoise" />

                        {/* 2. Base Hologram Soft Translucency (baseColor * 0.4) */}
                        <feComponentTransfer in="SourceGraphic" result="baseTranslucent">
                            <feFuncA type="linear" slope="0.4" />
                        </feComponentTransfer>

                        {/* 3. Fresnel Edge Glow */}
                        <feMorphology in="SourceAlpha" operator="erode" radius="0.75" result="eroded" />
                        <feComposite in="SourceAlpha" in2="eroded" operator="out" result="fresnelEdgeAlpha" />
                        <feComposite in="SourceGraphic" in2="fresnelEdgeAlpha" operator="in" result="fresnelEdge" />
                        <feGaussianBlur in="fresnelEdge" stdDeviation="1.5" result="fresnelGlow" />

                        {/* 4. Soft Volumetric Bloom */}
                        <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="bloomModerate" />
                        <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="bloomHeavy" />

                        {/* 5. Composite Final Output */}
                        <feMerge>
                            <feMergeNode in="bloomHeavy" />
                            <feMergeNode in="bloomModerate" />
                            <feMergeNode in="coloredNoise" />
                            <feMergeNode in="baseTranslucent" />
                            <feMergeNode in="fresnelGlow" />
                        </feMerge>
                    </filter>

                    <pattern id="scanlines" patternUnits="userSpaceOnUse" width="4" height="4">
                        <rect width="4" height="1" fill="#00f5d4" fillOpacity="0.2" />
                    </pattern>

                    <linearGradient id="sweep-gradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="transparent" />
                        <stop offset="50%" stopColor={targetColor} stopOpacity="0.6" />
                        <stop offset="100%" stopColor="transparent" />
                    </linearGradient>

                    <clipPath id="hologram-clip">
                        <motion.path d={morphingPath} animate={{ d: morphingPath }} transition={{ type: "spring", stiffness: 80, damping: 15 }} />
                    </clipPath>
                </defs>

                {/* Background Sonar / Targeting Grid */}
                <g className="opacity-30">
                    <circle cx="100" cy="190" r="140" fill="none" stroke="#00f5d4" strokeWidth="0.5" />
                    <circle cx="100" cy="190" r="100" fill="none" stroke="#00f5d4" strokeWidth="0.5" />
                    <circle cx="100" cy="190" r="60" fill="none" stroke="#00f5d4" strokeWidth="0.5" />
                    <line x1="0" y1="190" x2="200" y2="190" stroke="#00f5d4" strokeWidth="0.5" />
                    <line x1="100" y1="0" x2="100" y2="400" stroke="#00f5d4" strokeWidth="0.5" />
                </g>

                {/* Scaled Avatar Group */}
                <motion.g
                    animate={{ scaleY: heightScale }}
                    style={{ originX: "100px", originY: "200px" }}
                    transition={{ type: "spring", stiffness: 80, damping: 15 }}
                >
                    {/* Core Hologram Body with GLSL-equivalent Filter applied */}
                    <motion.path
                        d={morphingPath}
                        fill="url(#body-glow)"
                        stroke={targetColor}
                        strokeWidth="1.5"
                        filter="url(#hologram-shader)"
                        animate={{ stroke: targetColor, d: morphingPath }}
                        transition={{ type: "spring", stiffness: 80, damping: 15 }}
                    />

                    {/* Masked Elements strict to Body Contour */}
                    <g clipPath="url(#hologram-clip)">
                        {/* Medical Grid Scanlines */}
                        <rect x="0" y="0" width="200" height="400" fill="url(#scanlines)" style={{ mixBlendMode: 'screen' }} />

                        {/* Animated Radar Sweep */}
                        <motion.rect
                            x="0" width="200" height="40"
                            fill="url(#sweep-gradient)"
                            style={{ mixBlendMode: 'screen' }}
                            animate={{ y: [-40, 400] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        />
                    </g>

                    {/* Inner Dimensional Wireframe Mesh Texture */}
                    <motion.path
                        d={morphingPath}
                        fill="url(#mesh-pattern)"
                        animate={{ d: morphingPath }}
                        transition={{ type: "spring", stiffness: 80, damping: 15 }}
                        style={{ mixBlendMode: 'screen' }}
                        opacity={0.6}
                    />

                    {/* Anatomical Glowing Joints perfectly mapped to math engine */}
                    <g>
                        {/* Head - Forehead (Cyan) */}
                        <circle cx="100" cy="25" r="2.5" fill="#00f5d4" style={{ filter: 'drop-shadow(0 0 4px #00f5d4)' }} />

                        {/* Neck Base (Orange) */}
                        <circle cx="100" cy="65" r="2.5" fill="#ff9f1c" style={{ filter: 'drop-shadow(0 0 6px #ff9f1c)' }} />

                        {/* Shoulders (Orange) */}
                        <motion.circle cx={leftShoulderX} cy="70" r="3.5" fill="#ff9f1c" style={{ filter: 'drop-shadow(0 0 8px #ff9f1c)' }} animate={{ cx: leftShoulderX }} />
                        <motion.circle cx={rightShoulderX} cy="70" r="3.5" fill="#ff9f1c" style={{ filter: 'drop-shadow(0 0 8px #ff9f1c)' }} animate={{ cx: rightShoulderX }} />

                        {/* Chest/Sternum (Orange per spec) */}
                        <circle cx="100" cy="115" r="3" fill="#ff9f1c" style={{ filter: 'drop-shadow(0 0 6px #ff9f1c)' }} />

                        {/* Abdomen (Orange per spec) */}
                        <circle cx="100" cy="190" r="3" fill="#ff9f1c" style={{ filter: 'drop-shadow(0 0 6px #ff9f1c)' }} />

                        {/* Waist Edges and Center (Neon Cyan ring) */}
                        <motion.ellipse cx="100" cy="160" rx={waistRadius} ry="6" fill="transparent" stroke="#00f5d4" strokeWidth="2" style={{ filter: 'drop-shadow(0 0 6px #00f5d4)' }} animate={{ rx: waistRadius }} />
                        <motion.circle cx={100 - waistRadius} cy="160" r="2.5" fill="#00f5d4" style={{ filter: 'drop-shadow(0 0 6px #00f5d4)' }} animate={{ cx: 100 - waistRadius }} />
                        <motion.circle cx={100 + waistRadius} cy="160" r="2.5" fill="#00f5d4" style={{ filter: 'drop-shadow(0 0 6px #00f5d4)' }} animate={{ cx: 100 + waistRadius }} />

                        {/* Hands / Wrists (Orange) */}
                        <motion.circle cx={leftWristX} cy="205" r="3.5" fill="#ff9f1c" style={{ filter: 'drop-shadow(0 0 8px #ff9f1c)' }} animate={{ cx: leftWristX }} />
                        <motion.circle cx={rightWristX} cy="205" r="3.5" fill="#ff9f1c" style={{ filter: 'drop-shadow(0 0 8px #ff9f1c)' }} animate={{ cx: rightWristX }} />

                        {/* Hips (Orange/Gold) */}
                        <motion.circle cx={leftHipX} cy="220" r="3.5" fill="#ff9f1c" style={{ filter: 'drop-shadow(0 0 8px #ff9f1c)' }} animate={{ cx: leftHipX }} />
                        <motion.circle cx={rightHipX} cy="220" r="3.5" fill="#ff9f1c" style={{ filter: 'drop-shadow(0 0 8px #ff9f1c)' }} animate={{ cx: rightHipX }} />

                        {/* Pelvic Center (Cyan) */}
                        <motion.circle cx="100" cy="210" r="2.5" fill="#00f5d4" style={{ filter: 'drop-shadow(0 0 4px #00f5d4)' }} />

                        {/* Knees / Lower limbs (Orange/Gold) */}
                        <motion.circle cx={leftKneeX} cy="300" r="3.5" fill="#ff9f1c" style={{ filter: 'drop-shadow(0 0 8px #ff9f1c)' }} animate={{ cx: leftKneeX }} />
                        <motion.circle cx={rightKneeX} cy="300" r="3.5" fill="#ff9f1c" style={{ filter: 'drop-shadow(0 0 8px #ff9f1c)' }} animate={{ cx: rightKneeX }} />
                    </g>
                </motion.g>

                {/* Biometric Laser Scanner Loop */}
                <motion.rect
                    x="20" width="160" height="2"
                    style={{ filter: `drop-shadow(0 0 10px ${targetColor})` }}
                    animate={{
                        y: [30, 380, 30],
                        opacity: [0, 0.7, 0],
                        fill: targetColor
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                />
            </motion.svg>
        </div>
    );
};

export default MorphingSilhouette;
