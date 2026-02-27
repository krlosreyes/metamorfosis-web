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
    // 1. Lógica de Riesgo Metabólico (Inflamación)
    const isHighVisceralFat = whr > (gender === 'male' ? 0.90 : 0.85);
    const targetColor = isHighVisceralFat ? '#F59E0B' : '#2DD4BF'; // Amber (Danger) vs Teal (Optimal)
    const auraColor = isHighVisceralFat ? 'rgba(245, 158, 11, 0.4)' : 'rgba(45, 212, 191, 0.15)';

    // 2. Física Proporcional (Eje Y)
    // Escalar el SVG usando el ViewBox transformado o usando motion.scale
    const baseHeight = 175;
    const heightScale = Math.max(0.85, Math.min(1.15, height / baseHeight));

    // 3. Deformación Endócrina (Eje X)
    // Representamos los cm reales en proporción de dibujo biológico
    // Cintura promedio: 80cm. Hip: 100cm.
    const wFactor = Math.max(10, waist * 0.45); // Dilatación Abdominal Visual
    const hFactor = Math.max(15, hip * 0.45);   // Caderas

    // 4. Ecuación Geométrica de SVG (Polígono Simétrico y Suave)
    // El centro del avatar está en X=100.
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

            {/* Campo de Fuerza Circular (Aura Metabólica) */}
            <motion.div
                className="absolute w-64 h-64 rounded-full blur-3xl"
                animate={{
                    backgroundColor: auraColor,
                    scale: [1, 1.15, 1],
                    opacity: isHighVisceralFat ? [0.6, 0.8, 0.6] : [0.3, 0.5, 0.3]
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Silueta Base (Holographic Wireframe) */}
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
                {/* Background Scanning Rings (Radar effect behind avatar) */}
                <g className="opacity-40">
                    <circle cx="100" cy="190" r="140" fill="none" stroke="#2DD4BF" strokeWidth="0.5" />
                    <circle cx="100" cy="190" r="100" fill="none" stroke="#2DD4BF" strokeWidth="0.5" />
                    <circle cx="100" cy="190" r="60" fill="none" stroke="#2DD4BF" strokeWidth="0.5" />
                    {/* Horizontal Axis */}
                    <line x1="0" y1="190" x2="200" y2="190" stroke="#2DD4BF" strokeWidth="0.5" />
                    {/* Vertical Axis */}
                    <line x1="100" y1="0" x2="100" y2="400" stroke="#2DD4BF" strokeWidth="0.5" />
                </g>

                {/* Cabeza (Proporcionada) */}
                <motion.circle
                    cx="100" cy="40" r="22"
                    fill={targetColor === '#F59E0B' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(45, 212, 191, 0.15)'}
                    stroke={targetColor}
                    strokeWidth="1.5"
                    animate={{ stroke: targetColor, fill: targetColor === '#F59E0B' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(45, 212, 191, 0.15)' }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                />

                {/* Torso Mutante (Wireframe Estético) */}
                <motion.path
                    d={morphingPath}
                    fill={targetColor === '#F59E0B' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(45, 212, 191, 0.15)'}
                    stroke={targetColor}
                    strokeWidth="1.5"
                    animate={{ stroke: targetColor, fill: targetColor === '#F59E0B' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(45, 212, 191, 0.15)' }}
                    transition={{ type: "spring", stiffness: 80, damping: 15 }}
                />

                {/* Anatomical Glowing Joints (To simulate 3D Mesh) */}
                <g fill="#2DD4BF" style={{ filter: `drop-shadow(0 0 6px #2DD4BF)` }}>
                    {/* Cabeza */}
                    <circle cx="100" cy="25" r="2.5" />
                    <circle cx="100" cy="55" r="2.5" />

                    {/* Hombros */}
                    <circle cx="65" cy="80" r="3" fill="#F59E0B" style={{ filter: `drop-shadow(0 0 6px #F59E0B)` }} />
                    <circle cx="135" cy="80" r="3" fill="#F59E0B" style={{ filter: `drop-shadow(0 0 6px #F59E0B)` }} />

                    {/* Pecho / Diafragma */}
                    <circle cx="75" cy="130" r="2.5" />
                    <circle cx="125" cy="130" r="2.5" />
                    <circle cx="100" cy="130" r="2.5" />

                    {/* Cintura (Animada horizontalmente, brilla si hay riesgo) */}
                    <motion.circle cx={100 - (wFactor / 2.5)} cy="180" r="3" fill={targetColor} style={{ filter: `drop-shadow(0 0 6px ${targetColor})` }} animate={{ cx: 100 - (wFactor / 2.5), fill: targetColor }} />
                    <motion.circle cx="100" cy="180" r="2.5" fill={targetColor} style={{ filter: `drop-shadow(0 0 6px ${targetColor})` }} animate={{ fill: targetColor }} />
                    <motion.circle cx={100 + (wFactor / 2.5)} cy="180" r="3" fill={targetColor} style={{ filter: `drop-shadow(0 0 6px ${targetColor})` }} animate={{ cx: 100 + (wFactor / 2.5), fill: targetColor }} />

                    {/* Cadera (Animada horizontalmente) */}
                    <motion.circle cx={100 - (hFactor / 1.5)} cy="250" r="3" fill="#F59E0B" style={{ filter: `drop-shadow(0 0 6px #F59E0B)` }} animate={{ cx: 100 - (hFactor / 1.5) }} />
                    <motion.circle cx="100" cy="250" r="3" fill={targetColor} style={{ filter: `drop-shadow(0 0 6px ${targetColor})` }} animate={{ fill: targetColor }} />
                    <motion.circle cx={100 + (hFactor / 1.5)} cy="250" r="3" fill="#F59E0B" style={{ filter: `drop-shadow(0 0 6px #F59E0B)` }} animate={{ cx: 100 + (hFactor / 1.5) }} />

                    {/* Rodillas */}
                    <motion.circle cx="75" cy="350" r="3" fill="#F59E0B" style={{ filter: `drop-shadow(0 0 6px #F59E0B)` }} />
                    <motion.circle cx="125" cy="350" r="3" fill="#F59E0B" style={{ filter: `drop-shadow(0 0 6px #F59E0B)` }} />
                </g>

                {/* Luz de Escaneo Biométrico (Biometric Radar Scanner) */}
                <motion.rect
                    x="20" width="160" height="2"
                    style={{ filter: `drop-shadow(0 0 8px ${targetColor})` }}
                    animate={{
                        y: [30, 380, 30],
                        opacity: [0, 0.8, 0],
                        fill: targetColor
                    }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
                />
            </motion.svg>
        </div>
    );
};

export default MorphingSilhouette;
