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

    // Crucial: Separates arms dynamically if waist/hips get wide
    const bodySpread = Math.max(0, wOffset, hOffset);
    const armShift = bodySpread * 0.85 + 5; // Adds a minimum gap of 5 to pull arms away from torso
    const shoulderShift = gender === 'male' ? 12 : 0;

    // 4. Mathematical Anatomy Engine (Right half coordinates mapping from Y=15 to Y=395)
    const pointsRight = [
        [0, 15],      // 0: Head Top
        [10, 16],     // 1
        [14, 25],     // 2: Head Upper Side
        [15, 35],     // 3: Cheek
        [11, 48],     // 4: Jaw
        [9, 58],      // 5: Neck
        [14, 65],     // 6: Traps
        [30 + shoulderShift * 0.5, 70],     // 7: Shoulder inner
        [45 + shoulderShift, 78],           // 8: Shoulder outer
        [52 + shoulderShift + armShift, 95],     // 9: Deltoid
        [54 + shoulderShift + armShift, 120],    // 10: Bicep Outer
        [55 + shoulderShift + armShift, 150],    // 11: Elbow Outer
        [57 + shoulderShift + armShift, 180],    // 12: Forearm Outer
        [54 + shoulderShift + armShift, 210],    // 13: Wrist Outer
        [56 + shoulderShift + armShift, 230],    // 14: Hand Outer
        [53 + shoulderShift + armShift, 250],    // 15: Fingers
        [49 + shoulderShift + armShift, 250],    // 16: Hand Inner
        [46 + shoulderShift + armShift, 230],    // 17: Thumb
        [45 + shoulderShift + armShift, 210],    // 18: Wrist Inner
        [46 + shoulderShift + armShift, 180],    // 19: Forearm Inner
        [43 + shoulderShift + armShift, 150],    // 20: Elbow Inner
        [41 + shoulderShift + armShift, 120],    // 21: Bicep Inner
        [37 + shoulderShift + armShift, 95],     // 22: Armpit
        [32 + shoulderShift * 0.3 + wOffset * 0.1, 105], // 23: Lat / upper Chest
        [26 + wOffset * 0.6, 130],               // 24: Mid Torso
        [20 + wOffset, 160],                     // 25: Waist
        [27 + wOffset * 0.4 + hOffset * 0.4, 185], // 26: Upper Hip
        [36 + hOffset, 210],                     // 27: Hip / Glute Outer
        [35 + hOffset * 0.7, 250],               // 28: Thigh Outer
        [24 + hOffset * 0.2, 290],               // 29: Knee Outer
        [25 + hOffset * 0.1, 330],               // 30: Calf Outer
        [16, 370],    // 31: Ankle Outer
        [20, 390],    // 32: Foot Outer
        [7, 395],     // 33: Foot Bottom
        [5, 385],     // 34: Foot Inner
        [7, 370],     // 35: Ankle Inner
        [12, 330],    // 36: Calf Inner
        [9, 290],     // 37: Knee Inner
        [13 + hOffset * 0.3, 240],    // 38: Thigh Inner
        [3, 210],     // 39: Crotch
        [0, 205]      // 40: Center Crotch
    ];

    // 5. Symmetric Mirroring Engine
    const rightSide = pointsRight.map(p => [100 + p[0], p[1]]);
    const leftSide = pointsRight.slice().reverse().map(p => [100 - p[0], p[1]]);
    const fullPoints = [...rightSide, ...leftSide];

    // 6. Generate the ultra-smooth hyper-realistic continuous path
    const morphingPath = catmullRom2bezier(fullPoints, 1) + " Z";

    // Dynamic Nodes coordinate tracking
    const rightShoulderX = 100 + 45 + shoulderShift;
    const leftShoulderX = 100 - (45 + shoulderShift);
    const rightWristX = 100 + 50 + shoulderShift + armShift;
    const leftWristX = 100 - (50 + shoulderShift + armShift);
    const rightKneeX = 100 + 17 + hOffset * 0.15;
    const leftKneeX = 100 - (17 + hOffset * 0.15);
    const rightHipX = 100 + 36 + hOffset;
    const leftHipX = 100 - (36 + hOffset);
    const waistRadius = Math.max(10, 20 + wOffset);

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
                    {/* 3D Morphing Torso Volumetric Fill */}
                    <motion.path
                        d={morphingPath}
                        fill="url(#body-glow)"
                        stroke={targetColor}
                        strokeWidth="1.5"
                        animate={{ stroke: targetColor, d: morphingPath }}
                        transition={{ type: "spring", stiffness: 80, damping: 15 }}
                    />

                    {/* 3D Morphing Torso Mesh Texture */}
                    <motion.path
                        d={morphingPath}
                        fill="url(#mesh-pattern)"
                        animate={{ d: morphingPath }}
                        transition={{ type: "spring", stiffness: 80, damping: 15 }}
                        style={{ mixBlendMode: 'screen' }}
                    />

                    {/* Anatomical Glowing Joints perfectly mapped to math engine */}
                    <g>
                        {/* Head - Forehead (Cyan) */}
                        <circle cx="100" cy="25" r="2.5" fill="#00f5d4" style={{ filter: 'drop-shadow(0 0 4px #00f5d4)' }} />

                        {/* Neck Base (Orange) */}
                        <circle cx="100" cy="65" r="2.5" fill="#ff9f1c" style={{ filter: 'drop-shadow(0 0 6px #ff9f1c)' }} />

                        {/* Shoulders (Orange) */}
                        <motion.circle cx={leftShoulderX} cy="78" r="3.5" fill="#ff9f1c" style={{ filter: 'drop-shadow(0 0 8px #ff9f1c)' }} animate={{ cx: leftShoulderX }} />
                        <motion.circle cx={rightShoulderX} cy="78" r="3.5" fill="#ff9f1c" style={{ filter: 'drop-shadow(0 0 8px #ff9f1c)' }} animate={{ cx: rightShoulderX }} />

                        {/* Chest/Sternum (Orange per spec) */}
                        <circle cx="100" cy="115" r="3" fill="#ff9f1c" style={{ filter: 'drop-shadow(0 0 6px #ff9f1c)' }} />

                        {/* Abdomen (Orange per spec) */}
                        <circle cx="100" cy="190" r="3" fill="#ff9f1c" style={{ filter: 'drop-shadow(0 0 6px #ff9f1c)' }} />

                        {/* Waist Edges and Center (Neon Cyan ring) */}
                        <motion.ellipse cx="100" cy="160" rx={waistRadius} ry="6" fill="transparent" stroke="#00f5d4" strokeWidth="2" style={{ filter: 'drop-shadow(0 0 6px #00f5d4)' }} animate={{ rx: waistRadius }} />
                        <motion.circle cx={100 - waistRadius} cy="160" r="2.5" fill="#00f5d4" style={{ filter: 'drop-shadow(0 0 6px #00f5d4)' }} animate={{ cx: 100 - waistRadius }} />
                        <motion.circle cx={100 + waistRadius} cy="160" r="2.5" fill="#00f5d4" style={{ filter: 'drop-shadow(0 0 6px #00f5d4)' }} animate={{ cx: 100 + waistRadius }} />

                        {/* Hands / Wrists (Orange) */}
                        <motion.circle cx={leftWristX} cy="210" r="3.5" fill="#ff9f1c" style={{ filter: 'drop-shadow(0 0 8px #ff9f1c)' }} animate={{ cx: leftWristX }} />
                        <motion.circle cx={rightWristX} cy="210" r="3.5" fill="#ff9f1c" style={{ filter: 'drop-shadow(0 0 8px #ff9f1c)' }} animate={{ cx: rightWristX }} />

                        {/* Hips (Orange/Gold) */}
                        <motion.circle cx={leftHipX} cy="210" r="3.5" fill="#ff9f1c" style={{ filter: 'drop-shadow(0 0 8px #ff9f1c)' }} animate={{ cx: leftHipX }} />
                        <motion.circle cx={rightHipX} cy="210" r="3.5" fill="#ff9f1c" style={{ filter: 'drop-shadow(0 0 8px #ff9f1c)' }} animate={{ cx: rightHipX }} />

                        {/* Pelvic Center (Cyan) */}
                        <motion.circle cx="100" cy="210" r="2.5" fill="#00f5d4" style={{ filter: 'drop-shadow(0 0 4px #00f5d4)' }} />

                        {/* Knees / Lower limbs (Orange/Gold) */}
                        <motion.circle cx={leftKneeX} cy="290" r="3.5" fill="#ff9f1c" style={{ filter: 'drop-shadow(0 0 8px #ff9f1c)' }} animate={{ cx: leftKneeX }} />
                        <motion.circle cx={rightKneeX} cy="290" r="3.5" fill="#ff9f1c" style={{ filter: 'drop-shadow(0 0 8px #ff9f1c)' }} animate={{ cx: rightKneeX }} />
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
