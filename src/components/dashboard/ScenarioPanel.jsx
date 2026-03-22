import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, TrendingUp, Minus, Zap } from 'lucide-react';

const scenarios = [
  {
    id: 'crash',
    title: 'Caída Brutal',
    subtitle: 'Conflicto escala, algo se rompe',
    description: 'Caída a niveles COVID. Toda la liquidez aparcada compra a destajo. Rally posterior masivo.',
    probability: null,
    icon: AlertTriangle,
    color: 'red',
    action: 'Guardar 50% liquidez para comprar la caída (-30% a -40%)',
  },
  {
    id: 'lateral',
    title: 'Movimiento Lateral',
    subtitle: 'Tensión sin resolución',
    description: 'Mercado espera resolución bélica, macro y liquidez. Movimiento sideways hasta catalizador.',
    probability: null,
    icon: Minus,
    color: 'amber',
    action: 'Mantener posiciones. DCA gradual.',
  },
  {
    id: 'rally',
    title: 'Rally desde aquí',
    subtitle: 'Resolución temprana',
    description: 'Conflicto se resuelve, petróleo baja, liquidez entra. Mega rally sin caída previa.',
    probability: null,
    icon: TrendingUp,
    color: 'emerald',
    action: 'Comprar en mejora de indicadores. No esperar caída.',
  },
];

const colorMap = {
  red: { border: 'border-red-500/20', bg: 'bg-red-500/10', text: 'text-red-400', badge: 'bg-red-500/20 text-red-400' },
  amber: { border: 'border-amber-500/20', bg: 'bg-amber-500/10', text: 'text-amber-400', badge: 'bg-amber-500/20 text-amber-400' },
  emerald: { border: 'border-emerald-500/20', bg: 'bg-emerald-500/10', text: 'text-emerald-400', badge: 'bg-emerald-500/20 text-emerald-400' },
};

export default function ScenarioPanel({ phaseScore }) {
  // Estimate which scenario is most likely based on phase score
  const getActiveScenario = () => {
    if (phaseScore <= -40) return 'crash';
    if (phaseScore >= 40) return 'rally';
    return 'lateral';
  };
  const active = getActiveScenario();

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Escenarios Richy
        </h3>
      </div>
      {scenarios.map((s, i) => {
        const c = colorMap[s.color];
        const isActive = s.id === active;
        return (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`rounded-xl border ${c.border} ${isActive ? c.bg : 'bg-secondary/30'} p-4 transition-all duration-300 ${isActive ? 'ring-1 ring-offset-0' : 'opacity-60'}`}
            style={isActive ? { ringColor: `var(--${s.color}-500)` } : {}}
          >
            <div className="flex items-start gap-3">
              <s.icon className={`w-5 h-5 mt-0.5 ${c.text}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-sm font-bold ${isActive ? c.text : 'text-muted-foreground'}`}>
                    {s.title}
                  </span>
                  {isActive && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${c.badge}`}>
                      ACTIVO
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mb-2">{s.description}</p>
                <p className={`text-xs font-medium ${c.text}`}>→ {s.action}</p>
              </div>
            </div>
          </motion.div>
        );
      })}

      <div className="mt-4 p-3 rounded-lg bg-secondary/50 border border-border">
        <p className="text-xs text-muted-foreground leading-relaxed">
          <span className="font-semibold text-foreground">Conclusión Richy:</span> Todos los escenarios acaban 
          volviendo a inyectar ~1T al mercado. Es cuestión de timing. Con 8% de rotación de seguridad a riesgo, 
          BTC podría alcanzar 250-300k. Todo llega... lo malo y lo bueno.
        </p>
      </div>
    </div>
  );
}