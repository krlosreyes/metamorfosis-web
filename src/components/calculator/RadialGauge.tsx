import React from 'react';
import { motion } from 'framer-motion';

interface RadialGaugeProps {
    value: number;
    min: number;
    max: number;
    label: string;
    targetColor?: string; // e.g. '#2DD4BF'
    size?: number;
    strokeWidth?: number;
}

const RadialGauge: React.FC<RadialGaugeProps> = ({
    value,
    min,
    max,
    label,
    targetColor = '#2DD4BF',
    size = 120,
    strokeWidth = 6
}) => {
    // Math for the SVG Circle
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;

    // Clamp the value to prevent gauge overflow
    const clampedValue = Math.min(Math.max(value, min), max);

    // Calculate how much to "fill" the circle
    const percent = (clampedValue - min) / (max - min);
    const strokeDashoffset = circumference - percent * circumference;

    return (
        <div className="flex flex-col items-center justify-center relative" style={{ width: size, height: size }}>
            <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                className="transform -rotate-90" // Start from top
            >
                {/* Background Track Circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="transparent"
                    stroke="#1E293B" // Tailwind Slate-800
                    strokeWidth={strokeWidth}
                />

                {/* Animated Progress Circle */}
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="transparent"
                    stroke={targetColor}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    animate={{ strokeDashoffset }}
                    strokeLinecap="round" // Smooth edges
                    transition={{ type: "spring", stiffness: 60, damping: 15 }}
                    style={{ filter: `drop-shadow(0 0 4px ${targetColor})` }} // Holographic glow
                />
            </svg>

            {/* Central Metric Value */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-black text-white" style={{ textShadow: `0 0 10px ${targetColor}` }}>
                    {value.toFixed(2)}
                </span>
                <span className="text-[9px] uppercase tracking-widest text-gray-400 mt-1">
                    {label}
                </span>
            </div>
        </div>
    );
};

export default RadialGauge;
