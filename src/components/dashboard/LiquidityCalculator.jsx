import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, DollarSign, Bitcoin, Percent } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

export default function LiquidityCalculator({ tga, rrp, mmf }) {
  const [rotationPct, setRotationPct] = useState(8);

  // Total parked liquidity (TGA + RRP + estimated MMF excess)
  const totalParked = (tga || 0) + (rrp || 0) + ((mmf || 0) * 1000 * 0.1); // MMF in trillions, take 10% excess
  const rotatedAmount = totalParked * (rotationPct / 100);
  
  // BTC projection: based on Richy's model (8% rotation → 250-300k)
  const baseBTC = 250000;
  const baseRotation = totalParked * 0.08;
  const projectedBTC = baseRotation > 0 
    ? Math.round(baseBTC * (rotatedAmount / baseRotation))
    : 0;

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 mb-5">
        <Calculator className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Calculadora de Rotación
        </h3>
      </div>

      {/* Liquidity Sources */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="text-center p-3 rounded-lg bg-secondary/50">
          <p className="text-xs text-muted-foreground mb-1">TGA</p>
          <p className="text-sm font-bold font-mono">${tga || 0}B</p>
        </div>
        <div className="text-center p-3 rounded-lg bg-secondary/50">
          <p className="text-xs text-muted-foreground mb-1">RRP</p>
          <p className="text-sm font-bold font-mono">${rrp || 0}B</p>
        </div>
        <div className="text-center p-3 rounded-lg bg-secondary/50">
          <p className="text-xs text-muted-foreground mb-1">MMF</p>
          <p className="text-sm font-bold font-mono">${mmf || 0}T</p>
        </div>
      </div>

      {/* Rotation Slider */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Percent className="w-3 h-3" /> Rotación a riesgo
          </span>
          <span className="text-sm font-bold font-mono text-primary">{rotationPct}%</span>
        </div>
        <Slider
          value={[rotationPct]}
          onValueChange={([v]) => setRotationPct(v)}
          min={1}
          max={25}
          step={1}
          className="mt-1"
        />
      </div>

      {/* Results */}
      <div className="space-y-3">
        <motion.div
          key={rotatedAmount}
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className="flex items-center justify-between p-3 rounded-lg bg-blue-500/10 border border-blue-500/20"
        >
          <span className="text-xs text-blue-400 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5" /> Liquidez rotada
          </span>
          <span className="text-sm font-bold font-mono text-blue-400">
            ${Math.round(rotatedAmount)}B
          </span>
        </motion.div>

        <motion.div
          key={projectedBTC}
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className="flex items-center justify-between p-3 rounded-lg bg-amber-500/10 border border-amber-500/20"
        >
          <span className="text-xs text-amber-400 flex items-center gap-1.5">
            <Bitcoin className="w-3.5 h-3.5" /> BTC Proyectado
          </span>
          <span className="text-lg font-bold font-mono text-amber-400">
            ${projectedBTC.toLocaleString()}
          </span>
        </motion.div>
      </div>
    </div>
  );
}