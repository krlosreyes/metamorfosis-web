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
    const targetColor = isHighVisceralFat ? '#F59E0B' : '#2DD4BF';
    const auraColor = isHighVisceralFat ? 'rgba(245, 158, 11, 0.4)' : 'rgba(45, 212, 191, 0.15)';

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
        <div className="relative w-full aspect-[1/1.5] flex items-center justify-center pointer-events-none">

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
                    scaleY: heightScale,
                    filter: `drop-shadow(0 0 15px ${isHighVisceralFat ? 'rgba(245, 158, 11, 0.5)' : 'rgba(45, 212, 191, 0.5)'})`
                }}
                transition={{ type: "spring", stiffness: 80, damping: 15 }}
            >
                <defs>
                    {/* 3D Geometric Mesh Texture */}
                    <pattern id="mesh-pattern" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
                        <path d="M 8 0 L 0 8 M 0 0 L 8 8" fill="none" stroke="rgba(45,212,191,0.25)" strokeWidth="0.5" />
                    </pattern>
                </defs>

                {/* Background Sonar / Targeting Grid */}
                <g className="opacity-30">
                    <circle cx="100" cy="190" r="140" fill="none" stroke="#2DD4BF" strokeWidth="0.5" />
                    <circle cx="100" cy="190" r="100" fill="none" stroke="#2DD4BF" strokeWidth="0.5" />
                    <circle cx="100" cy="190" r="60" fill="none" stroke="#2DD4BF" strokeWidth="0.5" />
                    <line x1="0" y1="190" x2="200" y2="190" stroke="#2DD4BF" strokeWidth="0.5" />
                    <line x1="100" y1="0" x2="100" y2="400" stroke="#2DD4BF" strokeWidth="0.5" />
                </g>

                {/* Head (Proportional) */}
                <motion.circle
                    cx="100" cy="40" r="22"
                    fill={targetColor === '#F59E0B' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(45, 212, 191, 0.15)'}
                    stroke={targetColor}
                    strokeWidth="1.5"
                />
                <circle cx="100" cy="40" r="22" fill="url(#mesh-pattern)" />

                {/* 3D Morphing Torso Base Fill */}
                <motion.path
                    d={morphingPath}
                    fill={targetColor === '#F59E0B' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(45, 212, 191, 0.15)'}
                    stroke={targetColor}
                    strokeWidth="1.5"
                    animate={{ stroke: targetColor, fill: targetColor === '#F59E0B' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(45, 212, 191, 0.15)' }}
                    transition={{ type: "spring", stiffness: 80, damping: 15 }}
                />

                {/* 3D Morphing Torso Mesh Texture */}
                <motion.path
                    d={morphingPath}
                    fill="url(#mesh-pattern)"
                    animate={{ d: morphingPath }}
                    transition={{ type: "spring", stiffness: 80, damping: 15 }}
                />

                {/* Anatomical Glowing Joints (To simulate mapped 3D data points) */}
                <g>
                    {/* Head - Forehead (Cyan) */}
                    <circle cx="100" cy="25" r="2.5" fill="#2DD4BF" style={{ filter: 'drop-shadow(0 0 4px #2DD4BF)' }} />

                    {/* Neck Base (Orange) */}
                    <circle cx="100" cy="65" r="2.5" fill="#F59E0B" style={{ filter: 'drop-shadow(0 0 6px #F59E0B)' }} />

                    {/* Shoulders (Orange/Gold) */}
                    <circle cx="65" cy="80" r="3.5" fill="#F59E0B" style={{ filter: 'drop-shadow(0 0 8px #F59E0B)' }} />
                    <circle cx="135" cy="80" r="3.5" fill="#F59E0B" style={{ filter: 'drop-shadow(0 0 8px #F59E0B)' }} />

                    {/* Sternum (Cyan) */}
                    <circle cx="100" cy="115" r="2.5" fill="#2DD4BF" style={{ filter: 'drop-shadow(0 0 4px #2DD4BF)' }} />

                    {/* Belly Button / Waist Center (Cyan) */}
                    <circle cx="100" cy="170" r="2.5" fill="#2DD4BF" style={{ filter: 'drop-shadow(0 0 4px #2DD4BF)' }} />

                    {/* Waist Edges (Orange) */}
                    <motion.circle cx={100 - (wFactor / 1.5)} cy="170" r="3" fill="#F59E0B" style={{ filter: 'drop-shadow(0 0 6px #F59E0B)' }} animate={{ cx: 100 - (wFactor / 1.5) }} />
                    <motion.circle cx={100 + (wFactor / 1.5)} cy="170" r="3" fill="#F59E0B" style={{ filter: 'drop-shadow(0 0 6px #F59E0B)' }} animate={{ cx: 100 + (wFactor / 1.5) }} />

                    {/* Hands / Wrists (Orange) */}
                    <motion.circle cx={100 - (hFactor * 1.1)} cy="260" r="2.5" fill="#F59E0B" style={{ filter: 'drop-shadow(0 0 6px #F59E0B)' }} animate={{ cx: 100 - (hFactor * 1.1) }} />
                    <motion.circle cx={100 + (hFactor * 1.1)} cy="260" r="2.5" fill="#F59E0B" style={{ filter: 'drop-shadow(0 0 6px #F59E0B)' }} animate={{ cx: 100 + (hFactor * 1.1) }} />

                    {/* Hips (Orange/Gold) */}
                    <motion.circle cx={100 - (hFactor * 0.7)} cy="225" r="3.5" fill="#F59E0B" style={{ filter: 'drop-shadow(0 0 8px #F59E0B)' }} animate={{ cx: 100 - (hFactor * 0.7) }} />
                    <motion.circle cx={100 + (hFactor * 0.7)} cy="225" r="3.5" fill="#F59E0B" style={{ filter: 'drop-shadow(0 0 8px #F59E0B)' }} animate={{ cx: 100 + (hFactor * 0.7) }} />

                    {/* Pelvic Center (Cyan) */}
                    <motion.circle cx="100" cy="225" r="2.5" fill="#2DD4BF" style={{ filter: 'drop-shadow(0 0 4px #2DD4BF)' }} />

                    {/* Knees / Lower limbs (Orange/Gold) */}
                    <circle cx="85" cy="350" r="3" fill="#F59E0B" style={{ filter: 'drop-shadow(0 0 6px #F59E0B)' }} />
                    <circle cx="115" cy="350" r="3" fill="#F59E0B" style={{ filter: 'drop-shadow(0 0 6px #F59E0B)' }} />
                </g>

                {/* Biometric Laser Scanner Loop */}
                <motion.rect
                    x="20" width="160" height="2"
                    style={{ filter: `drop-shadow(0 0 10px ${targetColor})` }}
                    animate={{
                        y: [30, 380, 30],
                        opacity: [0, 0.7, 0],
                        fill: targetColor
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                />
            </motion.svg>
        </div>
    );
};

export default MorphingSilhouette;
