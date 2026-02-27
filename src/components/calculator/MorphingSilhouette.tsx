import React from 'react';
import { motion } from 'framer-motion';

interface MorphingSilhouetteProps {
    waist: number;
    hip: number;
    height: number;
    gender: 'male' | 'female';
    whr: number;
}

const MorphingSilhouette: React.FC<MorphingSilhouetteProps> = ({ waist, hip, height, gender, whr }) => {
    // 1. Metabolic Risk Logic
    const isHighVisceralFat = whr > (gender === 'male' ? 0.90 : 0.85);
    const targetColor = isHighVisceralFat ? '#ff9f1c' : '#00f5d4';
    const auraColor = isHighVisceralFat ? 'rgba(255, 159, 28, 0.4)' : 'rgba(0, 245, 212, 0.15)';

    // 2. Physical Proportion (Y Axis)
    const baseHeight = 175;
    const heightScale = Math.max(0.85, Math.min(1.15, height / baseHeight));

    // 3. Endocrine Deformation (X Axis)
    const wFactor = Math.max(10, waist * 0.45);
    const hFactor = Math.max(15, hip * 0.45);

    // 4. SVG Morphing Path
    // Generates a realistic female hourglass if waist is low, hip is high.
    const morphingPath = `
        M 100 70
        C 125 70, 145 80, 145 100
        C 145 130, ${100 + wFactor * 0.8} 150, ${100 + wFactor} 190
        C ${100 + wFactor} 220, ${100 + hFactor} 230, ${100 + hFactor} 260
        C ${100 + hFactor} 310, 120 380, 120 380
        L 105 380
        C 105 320, 105 290, 100 280
        C 95 290, 95 320, 95 380
        L 80 380
        C 80 380, ${100 - hFactor} 310, ${100 - hFactor} 260
        C ${100 - hFactor} 230, ${100 - wFactor} 220, ${100 - wFactor} 190
        C ${100 - wFactor} 150, 55 130, 55 100
        C 55 80, 75 70, 100 70
        Z
    `;

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
                    {/* Volumetric 3D Gradient */}
                    <radialGradient id="body-glow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor={targetColor} stopOpacity={0.3} />
                        <stop offset="60%" stopColor={targetColor} stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#0c1f31" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#0b1e2d" stopOpacity={1} />
                    </radialGradient>

                    {/* 3D Geometric Mesh Texture */}
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
                    {/* Head (Proportional) */}
                    <motion.circle
                        cx="100" cy="40" r="22"
                        fill="url(#body-glow)"
                        stroke={targetColor}
                        strokeWidth="1.5"
                    />
                    <circle cx="100" cy="40" r="22" fill="url(#mesh-pattern)" style={{ mixBlendMode: 'screen' }} />

                    {/* 3D Morphing Torso Volumetric Fill */}
                    <motion.path
                        d={morphingPath}
                        fill="url(#body-glow)"
                        stroke={targetColor}
                        strokeWidth="1.5"
                        animate={{ stroke: targetColor }}
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

                    {/* Anatomical Glowing Joints (To simulate mapped 3D data points) */}
                    {/* Orange glowing nodes perfectly mapped as per prompt on Shoulders, Chest (Sternum), Abdomen, Knees, Wrists. Waist is Neo Cyan. */}
                    <g>
                        {/* Head - Forehead (Cyan) */}
                        <circle cx="100" cy="25" r="2.5" fill="#00f5d4" style={{ filter: 'drop-shadow(0 0 4px #00f5d4)' }} />

                        {/* Neck Base (Orange) */}
                        <circle cx="100" cy="65" r="2.5" fill="#ff9f1c" style={{ filter: 'drop-shadow(0 0 6px #ff9f1c)' }} />

                        {/* Shoulders (Orange) */}
                        <circle cx="65" cy="80" r="3.5" fill="#ff9f1c" style={{ filter: 'drop-shadow(0 0 8px #ff9f1c)' }} />
                        <circle cx="135" cy="80" r="3.5" fill="#ff9f1c" style={{ filter: 'drop-shadow(0 0 8px #ff9f1c)' }} />

                        {/* Chest/Sternum (Orange per spec) */}
                        <circle cx="100" cy="115" r="3" fill="#ff9f1c" style={{ filter: 'drop-shadow(0 0 6px #ff9f1c)' }} />

                        {/* Abdomen (Orange per spec) */}
                        <circle cx="100" cy="190" r="3" fill="#ff9f1c" style={{ filter: 'drop-shadow(0 0 6px #ff9f1c)' }} />

                        {/* Waist Edges and Center (Neon Cyan ring) */}
                        <motion.ellipse cx="100" cy="170" rx={wFactor} ry="6" fill="transparent" stroke="#00f5d4" strokeWidth="2" style={{ filter: 'drop-shadow(0 0 6px #00f5d4)' }} />
                        <motion.circle cx={100 - wFactor} cy="170" r="2.5" fill="#00f5d4" style={{ filter: 'drop-shadow(0 0 6px #00f5d4)' }} animate={{ cx: 100 - wFactor }} />
                        <motion.circle cx={100 + wFactor} cy="170" r="2.5" fill="#00f5d4" style={{ filter: 'drop-shadow(0 0 6px #00f5d4)' }} animate={{ cx: 100 + wFactor }} />

                        {/* Hands / Wrists (Orange) */}
                        <motion.circle cx={100 - (hFactor * 1.1)} cy="260" r="3.5" fill="#ff9f1c" style={{ filter: 'drop-shadow(0 0 8px #ff9f1c)' }} animate={{ cx: 100 - (hFactor * 1.1) }} />
                        <motion.circle cx={100 + (hFactor * 1.1)} cy="260" r="3.5" fill="#ff9f1c" style={{ filter: 'drop-shadow(0 0 8px #ff9f1c)' }} animate={{ cx: 100 + (hFactor * 1.1) }} />

                        {/* Hips (Orange/Gold) */}
                        <motion.circle cx={100 - (hFactor * 0.7)} cy="225" r="3.5" fill="#ff9f1c" style={{ filter: 'drop-shadow(0 0 8px #ff9f1c)' }} animate={{ cx: 100 - (hFactor * 0.7) }} />
                        <motion.circle cx={100 + (hFactor * 0.7)} cy="225" r="3.5" fill="#ff9f1c" style={{ filter: 'drop-shadow(0 0 8px #ff9f1c)' }} animate={{ cx: 100 + (hFactor * 0.7) }} />

                        {/* Pelvic Center (Cyan) */}
                        <motion.circle cx="100" cy="225" r="2.5" fill="#00f5d4" style={{ filter: 'drop-shadow(0 0 4px #00f5d4)' }} />

                        {/* Knees / Lower limbs (Orange/Gold) */}
                        <circle cx="85" cy="350" r="3.5" fill="#ff9f1c" style={{ filter: 'drop-shadow(0 0 8px #ff9f1c)' }} />
                        <circle cx="115" cy="350" r="3.5" fill="#ff9f1c" style={{ filter: 'drop-shadow(0 0 8px #ff9f1c)' }} />
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
