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
    // Determine number of ticks based on scale
    const isWHR = max <= 2;
    const numTicks = isWHR ? 8 : 8; // 0 to 0.8 has 8 intervals of 0.1? Actually 0 to 0.8 has 8 ticks. 0 to 80 has 8 ticks of 10.

    const size = 160;

    // Math for Gauge
    const clampedValue = Math.min(Math.max(value, min), max);
    const percent = (clampedValue - min) / (max - min);

    // Angles: -120 deg to +120 deg (240 degree sweep)
    const startAngle = -120;
    const endAngle = 120;
    const angleRange = endAngle - startAngle;
    const currentAngle = startAngle + (percent * angleRange);

    const radius = size * 0.4;
    const center = size / 2;

    // Generate Ticks
    const ticks = Array.from({ length: numTicks + 1 }).map((_, i) => {
        const tPercent = i / numTicks;
        const oAngle = startAngle + (tPercent * angleRange);
        const rad = (oAngle - 90) * (Math.PI / 180);

        const isMajor = true;
        const tickLength = 6;

        // Inner radius for numbers
        const textRadius = radius - 18;
        const x1 = center + radius * Math.cos(rad);
        const y1 = center + radius * Math.sin(rad);
        const x2 = center + (radius - tickLength) * Math.cos(rad);
        const y2 = center + (radius - tickLength) * Math.sin(rad);

        // Text Position
        const tx = center + textRadius * Math.cos(rad);
        const ty = center + textRadius * Math.sin(rad);

        const tickValue = min + (tPercent * (max - min));
        const displayValue = isWHR ? tickValue.toFixed(1) : Math.round(tickValue);

        return { x1, y1, x2, y2, tx, ty, isMajor, displayValue };
    });

    return (
        <div className="flex flex-col items-center justify-center relative" style={{ width: size, height: size * 0.85 }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="relative z-10 drop-shadow-2xl">
                <defs>
                    <linearGradient id={`gradient-arc`} x1="0%" y1="100%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#2DD4BF" />
                        <stop offset="50%" stopColor="#2DD4BF" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="#F59E0B" />
                    </linearGradient>
                </defs>

                {/* Dark Background Glass Circle
                <circle cx={center} cy={center} r={radius + 15} fill="#0B1120" stroke="#1f2937" strokeWidth="2" className="opacity-80" /> */}

                {/* Outer Track Arc (Background) */}
                <path
                    d={`M ${center + radius * Math.cos((startAngle - 90) * Math.PI / 180)} ${center + radius * Math.sin((startAngle - 90) * Math.PI / 180)} A ${radius} ${radius} 0 1 1 ${center + radius * Math.cos((endAngle - 90) * Math.PI / 180)} ${center + radius * Math.sin((endAngle - 90) * Math.PI / 180)}`}
                    fill="none"
                    stroke="#1E293B"
                    strokeWidth="8"
                    strokeLinecap="round"
                />

                {/* Progress Arc */}
                <path
                    d={`M ${center + radius * Math.cos((startAngle - 90) * Math.PI / 180)} ${center + radius * Math.sin((startAngle - 90) * Math.PI / 180)} A ${radius} ${radius} 0 ${percent > 0.5 ? 1 : 0} 1 ${center + radius * Math.cos((currentAngle - 90) * Math.PI / 180)} ${center + radius * Math.sin((currentAngle - 90) * Math.PI / 180)}`}
                    fill="none"
                    stroke={`url(#gradient-arc)`}
                    strokeWidth="8"
                    strokeLinecap="round"
                    className="opacity-90"
                    style={{ filter: `drop-shadow(0 0 6px ${targetColor})` }}
                />

                {/* Ticks and Labels */}
                {ticks.map((tick, i) => (
                    <g key={i}>
                        <line
                            x1={tick.x1} y1={tick.y1}
                            x2={tick.x2} y2={tick.y2}
                            stroke={"rgba(255,255,255,0.4)"}
                            strokeWidth={1.5}
                        />
                        <text
                            x={tick.tx} y={tick.ty}
                            fill="rgba(255,255,255,0.7)"
                            fontSize="11"
                            textAnchor="middle"
                            dominantBaseline="central"
                            className="font-sans font-medium tracking-tighter"
                        >
                            {tick.displayValue}
                        </text>
                    </g>
                ))}

                {/* Animated Needle Base and Line with Oscillatory Transition */}
                <motion.g
                    initial={{ rotate: startAngle }}
                    animate={{ rotate: currentAngle }}
                    transition={{
                        type: "spring",
                        stiffness: 60,
                        damping: 8,
                        mass: 0.5,
                        restDelta: 0.001
                    }}
                    style={{ originX: '50%', originY: '50%' }}
                >
                    {/* The sleek needle line */}
                    <line
                        x1={center} y1={center}
                        x2={center} y2={center - radius + 1}
                        stroke="#2DD4BF"
                        strokeWidth="3"
                        strokeLinecap="round"
                        style={{ filter: `drop-shadow(0 0 4px #2DD4BF)` }}
                    />
                    {/* The center pin */}
                    <circle cx={center} cy={center} r="6" fill="#1E293B" stroke="#2DD4BF" strokeWidth="2" style={{ filter: `drop-shadow(0 0 2px #2DD4BF)` }} />
                    <circle cx={center} cy={center - radius + 1} r="3" fill="#2DD4BF" style={{ filter: `drop-shadow(0 0 4px #2DD4BF)` }} />
                </motion.g>
            </svg>

            <div className="absolute bottom-[-10px] flex flex-col items-center justify-center">
                <span className="text-sm font-black tracking-widest text-[#2DD4BF] drop-shadow-md">
                    {label}
                </span>
            </div>
        </div>
    );
};

export default RadialGauge;
