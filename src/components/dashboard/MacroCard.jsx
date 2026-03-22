import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function MacroCard({ label, value, unit, score, threshold, icon: Icon, delay = 0 }) {
  const getScoreColor = (s) => {
    if (s > 30) return { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' };
    if (s < -30) return { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' };
    return { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' };
  };

  const c = getScoreColor(score);
  const TrendIcon = score > 20 ? TrendingUp : score < -20 ? TrendingDown : Minus;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.08, duration: 0.4 }}
      className={`rounded-xl border ${c.border} ${c.bg} p-4 hover:shadow-lg transition-all duration-300`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-muted-foreground" />}
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
        </div>
        <TrendIcon className={`w-4 h-4 ${c.text}`} />
      </div>

      <div className="flex items-baseline gap-1.5 mb-2">
        <span className="text-2xl font-bold font-mono text-foreground">
          {value != null ? value : '—'}
        </span>
        {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
      </div>

      {threshold && (
        <div className="text-xs text-muted-foreground font-mono">
          <span className="text-red-400">⬆{threshold.riskOff}</span>
          <span className="mx-1.5">·</span>
          <span className="text-emerald-400">⬇{threshold.riskOn}</span>
        </div>
      )}

      {/* Score bar */}
      <div className="mt-3 h-1 bg-secondary rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.round((score + 100) / 2)}%` }}
          transition={{ delay: delay * 0.08 + 0.3, duration: 0.8 }}
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, hsl(0, 72%, 51%), hsl(38, 92%, 50%), hsl(160, 84%, 39%))`,
          }}
        />
      </div>
    </motion.div>
  );
}