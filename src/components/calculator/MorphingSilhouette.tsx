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
        <div className="relative w-full h-full min-h-[500px] flex items-center justify-center">

            {/* Telemetría (HUD) Frontal */}
            <div className="absolute left-0 top-1/4 z-40 pointer-events-none">
                <ul className="text-[#00f5d4] text-[10px] md:text-xs font-mono font-bold tracking-widest uppercase flex flex-col gap-2 opacity-80">
                    <li>› ANÁLISIS DE TEJIDO EN CAPAS</li>
                    <li>› IDENTIFICACIÓN DE FORMA BIOMÉTRICA</li>
                    <li>› PUNTO DE INICIO BIOMÉTRICO</li>
                </ul>
            </div>

            {/* CAPA 3: Riesgo Severo (Fondo - Ámbar) */}
            <motion.svg className="absolute w-full h-full drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)] z-10" viewBox="0 0 2547 2547" animate={{ opacity: layer3Opacity }} transition={{ duration: 0.4 }}>
                <g transform="scale(2.4873 2.4873)">
                    <path d={PATH_OBESE} fill="#ff9f1c" />
                </g>
            </motion.svg>

            {/* CAPA 2: Grasa Moderada (Medio - Amarillo) */}
            <motion.svg className="absolute w-full h-full drop-shadow-[0_5px_15px_rgba(0,0,0,0.6)] z-20" viewBox="0 0 2127 2127" animate={{ opacity: layer2Opacity }} transition={{ duration: 0.4 }}>
                <g transform="scale(2.07715 2.07715)">
                    <path d={PATH_OVERWEIGHT} fill="#ffeb3b" />
                </g>
            </motion.svg>

            {/* CAPA 1: Base Óptima (Frente - Cian) */}
            <motion.svg className="absolute w-full h-full drop-shadow-[0_0_20px_rgba(0,245,212,0.3)] z-30" viewBox="0 0 2490 2490">
                <g transform="matrix(2.43164 0 0 2.43164 0.00012207 0)">
                    <path d={PATH_OPTIMAL} fill="#00f5d4" />
                </g>
            </motion.svg>

        </div>
    );
};

export default MorphingSilhouette;

