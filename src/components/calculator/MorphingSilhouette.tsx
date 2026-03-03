import React from 'react';
import { motion } from 'framer-motion';
import { PATH_OPTIMAL, PATH_OVERWEIGHT, PATH_OBESE } from '../../utils/silhouettePaths';

interface MorphingSilhouetteProps {
    waist: number;
    hip: number;
    height: number;
    gender: 'male' | 'female';
    whr: number;
    weight: number;
}

const MorphingSilhouette: React.FC<MorphingSilhouetteProps> = ({ waist, hip, height, gender, whr, weight }) => {

    // Motor Metabólico: Interpolación de opacidad
    const layer2Opacity = Math.max(0, Math.min(1, (waist - 85) / 15));
    const layer3Opacity = Math.max(0, Math.min(1, (waist - 100) / 20));

    return (
        <div className="relative w-full h-[500px] flex items-center justify-center">

            {/* Telemetría (HUD) Frontal */}
            <div className="absolute left-0 top-1/4 z-40 pointer-events-none">
                <ul className="text-[#00f5d4] text-[10px] md:text-xs font-mono font-bold tracking-widest uppercase flex flex-col gap-2 opacity-80">
                    <li>› ANÁLISIS DE TEJIDO EN CAPAS</li>
                    <li>› IDENTIFICACIÓN DE FORMA BIOMÉTRICA</li>
                    <li>› PUNTO DE INICIO BIOMÉTRICO</li>
                </ul>
            </div>

            {/* CAPA 3: Riesgo Severo (Ámbar) */}
            <motion.svg className="absolute h-full drop-shadow-[0_4px_20px_rgba(255,159,28,0.4)]" viewBox="0 0 100 240" animate={{ opacity: layer3Opacity }}>
                <path d={PATH_OBESE} fill="#ff9f1c" />
            </motion.svg>

            {/* CAPA 2: Sobrepeso (Amarillo) */}
            <motion.svg className="absolute h-full drop-shadow-[0_4px_15px_rgba(255,235,59,0.3)]" viewBox="0 0 100 240" animate={{ opacity: layer2Opacity }}>
                <path d={PATH_OVERWEIGHT} fill="#ffeb3b" />
            </motion.svg>

            {/* CAPA 1: Óptima (Cian) */}
            <motion.svg className="absolute h-full drop-shadow-[0_0_25px_rgba(0,245,212,0.5)]" viewBox="0 0 100 240">
                <path d={PATH_OPTIMAL} fill="#00f5d4" />
            </motion.svg>

        </div>
    );
};

export default MorphingSilhouette;

