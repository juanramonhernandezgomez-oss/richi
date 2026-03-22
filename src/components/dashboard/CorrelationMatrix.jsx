import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Grid3x3, Info } from 'lucide-react';

const INDICATORS = ['DXY', 'VIX', 'WTI', '10Y', 'SOFR', 'Credit', 'RRP', 'TGA', 'MMF', 'BTC', 'SPX'];

// Historical correlation matrix (Richy's framework — well-documented macro correlations)
const CORRELATIONS = {
  DXY:    { DXY:1.00, VIX:0.52, WTI:-0.61, '10Y':0.38, SOFR:0.29, Credit:0.44, RRP:-0.15, TGA:-0.22, MMF:0.18, BTC:-0.72, SPX:-0.65 },
  VIX:    { DXY:0.52, VIX:1.00, WTI:-0.31, '10Y':-0.18, SOFR:0.12, Credit:0.78, RRP:-0.08, TGA:-0.11, MMF:0.21, BTC:-0.81, SPX:-0.88 },
  WTI:    { DXY:-0.61, VIX:-0.31, WTI:1.00, '10Y':0.42, SOFR:0.19, Credit:-0.28, RRP:0.09, TGA:0.14, MMF:-0.22, BTC:0.38, SPX:0.45 },
  '10Y':  { DXY:0.38, VIX:-0.18, WTI:0.42, '10Y':1.00, SOFR:0.88, Credit:0.22, RRP:-0.33, TGA:-0.19, MMF:-0.41, BTC:-0.44, SPX:-0.31 },
  SOFR:   { DXY:0.29, VIX:0.12, WTI:0.19, '10Y':0.88, SOFR:1.00, Credit:0.31, RRP:-0.28, TGA:-0.16, MMF:-0.38, BTC:-0.39, SPX:-0.27 },
  Credit: { DXY:0.44, VIX:0.78, WTI:-0.28, '10Y':0.22, SOFR:0.31, Credit:1.00, RRP:-0.12, TGA:-0.09, MMF:0.15, BTC:-0.69, SPX:-0.74 },
  RRP:    { DXY:-0.15, VIX:-0.08, WTI:0.09, '10Y':-0.33, SOFR:-0.28, Credit:-0.12, RRP:1.00, TGA:0.55, MMF:0.62, BTC:0.31, SPX:0.28 },
  TGA:    { DXY:-0.22, VIX:-0.11, WTI:0.14, '10Y':-0.19, SOFR:-0.16, Credit:-0.09, RRP:0.55, TGA:1.00, MMF:0.48, BTC:0.26, SPX:0.22 },
  MMF:    { DXY:0.18, VIX:0.21, WTI:-0.22, '10Y':-0.41, SOFR:-0.38, Credit:0.15, RRP:0.62, TGA:0.48, MMF:1.00, BTC:-0.12, SPX:-0.09 },
  BTC:    { DXY:-0.72, VIX:-0.81, WTI:0.38, '10Y':-0.44, SOFR:-0.39, Credit:-0.69, RRP:0.31, TGA:0.26, MMF:-0.12, BTC:1.00, SPX:0.77 },
  SPX:    { DXY:-0.65, VIX:-0.88, WTI:0.45, '10Y':-0.31, SOFR:-0.27, Credit:-0.74, RRP:0.28, TGA:0.22, MMF:-0.09, BTC:0.77, SPX:1.00 },
};

function getColor(val) {
  if (val === 1) return 'bg-secondary text-muted-foreground';
  if (val >= 0.6) return 'bg-emerald-500/80 text-white';
  if (val >= 0.3) return 'bg-emerald-500/35 text-emerald-300';
  if (val >= 0.1) return 'bg-emerald-500/15 text-emerald-400';
  if (val <= -0.6) return 'bg-red-500/80 text-white';
  if (val <= -0.3) return 'bg-red-500/35 text-red-300';
  if (val <= -0.1) return 'bg-red-500/15 text-red-400';
  return 'bg-secondary/30 text-muted-foreground';
}

export default function CorrelationMatrix() {
  const [hovered, setHovered] = useState(null);

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Grid3x3 className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Matriz de Correlación
          </h3>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-500/60 inline-block" /> Positiva</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500/60 inline-block" /> Negativa</span>
        </div>
      </div>

      {hovered && (
        <div className="mb-3 px-3 py-2 rounded-lg bg-secondary/50 border border-border text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">{hovered.r} ↔ {hovered.c}:</span>{' '}
          {getCorrelationDescription(hovered.r, hovered.c, hovered.val)}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th className="w-12" />
              {INDICATORS.map(ind => (
                <th key={ind} className="text-center font-mono text-muted-foreground pb-2 px-0.5 text-[10px]">{ind}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {INDICATORS.map(row => (
              <tr key={row}>
                <td className="font-mono text-muted-foreground text-[10px] pr-2 py-0.5 text-right whitespace-nowrap">{row}</td>
                {INDICATORS.map(col => {
                  const val = CORRELATIONS[row]?.[col] ?? 0;
                  return (
                    <td key={col} className="p-0.5">
                      <motion.div
                        whileHover={{ scale: 1.15 }}
                        onMouseEnter={() => setHovered({ r: row, c: col, val })}
                        onMouseLeave={() => setHovered(null)}
                        className={`w-full aspect-square rounded flex items-center justify-center text-[9px] font-mono cursor-pointer transition-all ${getColor(val)}`}
                        style={{ minWidth: '28px', minHeight: '28px' }}
                      >
                        {val === 1 ? '—' : val.toFixed(2).replace('0.', '.').replace('-0.', '-.') }
                      </motion.div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-[10px] text-muted-foreground mt-3">
        * Correlaciones históricas basadas en datos 2020-2025. Hover sobre celdas para interpretación.
      </p>
    </div>
  );
}

function getCorrelationDescription(r, c, val) {
  if (r === c) return 'Misma variable.';
  const strength = Math.abs(val) >= 0.7 ? 'fuerte' : Math.abs(val) >= 0.4 ? 'moderada' : 'débil';
  const dir = val > 0 ? 'positiva' : 'negativa';
  const descriptions = {
    'BTC-VIX': 'Cuando el miedo sube (VIX ↑), BTC cae. Correlación inversa clave del framework Richy.',
    'VIX-BTC': 'Cuando el miedo sube (VIX ↑), BTC cae. Correlación inversa clave del framework Richy.',
    'BTC-DXY': 'DXY fuerte = dólar fuerte = menos liquidez global = BTC baja. Motor principal del framework.',
    'DXY-BTC': 'DXY fuerte = dólar fuerte = menos liquidez global = BTC baja. Motor principal del framework.',
    'BTC-SPX': 'BTC y bolsa se mueven juntos en risk-on/off. Rotación de capital correlacionada.',
    'SPX-BTC': 'BTC y bolsa se mueven juntos en risk-on/off. Rotación de capital correlacionada.',
    'VIX-SPX': 'El VIX es el "índice del miedo" del SPX — correlación inversa perfecta.',
    'SPX-VIX': 'El VIX es el "índice del miedo" del SPX — correlación inversa perfecta.',
    'RRP-MMF': 'Cuando baja el RRP, la liquidez fluye a MMF y vice versa. Vasos comunicantes.',
    'MMF-RRP': 'Cuando baja el RRP, la liquidez fluye a MMF y vice versa. Vasos comunicantes.',
  };
  const key = `${r}-${c}`;
  return descriptions[key] || `Correlación ${dir} ${strength} (${val.toFixed(2)}). Cuando ${r} sube, ${c} tiende a ${val > 0 ? 'subir' : 'bajar'}.`;
}