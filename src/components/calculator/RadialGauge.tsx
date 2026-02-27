import React from 'react';
import { motion } from 'framer-motion';

interface RadialGaugeProps {
    value: number;
    min: number;
    max: number;
    label: string;
    targetColor?: string;
}

// Helper to get arc path between two angles on a circle
const arcPath = (cx: number, cy: number, r: number, startDeg: number, endDeg: number): string => {
    const toRad = (d: number) => (d - 90) * (Math.PI / 180);
    const x1 = cx + r * Math.cos(toRad(startDeg));
    const y1 = cy + r * Math.sin(toRad(startDeg));
    const x2 = cx + r * Math.cos(toRad(endDeg));
    const y2 = cy + r * Math.sin(toRad(endDeg));
    const large = Math.abs(endDeg - startDeg) > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
};

const RadialGauge: React.FC<RadialGaugeProps> = ({
    value,
    min,
    max,
    label,
    targetColor = '#2DD4BF',
}) => {
    const isWHR = max <= 2;

    // Gauge math
    const clamped = Math.min(Math.max(value, min), max);
    const pct = (clamped - min) / (max - min);

    // Arc sweep: -130° → +130° (260° total)
    const START = -130;
    const END = 130;
    const sweep = END - START;
    const needleAngle = START + pct * sweep;

    // Compact Geometry so it doesn't clip
    const size = 160;
    const cx = size / 2;
    const cy = size / 2 + 10;
    const R = 60;
    const Rinner = R - 8;
    const Rticks = R - 16;
    const Rtext = R - 26;

    // Color zones for background arc segments
    const zones = [
        { from: 0, to: 0.4, color: '#2DD4BF' },
        { from: 0.4, to: 0.7, color: '#FBBF24' },
        { from: 0.7, to: 1.0, color: '#EF4444' },
    ];

    // Major + minor ticks
    const majorCount = 8;
    const minorCount = 32;

    return (
        <div className="w-full aspect-square max-w-[160px] mx-auto flex items-center justify-center">
            <svg
                width="100%"
                height="100%"
                viewBox={`0 0 ${size} ${size + 20}`}
                className="overflow-visible"
                style={{ filter: `drop-shadow(0 0 12px ${targetColor}40)` }}
            >
                <defs>
                    {/* Needle gradient */}
                    <linearGradient id={`needle-grad-${label}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={targetColor} />
                        <stop offset="100%" stopColor={targetColor} stopOpacity="0.2" />
                    </linearGradient>
                    {/* Glow filter */}
                    <filter id={`glow-${label}`}>
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    {/* Progress arc gradient */}
                    <linearGradient id={`arc-grad-${label}`} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#2DD4BF" />
                        <stop offset="60%" stopColor="#FBBF24" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#EF4444" />
                    </linearGradient>
                </defs>

                {/* ── Track (full arc background) ── */}
                <path
                    d={arcPath(cx, cy, R, START, END)}
                    fill="none"
                    stroke="#1E293B"
                    strokeWidth="10"
                    strokeLinecap="round"
                    opacity="0.7"
                />

                {/* ── Zone color segments on inner ring ── */}
                {zones.map((z, i) => (
                    <path
                        key={i}
                        d={arcPath(cx, cy, Rinner, START + z.from * sweep, START + z.to * sweep)}
                        fill="none"
                        stroke={z.color}
                        strokeWidth="3"
                        strokeLinecap="butt"
                        opacity="0.25"
                    />
                ))}

                {/* ── Progress arc (filled to current value) ── */}
                <motion.path
                    d={arcPath(cx, cy, R, START, needleAngle)}
                    fill="none"
                    stroke={`url(#arc-grad-${label})`}
                    strokeWidth="10"
                    strokeLinecap="round"
                    filter={`url(#glow-${label})`}
                    animate={{ d: arcPath(cx, cy, R, START, needleAngle) }}
                    transition={{ type: 'spring', stiffness: 80, damping: 18 }}
                />

                {/* ── Minor Ticks ── */}
                {Array.from({ length: minorCount + 1 }).map((_, i) => {
                    const a = START + (i / minorCount) * sweep;
                    const rad = (a - 90) * (Math.PI / 180);
                    const outer = R + 2;
                    const inner = outer - 4;
                    return (
                        <line key={i}
                            x1={cx + outer * Math.cos(rad)} y1={cy + outer * Math.sin(rad)}
                            x2={cx + inner * Math.cos(rad)} y2={cy + inner * Math.sin(rad)}
                            stroke="#334155" strokeWidth="0.8"
                        />
                    );
                })}

                {/* ── Major Ticks + Labels ── */}
                {Array.from({ length: majorCount + 1 }).map((_, i) => {
                    const tPct = i / majorCount;
                    const a = START + tPct * sweep;
                    const rad = (a - 90) * (Math.PI / 180);
                    const outer = R + 2;
                    const inner = outer - 8;
                    const tx = cx + Rtext * Math.cos(rad);
                    const ty = cy + Rtext * Math.sin(rad);
                    const v = min + tPct * (max - min);
                    const display = isWHR ? v.toFixed(1) : Math.round(v);
                    return (
                        <g key={i}>
                            <line
                                x1={cx + outer * Math.cos(rad)} y1={cy + outer * Math.sin(rad)}
                                x2={cx + inner * Math.cos(rad)} y2={cy + inner * Math.sin(rad)}
                                stroke="#475569" strokeWidth="1.5"
                            />
                            <text
                                x={tx} y={ty}
                                fill="#64748B" fontSize="9"
                                textAnchor="middle" dominantBaseline="central"
                                fontWeight="600"
                            >
                                {display}
                            </text>
                        </g>
                    );
                })}

                {/* ── Animated Needle (using reliable SVG transform rotation) ── */}
                <motion.g
                    initial={{ rotate: START }}
                    animate={{ rotate: needleAngle }}
                    transition={{ type: 'spring', stiffness: 70, damping: 10, mass: 0.4 }}
                    style={{ originX: `${cx}px`, originY: `${cy}px` }}
                >
                    {/* Needle body (tapered) */}
                    <polygon
                        points={`${cx - 2},${cy} ${cx + 2},${cy} ${cx},${cy - R + 8}`}
                        fill={`url(#needle-grad-${label})`}
                        filter={`url(#glow-${label})`}
                    />
                    {/* Needle counterweight */}
                    <polygon
                        points={`${cx - 2},${cy} ${cx + 2},${cy} ${cx},${cy + 12}`}
                        fill={targetColor} opacity="0.4"
                    />
                </motion.g>

                {/* ── Center Pivot ── */}
                <circle cx={cx} cy={cy} r="10" fill="#0B1829" stroke={targetColor} strokeWidth="2"
                    style={{ filter: `drop-shadow(0 0 6px ${targetColor})` }} />
                <circle cx={cx} cy={cy} r="4" fill={targetColor} />

                {/* ── Central Digital Readout ── */}
                <text
                    x={cx} y={cy + 32}
                    textAnchor="middle"
                    fill="#FFFFFF" fontSize="20" fontWeight="900"
                    style={{ filter: `drop-shadow(0 0 6px ${targetColor}80)` }}
                >
                    {isWHR ? clamped.toFixed(2) : Math.round(clamped)}
                </text>
                <text
                    x={cx} y={cy + 46}
                    textAnchor="middle"
                    fill={targetColor} fontSize="9" fontWeight="700"
                    letterSpacing="2"
                >
                    {label}
                </text>
            </svg>
        </div>
    );
};

export default RadialGauge;
