const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { Zap, RefreshCw, AlertTriangle, TrendingUp, Minus, Brain, ChevronDown, ChevronUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const iconMap = { AlertTriangle, TrendingUp, Minus };
const colorMap = {
  red: { border: 'border-red-500/30', bg: 'bg-red-500/10', text: 'text-red-400', badge: 'bg-red-500/20 text-red-400', activeBg: 'bg-red-500/15' },
  amber: { border: 'border-amber-500/30', bg: 'bg-amber-500/10', text: 'text-amber-400', badge: 'bg-amber-500/20 text-amber-400', activeBg: 'bg-amber-500/15' },
  emerald: { border: 'border-emerald-500/30', bg: 'bg-emerald-500/10', text: 'text-emerald-400', badge: 'bg-emerald-500/20 text-emerald-400', activeBg: 'bg-emerald-500/15' },
};

export default function RichyScenarioAI({ data, phaseScore, selectedAsset }) {
  const [scenarios, setScenarios] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const assetName = selectedAsset?.symbol || 'BTC';

  const generateScenarios = async () => {
    setIsLoading(true);
    const result = await db.integrations.Core.InvokeLLM({
      prompt: `Eres un analista macro experto que aplica el framework de liquidez de Richy para generar escenarios de mercado.

DATOS MACRO ACTUALES:
- DXY: ${data.dxy ?? 'N/A'} | VIX: ${data.vix ?? 'N/A'} | WTI: $${data.oil_wti ?? 'N/A'}
- 10Y Yield: ${data.bond_10y ?? 'N/A'}% | SOFR: ${data.sofr_rate ?? 'N/A'}%
- TGA: $${data.tga_balance ?? 'N/A'}B | RRP: $${data.rrp_balance ?? 'N/A'}B
- Credit Spread: ${data.credit_spread ?? 'N/A'} | MMF: $${data.mmf_total ?? 'N/A'}T
- Phase Score: ${phaseScore} (de -100 risk-off a +100 risk-on)

ACTIVO ANALIZADO: ${assetName}

FRAMEWORK RICHY:
- Hay ~$1T de liquidez aparcada en MMF/RRP lista para rotar
- FASE 1 (Risk-Off): DXY >105, VIX >25, SOFR sube, bonos venden → crash, acumular
- FASE 2 (Risk-On): DXY baja, TGA gasta, RRP libera, Fed interviene → rally, desplegar capital
- Con 8% rotación de seguridad a riesgo → BTC a 250-300k
- Los 3 escenarios: Caída Brutal → comprar deep / Lateral → DCA / Rally directo → entrar ahora

Aplica este método buscando noticias actuales, sentimiento en redes sociales, flujos institucionales y datos on-chain si aplica.

Genera exactamente 3 escenarios específicos para ${assetName} con análisis cuantitativo.`,
      add_context_from_internet: true,
      model: 'gemini_3_flash',
      response_json_schema: {
        type: 'object',
        properties: {
          market_context: { type: 'string' },
          scenarios: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                title: { type: 'string' },
                subtitle: { type: 'string' },
                probability: { type: 'number' },
                color: { type: 'string' },
                icon: { type: 'string' },
                is_active: { type: 'boolean' },
                analysis: { type: 'string' },
                key_triggers: { type: 'array', items: { type: 'string' } },
                action: { type: 'string' },
                price_target: { type: 'string' },
                timeframe: { type: 'string' },
              }
            }
          },
          richy_conclusion: { type: 'string' },
          recommended_allocation: { type: 'string' },
        }
      }
    });

    if (result) setScenarios(result);
    setIsLoading(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Escenarios Richy · <span className="text-primary">{assetName}</span>
          </h3>
        </div>
        <button
          onClick={generateScenarios}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors disabled:opacity-60"
        >
          {isLoading ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Brain className="w-3.5 h-3.5" />
          )}
          {isLoading ? 'Analizando...' : scenarios ? 'Regenerar' : 'Generar con IA'}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 py-8 justify-center"
          >
            <div className="flex gap-1">
              {[0, 150, 300].map(d => (
                <div key={d} className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: `${d}ms` }} />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">Analizando noticias, redes sociales y datos macro...</span>
          </motion.div>
        )}

        {!isLoading && !scenarios && (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-6 text-center"
          >
            <Brain className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-40" />
            <p className="text-xs text-muted-foreground">
              Pulsa "Generar con IA" para análisis de escenarios dinámico basado en datos reales,<br />
              noticias, redes sociales y el método Richy aplicado a <strong className="text-foreground">{assetName}</strong>
            </p>
          </motion.div>
        )}

        {!isLoading && scenarios && (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {scenarios.market_context && (
              <div className="text-xs text-muted-foreground bg-secondary/50 rounded-lg px-3 py-2 leading-relaxed">
                <span className="font-semibold text-foreground">Contexto actual: </span>
                {scenarios.market_context}
              </div>
            )}

            {(scenarios.scenarios || []).map((s, i) => {
              const c = colorMap[s.color] || colorMap.amber;
              const Icon = iconMap[s.icon] || TrendingUp;
              const isExpanded = expandedId === s.id;
              return (
                <motion.div
                  key={s.id || i}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className={`rounded-xl border ${c.border} ${s.is_active ? c.activeBg : 'bg-secondary/20'} p-4 transition-all duration-300`}
                >
                  <div className="flex items-start gap-3">
                    <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${c.text}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`text-sm font-bold ${s.is_active ? c.text : 'text-foreground'}`}>
                          {s.title}
                        </span>
                        {s.is_active && (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${c.badge}`}>ACTIVO</span>
                        )}
                        {s.probability != null && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground font-mono">
                            {Math.round(s.probability * 100)}%
                          </span>
                        )}
                        {s.timeframe && (
                          <span className="text-xs text-muted-foreground">· {s.timeframe}</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{s.subtitle}</p>

                      {s.price_target && (
                        <div className={`text-xs font-mono font-bold ${c.text} mb-2`}>
                          🎯 Target: {s.price_target}
                        </div>
                      )}

                      <p className={`text-xs font-medium ${c.text} mb-2`}>→ {s.action}</p>

                      <button
                        onClick={() => setExpandedId(isExpanded ? null : s.id)}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        {isExpanded ? 'Menos detalle' : 'Ver análisis completo'}
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="pt-3 space-y-2">
                              {s.analysis && (
                                <p className="text-xs text-muted-foreground leading-relaxed">{s.analysis}</p>
                              )}
                              {s.key_triggers?.length > 0 && (
                                <div>
                                  <p className="text-xs font-semibold text-foreground mb-1">Triggers clave:</p>
                                  <ul className="space-y-0.5">
                                    {s.key_triggers.map((t, ti) => (
                                      <li key={ti} className="text-xs text-muted-foreground flex items-start gap-1.5">
                                        <span className={`mt-0.5 ${c.text}`}>·</span> {t}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {scenarios.richy_conclusion && (
              <div className="mt-2 p-3 rounded-lg bg-secondary/50 border border-border">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <span className="font-semibold text-foreground">Conclusión Richy: </span>
                  {scenarios.richy_conclusion}
                </p>
                {scenarios.recommended_allocation && (
                  <p className="text-xs text-primary font-semibold mt-2">
                    💼 {scenarios.recommended_allocation}
                  </p>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}