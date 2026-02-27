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
    const size = 160;

    // Math for Gauge
    const clampedValue = Math.min(Math.max(value, min), max);
    const percent = (clampedValue - min) / (max - min);

    // Angles: -120 deg to +120 deg
    const startAngle = -120;
    const endAngle = 120;
    const angleRange = endAngle - startAngle;
    const currentAngle = startAngle + (percent * angleRange);

    const radius = size * 0.35;
    const center = size / 2;

    // Generate Ticks
    const numTicks = 10;
    const ticks = Array.from({ length: numTicks + 1 }).map((_, i) => {
        const tPercent = i / numTicks;
        const oAngle = startAngle + (tPercent * angleRange);
        const rad = (oAngle - 90) * (Math.PI / 180);

        const isMajor = i % 2 === 0;
        const tickLength = isMajor ? 12 : 6;

        const x1 = center + (radius - tickLength) * Math.cos(rad);
        const y1 = center + (radius - tickLength) * Math.sin(rad);
        const x2 = center + radius * Math.cos(rad);
        const y2 = center + radius * Math.sin(rad);

        // Text Position
        const tx = center + (radius - 22) * Math.cos(rad);
        const ty = center + (radius - 22) * Math.sin(rad);

        const tickValue = min + (tPercent * (max - min));
        const displayValue = max <= 2 ? tickValue.toFixed(1) : Math.round(tickValue);

        return { x1, y1, x2, y2, tx, ty, isMajor, displayValue };
    });

    const needleRad = (currentAngle - 90) * (Math.PI / 180);

    return (
        <div className="flex flex-col items-center justify-center relative" style={{ width: size, height: size * 0.85 }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="relative z-10 drop-shadow-xl">
                <defs>
                    <linearGradient id={`gradient-arc`} x1="0%" y1="100%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#2DD4BF" />
                        <stop offset="50%" stopColor="#2DD4BF" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="#F59E0B" />
                    </linearGradient>
                </defs>

                {/* Outer Track Arc */}
                <path
                    d={`M ${center + (radius + 5) * Math.cos((startAngle - 90) * Math.PI / 180)} ${center + (radius + 5) * Math.sin((startAngle - 90) * Math.PI / 180)} A ${radius + 5} ${radius + 5} 0 1 1 ${center + (radius + 5) * Math.cos((endAngle - 90) * Math.PI / 180)} ${center + (radius + 5) * Math.sin((endAngle - 90) * Math.PI / 180)}`}
                    fill="none"
                    stroke="rgba(30,30,40, 0.8)"
                    strokeWidth="12"
                    strokeLinecap="round"
                />

                {/* Progress Arc */}
                <path
                    d={`M ${center + radius * Math.cos((startAngle - 90) * Math.PI / 180)} ${center + radius * Math.sin((startAngle - 90) * Math.PI / 180)} A ${radius} ${radius} 0 1 1 ${center + radius * Math.cos((endAngle - 90) * Math.PI / 180)} ${center + radius * Math.sin((endAngle - 90) * Math.PI / 180)}`}
                    fill="none"
                    stroke={`url(#gradient-arc)`}
                    strokeWidth="3"
                    strokeLinecap="round"
                    className="opacity-60"
                />

                {/* Ticks and Labels */}
                {ticks.map((tick, i) => (
                    <g key={i}>
                        <line
                            x1={tick.x1} y1={tick.y1}
                            x2={tick.x2} y2={tick.y2}
                            stroke={tick.isMajor ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.3)"}
                            strokeWidth={tick.isMajor ? 2 : 1.5}
                        />
                        {tick.isMajor && (
                            <text
                                x={tick.tx} y={tick.ty}
                                fill="rgba(255,255,255,0.7)"
                                fontSize="11"
                                textAnchor="middle"
                                dominantBaseline="central"
                                className="font-sans font-medium"
                            >
                                {tick.displayValue}
                            </text>
                        )}
                    </g>
                ))}

                {/* Animated Needle Base and Line */}
                <motion.g
                    initial={{ rotate: startAngle }}
                    animate={{ rotate: currentAngle }}
                    transition={{ type: "spring", stiffness: 50, damping: 15 }}
                    style={{ originX: '50%', originY: '50%' }}
                >
                    <line
                        x1={center} y1={center}
                        x2={center} y2={center - radius + 5}
                        stroke="#2DD4BF"
                        strokeWidth="3"
                        strokeLinecap="round"
                        style={{ filter: `drop-shadow(0 0 4px #2DD4BF)` }}
                    />
                    <circle cx={center} cy={center} r="6" fill="#1E293B" stroke="#2DD4BF" strokeWidth="2" style={{ filter: `drop-shadow(0 0 2px #2DD4BF)` }} />
                    <circle cx={center} cy={center - radius + 5} r="3" fill="#2DD4BF" style={{ filter: `drop-shadow(0 0 4px #2DD4BF)` }} />
                </motion.g>
            </svg>

            <div className="absolute bottom-2 flex flex-col items-center justify-center">
                <span className="text-sm font-bold tracking-widest text-[#2DD4BF]">
                    {label}
                </span>
            </div>
        </div>
    );
};

export default RadialGauge;
