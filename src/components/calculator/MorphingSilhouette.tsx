import React from 'react';
import { motion } from 'framer-motion';
import { PATH_OPTIMAL } from '../../utils/silhouettePaths';

interface MorphingSilhouetteProps {
    waist: number;
    hip: number;
    height: number;
    gender: 'male' | 'female';
    whr: number;
    weight: number;
}

const MorphingSilhouette: React.FC<MorphingSilhouetteProps> = ({ waist, hip, height, gender, whr, weight }) => {

    return (
        <div className="relative w-full h-[500px] flex items-center justify-center overflow-visible">

            {/* Telemetría (HUD) Frontal */}
            <div className="absolute left-0 top-1/4 z-40 pointer-events-none">
                <ul className="text-[#00f5d4] text-[10px] md:text-xs font-mono font-bold tracking-widest uppercase flex flex-col gap-2 opacity-80">
                    <li>› ANÁLISIS DE TEJIDO EN CAPAS</li>
                    <li>› IDENTIFICACIÓN DE FORMA BIOMÉTRICA</li>
                    <li>› PUNTO DE INICIO BIOMÉTRICO</li>
                </ul>
            </div>

            {/* CAPA BASE: Óptima (Cian) */}
            <motion.svg
                className="absolute h-full drop-shadow-[0_0_20px_rgba(0,245,212,0.4)]"
                viewBox="0 0 1024 1024"
                preserveAspectRatio="xMidYMid meet"
            >
                <path d={PATH_OPTIMAL} fill="#00f5d4" />
            </motion.svg>
        </div>
    );
};

export default MorphingSilhouette;

