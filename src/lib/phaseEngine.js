/**
 * Richy's Phase Detection Engine
 * Based on macro liquidity framework:
 * 
 * PHASE 1 (Risk-Off): DXY >105, VIX >25, SOFR spikes, Oil rising, 
 *   Bonds selling off (10Y yield rising), TGA draining, RRP near zero
 *   → Market crash, liquidations, fear
 * 
 * PHASE 2 (Risk-On): DXY falling, TGA spending, RRP liquidity flowing,
 *   VIX declining, Oil stable/falling, Fed intervention signals
 *   → Market rallies, liquidity injection, risk appetite
 * 
 * LATERAL: Mixed signals, market waiting for catalyst
 */

// Thresholds based on Richy's framework
const THRESHOLDS = {
  dxy: { riskOff: 105, neutral: 100, riskOn: 97 },
  vix: { riskOff: 25, neutral: 18, riskOn: 14 },
  oil: { riskOff: 95, neutral: 75, riskOn: 65 },
  bond10y: { riskOff: 4.8, neutral: 4.2, riskOn: 3.8 },
  sofr: { riskOff: 5.4, neutral: 5.0, riskOn: 4.5 },
  creditSpread: { riskOff: 5.0, neutral: 3.5, riskOn: 2.5 },
  rrp: { riskOff: 50, neutral: 200, riskOn: 500 },  // in billions
  tga: { riskOff: 200, neutral: 500, riskOn: 750 },  // in billions
};

function scoreIndicator(value, thresholds, invertLogic = false) {
  if (value == null) return 0;
  const { riskOff, neutral, riskOn } = thresholds;

  let score;
  if (!invertLogic) {
    // Higher value = more risk-off (DXY, VIX, Oil, Bond10Y, SOFR, Credit Spread)
    if (value >= riskOff) score = -100;
    else if (value <= riskOn) score = 100;
    else if (value >= neutral) score = -50 * ((value - neutral) / (riskOff - neutral));
    else score = 50 * ((neutral - value) / (neutral - riskOn));
  } else {
    // Higher value = more risk-on (RRP, TGA)
    if (value >= riskOn) score = 100;
    else if (value <= riskOff) score = -100;
    else if (value >= neutral) score = 50 * ((value - neutral) / (riskOn - neutral));
    else score = -50 * ((neutral - value) / (neutral - riskOff));
  }

  return Math.max(-100, Math.min(100, score));
}

export function calculatePhaseScore(data) {
  const scores = {
    dxy: scoreIndicator(data.dxy, THRESHOLDS.dxy),
    vix: scoreIndicator(data.vix, THRESHOLDS.vix),
    oil: scoreIndicator(data.oil_wti, THRESHOLDS.oil),
    bond10y: scoreIndicator(data.bond_10y, THRESHOLDS.bond10y),
    sofr: scoreIndicator(data.sofr_rate, THRESHOLDS.sofr),
    creditSpread: scoreIndicator(data.credit_spread, THRESHOLDS.creditSpread),
    rrp: scoreIndicator(data.rrp_balance, THRESHOLDS.rrp, true),
    tga: scoreIndicator(data.tga_balance, THRESHOLDS.tga, true),
  };

  // Weighted average — VIX, DXY and Credit Spreads weighted more heavily
  const weights = {
    dxy: 1.5,
    vix: 1.5,
    oil: 1.0,
    bond10y: 1.0,
    sofr: 0.8,
    creditSpread: 1.3,
    rrp: 1.0,
    tga: 1.0,
  };

  let totalWeight = 0;
  let weightedSum = 0;
  for (const [key, weight] of Object.entries(weights)) {
    if (scores[key] !== 0 || data[key === 'oil' ? 'oil_wti' : key === 'bond10y' ? 'bond_10y' : key === 'sofr' ? 'sofr_rate' : key === 'creditSpread' ? 'credit_spread' : key === 'rrp' ? 'rrp_balance' : key === 'tga' ? 'tga_balance' : key] != null) {
      weightedSum += scores[key] * weight;
      totalWeight += weight;
    }
  }

  const phaseScore = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;

  return { phaseScore, individualScores: scores };
}

export function detectPhase(phaseScore) {
  if (phaseScore <= -40) return 'phase_1_risk_off';
  if (phaseScore >= 40) return 'phase_2_risk_on';
  return 'lateral';
}

export function getPhaseInfo(phase) {
  const phases = {
    phase_1_risk_off: {
      label: 'FASE 1 — RISK OFF',
      description: 'Energía sube, bonos venden, DXY sube, liquidaciones. Mercado en caída.',
      color: 'red',
      action: 'Guardar liquidez. Esperar crash para comprar.',
      icon: 'TrendingDown',
    },
    phase_2_risk_on: {
      label: 'FASE 2 — RISK ON',
      description: 'Fed interviene, Tesoro gasta, bajan tipos o QE encubierto. Liquidez entra.',
      color: 'emerald',
      action: 'Desplegar capital. Rotación de seguridad a riesgo.',
      icon: 'TrendingUp',
    },
    lateral: {
      label: 'LATERAL — ESPERANDO CATALIZADOR',
      description: 'Señales mixtas. Mercado esperando resolución de conflictos o cambio macro.',
      color: 'amber',
      action: 'Mantener posiciones. Monitorizar indicadores clave.',
      icon: 'Minus',
    },
    unknown: {
      label: 'SIN DATOS',
      description: 'Introduce datos macro para detectar la fase.',
      color: 'blue',
      action: 'Introduce datos en el panel.',
      icon: 'HelpCircle',
    },
  };
  return phases[phase] || phases.unknown;
}

export function calculateBTCProjection(totalLiquidity, rotationPercent = 8) {
  // Based on Richy's framework: 8% rotation from safety to risk → BTC 250k-300k
  const rotatedAmount = totalLiquidity * (rotationPercent / 100);
  // Simplified model: BTC market cap correlation
  const btcMultiplier = rotatedAmount / 0.8; // ~$800B rotation for 250k BTC
  const projectedBTC = Math.round(250000 * (btcMultiplier / 250000));
  return Math.max(projectedBTC, 0);
}

export const THRESHOLDS_CONFIG = THRESHOLDS;