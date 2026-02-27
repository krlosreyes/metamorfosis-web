import React from 'react';
import { motion } from 'framer-motion';

interface RadialGaugeProps {
    value: number;
    min: number;
    max: number;
    label: string;
    targetColor?: string;
}

const RadialGauge: React.FC<RadialGaugeProps> = ({
    value,
    min,
    max,
    label,
    targetColor = '#2DD4BF'
}) => {
    const isWHR = max <= 2;
    // Math for Gauge
    const clampedValue = Math.min(Math.max(value, min), max);
    const percent = (clampedValue - min) / (max - min);

    // Angles: -120 deg to +120 deg (240 degree sweep)
    const startAngle = -120;
    const endAngle = 120;
    const angleRange = endAngle - startAngle;
    const currentAngle = startAngle + (percent * angleRange);

    const size = 200; // viewBox size
    const center = size / 2;
    const radius = size * 0.42;
    const innerRadius = radius - 12;

    const numTicks = isWHR ? 8 : 8;

    // Generate Ticks
    const ticks = Array.from({ length: numTicks + 1 }).map((_, i) => {
        const tPercent = i / numTicks;
        const oAngle = startAngle + (tPercent * angleRange);
        const rad = (oAngle - 90) * (Math.PI / 180);

        const tickLength = 8;
        const textRadius = innerRadius - 16;

        // Outer dot
        const x1 = center + innerRadius * Math.cos(rad);
        const y1 = center + innerRadius * Math.sin(rad);
        const x2 = center + (innerRadius - tickLength) * Math.cos(rad);
        const y2 = center + (innerRadius - tickLength) * Math.sin(rad);

        // Text Position
        const tx = center + textRadius * Math.cos(rad);
        const ty = center + textRadius * Math.sin(rad);

        const tickValue = min + (tPercent * (max - min));
        const displayValue = isWHR ? tickValue.toFixed(1) : Math.round(tickValue);

        return { x1, y1, x2, y2, tx, ty, displayValue };
    });

    return (
        <div className="flex justify-center items-center relative w-full max-w-[180px] aspect-square mx-auto">
            <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size * 0.85}`} className="relative z-10 drop-shadow-2xl overflow-visible">
                <defs>
                    <linearGradient id={`gradient-arc-${label}`} x1="0%" y1="100%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#2DD4BF" />
                        <stop offset="50%" stopColor="#2DD4BF" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="#F59E0B" />
                    </linearGradient>
                </defs>

                {/* Outer Track Arc (Background) */}
                <path
                    d={`M ${center + radius * Math.cos((startAngle - 90) * Math.PI / 180)} ${center + radius * Math.sin((startAngle - 90) * Math.PI / 180)} A ${radius} ${radius} 0 1 1 ${center + radius * Math.cos((endAngle - 90) * Math.PI / 180)} ${center + radius * Math.sin((endAngle - 90) * Math.PI / 180)}`}
                    fill="none"
                    stroke="#1E293B"
                    strokeWidth="12"
                    strokeLinecap="round"
                    className="opacity-60"
                />

                {/* Inner Decorative Track Line */}
                <path
                    d={`M ${center + innerRadius * Math.cos((startAngle - 90) * Math.PI / 180)} ${center + innerRadius * Math.sin((startAngle - 90) * Math.PI / 180)} A ${innerRadius} ${innerRadius} 0 1 1 ${center + innerRadius * Math.cos((endAngle - 90) * Math.PI / 180)} ${center + innerRadius * Math.sin((endAngle - 90) * Math.PI / 180)}`}
                    fill="none"
                    stroke="#334155"
                    strokeWidth="1"
                    className="opacity-40"
                    strokeDasharray="4 4"
                />

                {/* Progress Arc */}
                <path
                    d={`M ${center + radius * Math.cos((startAngle - 90) * Math.PI / 180)} ${center + radius * Math.sin((startAngle - 90) * Math.PI / 180)} A ${radius} ${radius} 0 ${percent > 0.5 ? 1 : 0} 1 ${center + radius * Math.cos((currentAngle - 90) * Math.PI / 180)} ${center + radius * Math.sin((currentAngle - 90) * Math.PI / 180)}`}
                    fill="none"
                    stroke={`url(#gradient-arc-${label})`}
                    strokeWidth="12"
                    strokeLinecap="round"
                    className="opacity-90"
                    style={{ filter: `drop-shadow(0 0 8px ${targetColor})` }}
                />

                {/* Ticks and Labels */}
                {ticks.map((tick, i) => (
                    <g key={i}>
                        <line
                            x1={tick.x1} y1={tick.y1}
                            x2={tick.x2} y2={tick.y2}
                            stroke="#475569"
                            strokeWidth={2}
                        />
                        <text
                            x={tick.tx} y={tick.ty}
                            fill="#94A3B8"
                            fontSize="11"
                            textAnchor="middle"
                            dominantBaseline="central"
                            className="font-sans font-bold tracking-tighter"
                        >
                            {tick.displayValue}
                        </text>
                    </g>
                ))}

                {/* Animated Needle Group */}
                <motion.g
                    initial={{ rotate: startAngle }}
                    animate={{ rotate: currentAngle }}
                    transition={{ type: "spring", stiffness: 60, damping: 8, mass: 0.5, restDelta: 0.001 }}
                    style={{ originX: '50%', originY: '50%' }}
                >
                    {/* Sleek needle line */}
                    <line
                        x1={center} y1={center}
                        x2={center} y2={center - radius + 4}
                        stroke="#2DD4BF"
                        strokeWidth="3"
                        strokeLinecap="round"
                        style={{ filter: `drop-shadow(0 0 6px #2DD4BF)` }}
                    />
                </motion.g>

                {/* Central glowing pivot base (luxury feel) */}
                <circle cx={center} cy={center} r="10" fill="#0B1120" stroke="#2DD4BF" strokeWidth="3" style={{ filter: `drop-shadow(0 0 8px #2DD4BF)` }} />
                <circle cx={center} cy={center} r="4" fill="#2DD4BF" />

                {/* Central Value Readout */}
                <text x={center} y={center + 45} textAnchor="middle" fill="#FFFFFF" fontSize="26" fontWeight="900" style={{ filter: `drop-shadow(0 2px 4px rgba(0,0,0,0.5))` }}>
                    {isWHR ? clampedValue.toFixed(2) : Math.round(clampedValue)}
                </text>
                <text x={center} y={center + 60} textAnchor="middle" fill="#2DD4BF" fontSize="12" fontWeight="bold" letterSpacing="1" className="uppercase">
                    {label}
                </text>
            </svg>
        </div>
    );
};

export default RadialGauge;
