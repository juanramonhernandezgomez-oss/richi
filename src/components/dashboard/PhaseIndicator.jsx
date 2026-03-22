import React from 'react';
import { motion } from 'framer-motion';
import { TrendingDown, TrendingUp, Minus, HelpCircle, Activity } from 'lucide-react';
import { getPhaseInfo } from '@/lib/phaseEngine';

const icons = { TrendingDown, TrendingUp, Minus, HelpCircle };

export default function PhaseIndicator({ phase, phaseScore }) {
  const info = getPhaseInfo(phase);
  const Icon = icons[info.icon] || HelpCircle;
  const colorMap = {
    red: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', glow: 'shadow-red-500/20', dot: 'bg-red-500' },
    emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', glow: 'shadow-emerald-500/20', dot: 'bg-emerald-500' },
    amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', glow: 'shadow-amber-500/20', dot: 'bg-amber-500' },
    blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', glow: 'shadow-blue-500/20', dot: 'bg-blue-500' },
  };
  const c = colorMap[info.color] || colorMap.blue;

  // Normalize score to 0-100 for gauge
  const gaugePercent = Math.round((phaseScore + 100) / 2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-2xl border ${c.border} ${c.bg} p-6 shadow-lg ${c.glow}`}
    >
      {/* Animated background pulse */}
      <div className={`absolute inset-0 ${c.bg} animate-pulse-glow opacity-30`} />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${c.dot} animate-pulse`} />
            <h2 className={`text-lg font-bold font-mono tracking-wider ${c.text}`}>
              {info.label}
            </h2>
          </div>
          <Icon className={`w-6 h-6 ${c.text}`} />
        </div>

        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          {info.description}
        </p>

        {/* Phase Score Gauge */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs font-mono text-muted-foreground mb-2">
            <span>RISK OFF</span>
            <span className="flex items-center gap-1">
              <Activity className="w-3 h-3" />
              Score: {phaseScore}
            </span>
            <span>RISK ON</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${gaugePercent}%` }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{
                background: `linear-gradient(90deg, hsl(0, 72%, 51%), hsl(38, 92%, 50%), hsl(160, 84%, 39%))`,
              }}
            />
          </div>
        </div>

        <div className={`text-xs font-medium ${c.text} bg-secondary/50 rounded-lg px-3 py-2`}>
          <span className="text-muted-foreground">Acción: </span>
          {info.action}
        </div>
      </div>
    </motion.div>
  );
}