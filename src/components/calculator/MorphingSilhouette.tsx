import React from 'react';
import { motion } from 'framer-motion';

interface MorphingSilhouetteProps {
    waist: number;
    hip: number;
    height: number;
    gender: 'male' | 'female';
    whr: number;
}

// Catmull-Rom → Cubic Bezier spline
const catmullRom2bezier = (pts: number[][], tension = 1): string => {
    if (pts.length < 3) return '';
    let d = `M ${pts[0][0]} ${pts[0][1]} `;
    for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[Math.max(0, i - 1)];
        const p1 = pts[i];
        const p2 = pts[i + 1];
        const p3 = pts[Math.min(pts.length - 1, i + 2)];
        const cp1x = p1[0] + (p2[0] - p0[0]) / 6 * tension;
        const cp1y = p1[1] + (p2[1] - p0[1]) / 6 * tension;
        const cp2x = p2[0] - (p3[0] - p1[0]) / 6 * tension;
        const cp2y = p2[1] - (p3[1] - p1[1]) / 6 * tension;
        d += `C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2[0]} ${p2[1]} `;
    }
    return d;
};

const MorphingSilhouette: React.FC<MorphingSilhouetteProps> = ({ waist, hip, height, gender, whr }) => {
    // ── 1. Metabolic Risk ─────────────────────────────────────────────────
    const isHighRisk = whr > (gender === 'male' ? 0.90 : 0.85);
    const targetColor = isHighRisk ? '#F59E0B' : '#2DD4BF';
    const auraColor = isHighRisk ? 'rgba(245,158,11,0.3)' : 'rgba(45,212,191,0.12)';

    // ── 2. Proportional Scaling ───────────────────────────────────────────
    const heightScale = Math.max(0.85, Math.min(1.15, height / 170));

    // ── 3. Parametric Deformation  ────────────────────────────────────────
    // Calibrated: baseline waist=70, hip=95
    const wOff = (waist - 70) * 0.35;   // ±cm from baseline
    const hOff = (hip - 95) * 0.38;

    const maleShift = gender === 'male' ? 6 : 0; // broader shoulders for male

    // ── 4. RIGHT-HALF Anatomy (viewBox: center = x=100) ───────────────────
    // Arms hang naturally at ~15° from body (A-pose)
    // X values: distance from center line (0 = center)
    const pts: number[][] = [
        // HEAD
        [0, 10],   // crown center
        [9, 12],   // top-right skull
        [14, 22],   // temple
        [13, 33],   // cheekbone
        [9, 43],   // jaw
        [7, 50],   // chin

        // NECK & SHOULDER
        [7, 56],   // neck right
        [16, 60],   // neck base
        [28 + maleShift, 65],   // medial shoulder
        [40 + maleShift, 72],   // deltoid peak

        // ARM OUTER (A-pose — arm angled ~15° outward)
        [45 + maleShift, 92],   // bicep outer high
        [48 + maleShift, 118],  // bicep outer low / elbow
        [47 + maleShift + wOff * 0.15, 148], // forearm outer high
        [49 + maleShift + wOff * 0.2, 178], // forearm outer low
        [47 + maleShift + wOff * 0.25, 204], // wrist outer
        [50 + maleShift + wOff * 0.25, 218], // hand outer knuckle
        [46 + maleShift + wOff * 0.25, 232], // fingertip

        // ARM INNER (going back up)
        [42 + maleShift + wOff * 0.25, 230], // inner fingertip
        [40 + maleShift + wOff * 0.25, 216], // inner hand
        [38 + maleShift + wOff * 0.2, 202], // inner wrist
        [37 + maleShift + wOff * 0.15, 175], // inner forearm
        [35 + maleShift, 145],  // inner elbow
        [31 + maleShift, 116],  // inner bicep
        [28 + maleShift, 98],   // armpit

        // TORSO
        [24, 118],   // pec/lat curve
        [22 + wOff * 0.2, 142], // rib cage
        [18 + wOff * 0.6, 168], // waist indent
        [22 + wOff * 0.4 + hOff * 0.3, 192], // iliac crest
        [34 + hOff, 220],        // hip max width (trochanter)

        // LEG OUTER
        [32 + hOff * 0.85, 258], // upper outer thigh
        [26 + hOff * 0.4, 298], // knee outer
        [20 + hOff * 0.1, 336], // calf peak
        [15, 372], // ankle outer
        [18, 388], // heel outer
        [8, 396], // toe

        // LEG INNER (natural gap — legs are NOT fused)
        [3, 390], // inner toe
        [4, 378], // inner heel
        [8, 366], // inner ankle
        [12, 330], // inner calf
        [10 + hOff * 0.15, 296], // inner knee
        [14 + hOff * 0.4, 258], // inner thigh mid
        [8, 228], // inner thigh high
        [3, 212], // crotch curve
        [0, 205], // center crotch
    ];

    // ── 5. Symmetric Mirror ────────────────────────────────────────────────
    const right = pts.map(p => [100 + p[0], p[1]]);
    const left = pts.slice().reverse().map(p => [100 - p[0], p[1]]);
    const full = [...right, ...left];

    const morphPath = catmullRom2bezier(full, 1) + ' Z';

    // ── 6. Dynamic Joint Positions ────────────────────────────────────────
    const rShoulderX = 100 + 40 + maleShift;
    const lShoulderX = 100 - (40 + maleShift);
    const rHipX = 100 + 34 + hOff;
    const lHipX = 100 - (34 + hOff);
    const rKneeX = 100 + 14 + hOff * 0.1;
    const lKneeX = 100 - (14 + hOff * 0.1);
    const waistRx = Math.max(12, 18 + wOff);

    const spring = { type: 'spring' as const, stiffness: 80, damping: 16 };

    return (
        <div className="relative w-full h-full min-h-0 flex items-center justify-center pointer-events-none overflow-hidden">

            {/* Metabolic Ambient Aura */}
            <motion.div
                className="absolute w-56 h-56 rounded-full blur-3xl opacity-20"
                animate={{ backgroundColor: auraColor, scale: [1, 1.12, 1] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Holographic SVG */}
            <motion.svg
                width="100%" height="100%"
                viewBox="0 0 200 410"
                preserveAspectRatio="xMidYMid meet"
                className="relative z-10 w-full h-full"
                animate={{ filter: `drop-shadow(0 0 14px ${isHighRisk ? 'rgba(245,158,11,0.45)' : 'rgba(45,212,191,0.45)'})` }}
                transition={spring}
            >
                <defs>
                    {/* Hologram body radial gradient (translucent center, bright edge) */}
                    <radialGradient id="ms-body-fill" cx="50%" cy="45%" r="55%">
                        <stop offset="0%" stopColor={targetColor} stopOpacity="0.06" />
                        <stop offset="70%" stopColor={targetColor} stopOpacity="0.12" />
                        <stop offset="100%" stopColor={targetColor} stopOpacity="0.22" />
                    </radialGradient>

                    {/* Diagonal mesh pattern */}
                    <pattern id="ms-mesh" x="0" y="0" width="7" height="7" patternUnits="userSpaceOnUse">
                        <path d="M 7 0 L 0 7 M 0 0 L 7 7" fill="none" stroke={targetColor} strokeWidth="0.35" opacity="0.35" />
                    </pattern>

                    {/* Scanlines */}
                    <pattern id="ms-scanlines" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
                        <rect width="4" height="1" fill={targetColor} fillOpacity="0.1" />
                    </pattern>

                    {/* Sweep gradient */}
                    <linearGradient id="ms-sweep" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="transparent" />
                        <stop offset="50%" stopColor={targetColor} stopOpacity="0.7" />
                        <stop offset="100%" stopColor="transparent" />
                    </linearGradient>

                    {/* Clip to silhouette body */}
                    <clipPath id="ms-clip">
                        <motion.path d={morphPath} animate={{ d: morphPath }} transition={spring} />
                    </clipPath>

                    {/* Edge glow filter (Fresnel) */}
                    <filter id="ms-fresnel" x="-30%" y="-10%" width="160%" height="120%">
                        <feMorphology in="SourceAlpha" operator="erode" radius="1" result="eroded" />
                        <feComposite in="SourceAlpha" in2="eroded" operator="out" result="edge" />
                        <feGaussianBlur in="edge" stdDeviation="2" result="glow" />
                        <feColorMatrix in="glow" type="matrix" result="coloredGlow"
                            values={isHighRisk
                                ? "0 0 0 0 0.96  0 0 0 0 0.62  0 0 0 0 0.04  0 0 0 1.5 0"
                                : "0 0 0 0 0.18  0 0 0 0 0.83  0 0 0 0 0.75  0 0 0 1.5 0"} />
                        <feMerge>
                            <feMergeNode in="coloredGlow" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>

                    {/* Volumetric bloom */}
                    <filter id="ms-bloom" x="-40%" y="-20%" width="180%" height="140%">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="b1" />
                        <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="b2" />
                        <feMerge>
                            <feMergeNode in="b2" />
                            <feMergeNode in="b1" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Height-scalable avatar group */}
                <motion.g
                    animate={{ scaleY: heightScale }}
                    style={{ originX: '100px', originY: '205px' }}
                    transition={spring}
                >
                    {/* ── BODY BASE — translucent fill + Fresnel edge ── */}
                    <motion.path
                        d={morphPath}
                        fill="url(#ms-body-fill)"
                        stroke={targetColor}
                        strokeWidth="1.2"
                        filter="url(#ms-fresnel)"
                        animate={{ d: morphPath, stroke: targetColor }}
                        transition={spring}
                    />

                    {/* ── MESH TEXTURE (clipped) ── */}
                    <g clipPath="url(#ms-clip)">
                        <rect x="0" y="0" width="200" height="410" fill="url(#ms-mesh)" style={{ mixBlendMode: 'screen' }} />
                        <rect x="0" y="0" width="200" height="410" fill="url(#ms-scanlines)" style={{ mixBlendMode: 'screen' }} />

                        {/* Animated Radar Sweep */}
                        <motion.rect
                            x="0" width="200" height="30"
                            fill="url(#ms-sweep)"
                            style={{ mixBlendMode: 'screen' }}
                            animate={{ y: [-30, 420] }}
                            transition={{ duration: 2.8, repeat: Infinity, ease: 'linear' }}
                        />
                    </g>

                    {/* ── VOLUMETRIC EDGE GLOW PATH (bloom) ── */}
                    <motion.path
                        d={morphPath}
                        fill="none"
                        stroke={targetColor}
                        strokeWidth="2.5"
                        opacity="0.25"
                        filter="url(#ms-bloom)"
                        animate={{ d: morphPath, stroke: targetColor }}
                        transition={spring}
                    />

                    {/* ── ANATOMICAL JOINT NODES ── */}
                    <g>
                        {/* Crown */}
                        <circle cx="100" cy="20" r="2" fill={targetColor} style={{ filter: `drop-shadow(0 0 4px ${targetColor})` }} />
                        {/* Neck base */}
                        <circle cx="100" cy="60" r="2" fill={targetColor} opacity="0.7" style={{ filter: `drop-shadow(0 0 4px ${targetColor})` }} />

                        {/* Shoulders */}
                        <motion.circle cx={lShoulderX} cy="70" r="3" fill="#F59E0B"
                            style={{ filter: 'drop-shadow(0 0 7px #F59E0B)' }}
                            animate={{ cx: lShoulderX }} transition={spring} />
                        <motion.circle cx={rShoulderX} cy="70" r="3" fill="#F59E0B"
                            style={{ filter: 'drop-shadow(0 0 7px #F59E0B)' }}
                            animate={{ cx: rShoulderX }} transition={spring} />

                        {/* Sternum */}
                        <circle cx="100" cy="112" r="2.5" fill={targetColor} style={{ filter: `drop-shadow(0 0 5px ${targetColor})` }} />

                        {/* Waist ring */}
                        <motion.ellipse cx="100" cy="168" rx={waistRx} ry="5"
                            fill="none" stroke={targetColor} strokeWidth="1.2" strokeDasharray="3 2"
                            animate={{ rx: waistRx, stroke: targetColor }} transition={spring}
                            style={{ filter: `drop-shadow(0 0 5px ${targetColor})` }} />
                        <motion.circle cx={100 - waistRx} cy="168" r="2.2" fill={targetColor}
                            animate={{ cx: 100 - waistRx }} transition={spring}
                            style={{ filter: `drop-shadow(0 0 5px ${targetColor})` }} />
                        <motion.circle cx={100 + waistRx} cy="168" r="2.2" fill={targetColor}
                            animate={{ cx: 100 + waistRx }} transition={spring}
                            style={{ filter: `drop-shadow(0 0 5px ${targetColor})` }} />

                        {/* Navel */}
                        <circle cx="100" cy="192" r="1.8" fill={targetColor} opacity="0.6" />

                        {/* Hips */}
                        <motion.circle cx={lHipX} cy="222" r="3" fill="#F59E0B"
                            style={{ filter: 'drop-shadow(0 0 7px #F59E0B)' }}
                            animate={{ cx: lHipX }} transition={spring} />
                        <motion.circle cx={rHipX} cy="222" r="3" fill="#F59E0B"
                            style={{ filter: 'drop-shadow(0 0 7px #F59E0B)' }}
                            animate={{ cx: rHipX }} transition={spring} />
                        {/* Pelvic center */}
                        <circle cx="100" cy="212" r="2" fill={targetColor} opacity="0.5" />

                        {/* Knees */}
                        <motion.circle cx={lKneeX} cy="298" r="3" fill="#F59E0B"
                            style={{ filter: 'drop-shadow(0 0 7px #F59E0B)' }}
                            animate={{ cx: lKneeX }} transition={spring} />
                        <motion.circle cx={rKneeX} cy="298" r="3" fill="#F59E0B"
                            style={{ filter: 'drop-shadow(0 0 7px #F59E0B)' }}
                            animate={{ cx: rKneeX }} transition={spring} />
                    </g>
                </motion.g>

                {/* ── Biometric laser scanner (outside avatar group — full viewport sweep) */}
                <motion.rect
                    x="15" width="170" height="1.5"
                    fill={targetColor}
                    style={{ filter: `drop-shadow(0 0 8px ${targetColor})` }}
                    animate={{ y: [20, 400, 20], opacity: [0, 0.8, 0] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: 'linear' }}
                />
            </motion.svg>
        </div>
    );
};

export default MorphingSilhouette;
