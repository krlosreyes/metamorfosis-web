/**
 * MetabolicAnatomyEngine v1.0
 * Basado en estándares de la WHO y biomecánica de distribución de grasa.
 */
export interface AnatomicalConfig {
    waist: number;
    hip: number;
    gender: 'male' | 'female';
}

export interface PointDeformation {
    xOffset: number;
    lumbarShift: number;
    hipFlare: number;
}

export class MetabolicAnatomyEngine {
    // Constantes de referencia médica (cm)
    private static readonly BASE_WAIST_M = 84;
    private static readonly BASE_WAIST_F = 72;
    private static readonly BASE_HIP_M = 92;
    private static readonly BASE_HIP_F = 98;

    /**
     * Calcula la curva de deformación visceral no lineal.
     */
    static getDeformation(config: AnatomicalConfig): PointDeformation {
        const { waist, hip, gender } = config;
        const isMale = gender === 'male';

        // 1. Factor Visceral (Logarítmico para realismo biológico)
        const baseWaist = isMale ? this.BASE_WAIST_M : this.BASE_WAIST_F;
        const waistRatio = Math.max(waist, 50) / baseWaist;
        const visceralFactor = Math.log(waistRatio) * 22;

        // 2. Factor de Cadera (Diferenciado por género)
        const baseHip = isMale ? this.BASE_HIP_M : this.BASE_HIP_F;
        const hipRatio = Math.max(hip, 70) / baseHip;
        const hipFactor = Math.log(hipRatio) * 25;

        // 3. Compensación Lumbar (Biomecánica)
        const lumbarShift = visceralFactor * 0.4;

        return {
            xOffset: visceralFactor,
            lumbarShift: lumbarShift,
            hipFlare: hipFactor
        };
    }

    /**
     * Determina el riesgo metabólico basado en WHR
     */
    static getMetabolicRisk(waist: number, hip: number, gender: 'male' | 'female'): 'low' | 'moderate' | 'high' {
        const whr = waist / hip;
        if (gender === 'male') {
            if (whr < 0.90) return 'low';
            if (whr < 0.95) return 'moderate';
            return 'high';
        } else {
            if (whr < 0.80) return 'low';
            if (whr < 0.85) return 'moderate';
            return 'high';
        }
    }
}
