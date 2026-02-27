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
    // Generates a realistic human contour including Head, Neck, Arms, Torso, and Legs.
    // X-Center is 100. Y ranges from 10 (top of head) to 380 (feet).
    const morphingPath = `
        M 100 15
        C 115 15, 120 25, 120 40
        C 120 55, 110 60, 108 65
        C 115 68, 130 70, 140 75
        C 150 82, 155 100, 150 130
        C 145 160, 140 220, 142 260
        C 143 270, 135 270, 132 260
        C 130 220, 125 150, 125 120
        C 125 120, 120 130, ${100 + wFactor * 0.8} 150
        C ${100 + wFactor} 190, ${100 + wFactor} 220, ${100 + hFactor} 240
        C ${100 + hFactor} 270, ${100 + hFactor * 0.9} 310, 115 380
        L 105 380
        C 105 320, 105 290, 100 280
        C 95 290, 95 320, 95 380
        L 85 380
        C 85 380, ${100 - hFactor * 0.9} 310, ${100 - hFactor} 240
        C ${100 - hFactor} 220, ${100 - wFactor} 190, ${100 - wFactor * 0.8} 150
        C 80 130, 75 120, 75 120
        C 75 150, 70 220, 68 260
        C 65 270, 57 270, 58 260
        C 60 220, 55 160, 50 130
        C 45 100, 50 82, 60 75
        C 70 70, 85 68, 92 65
        C 90 60, 80 55, 80 40
        C 80 25, 85 15, 100 15
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
