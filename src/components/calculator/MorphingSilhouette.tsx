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
                viewBox="0 0 200 400"
                preserveAspectRatio="xMidYMid meet"
                className="relative z-10 w-full h-full"
                animate={{
                    scaleY: heightScale,
                    filter: `drop-shadow(0 0 15px ${isHighVisceralFat ? 'rgba(245, 158, 11, 0.5)' : 'rgba(45, 212, 191, 0.5)'})`
                }}
                transition={{ type: "spring", stiffness: 80, damping: 15 }}
            >
                {/* Cabeza (Proporcionada) */}
                <motion.circle
                    cx="100" cy="40" r="22"
                    fill="transparent"
                    stroke={targetColor}
                    strokeWidth="1.5"
                    animate={{ stroke: targetColor }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                />

                {/* Torso Mutante (Wireframe Estético) */}
                <motion.path
                    d={morphingPath}
                    fill="transparent"
                    stroke={targetColor}
                    strokeWidth="1.5"
                    animate={{ stroke: targetColor }}
                    transition={{ type: "spring", stiffness: 80, damping: 15 }}
                />

                {/* Luz de Escaneo Biométrico (Biometric Radar Scanner) */}
                <motion.rect
                    x="20" width="160" height="2"
                    style={{ filter: `drop-shadow(0 0 8px ${targetColor})` }}
                    animate={{
                        y: [30, 380, 30],
                        opacity: [0, 0.8, 0],
                        fill: targetColor
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                />

                {/* Grid Visualizer opcional en background (Para look sci-fi) */}
                {isHighVisceralFat && (
                    <motion.circle
                        cx="100" cy="190" r={wFactor}
                        fill="none" stroke="rgba(245, 158, 11, 0.5)" strokeWidth="2" strokeDasharray="4 4"
                        animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                )}
            </motion.svg>
        </div>
    );
};

export default MorphingSilhouette;
