const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { Microscope, RefreshCw, TrendingUp, TrendingDown, Minus, DollarSign, Users, Package, Building2, Globe } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const MICRO_CATEGORIES = [
  { id: 'earnings', label: 'Earnings & Guidance', icon: Building2, color: 'blue' },
  { id: 'onchain', label: 'On-Chain / Flows', icon: Globe, color: 'amber' },
  { id: 'institutional', label: 'Institucional', icon: Users, color: 'purple' },
  { id: 'supply', label: 'Supply/Demand', icon: Package, color: 'emerald' },
  { id: 'derivatives', label: 'Derivados & Funding', icon: DollarSign, color: 'red' },
];

const colorMap = {
  blue: { border: 'border-blue-500/20', bg: 'bg-blue-500/10', text: 'text-blue-400' },
  amber: { border: 'border-amber-500/20', bg: 'bg-amber-500/10', text: 'text-amber-400' },
  purple: { border: 'border-purple-500/20', bg: 'bg-purple-500/10', text: 'text-purple-400' },
  emerald: { border: 'border-emerald-500/20', bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
  red: { border: 'border-red-500/20', bg: 'bg-red-500/10', text: 'text-red-400' },
};

export default function MicroAnalysisPanel({ data, selectedAsset, phaseScore }) {
  const [microData, setMicroData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const assetName = selectedAsset?.symbol || 'BTC';

  const fetchMicroData = async () => {
    setIsLoading(true);

    const res = await db.integrations.Core.InvokeLLM({
      prompt: `Eres un analista especializado en datos MICROECONÓMICOS y datos ESPECÍFICOS del activo que complementan el análisis macro.

ACTIVO: ${assetName}
CONTEXTO MACRO:
- Phase Score: ${phaseScore} | DXY: ${data.dxy ?? 'N/A'} | VIX: ${data.vix ?? 'N/A'}
- BTC: $${data.btc_price ?? 'N/A'} | S&P: ${data.sp500 ?? 'N/A'}

BUSCA Y ANALIZA LOS SIGUIENTES DATOS MICRO PARA ${assetName}:

1. EARNINGS / FUNDAMENTALES (si es equity):
   - Últimos resultados trimestrales, EPS, revenue
   - Guidance próximo trimestre
   - P/E, P/S ratios actuales vs histórico
   
2. ON-CHAIN / FLOWS (si es crypto):
   - Exchange inflows/outflows (Glassnode, CryptoQuant)
   - Whale activity, grandes movimientos
   - NUPL, MVRV, Realized Price
   - ETF flows (si aplica: BlackRock, Fidelity, etc.)
   
3. POSICIONAMIENTO INSTITUCIONAL:
   - Cambios en posiciones de grandes fondos
   - COT report si aplica
   - Short interest
   - Insider buying/selling
   
4. SUPPLY & DEMAND:
   - Liquidez en books (bid/ask depth)
   - Open Interest en futuros
   - Upcoming supply events (lockups, halvings, vencimientos)
   
5. DERIVADOS & SENTIMENT:
   - Funding rates en crypto
   - Put/Call ratio en opciones
   - Fear & Greed Index
   - Long/Short ratio en exchanges

Sintetiza TODO esto en un análisis micro completo que COMPLEMENTE el análisis macro. 
¿Están alineados macro y micro? ¿Hay divergencias?
Responde en español.`,
      add_context_from_internet: true,
      model: 'gemini_3_flash',
      response_json_schema: {
        type: 'object',
        properties: {
          micro_score: { type: 'number' },
          macro_micro_alignment: { type: 'string' },
          categories: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                title: { type: 'string' },
                signal: { type: 'string' },
                color: { type: 'string' },
                key_metrics: { type: 'array', items: { type: 'string' } },
                analysis: { type: 'string' },
                bullish: { type: 'boolean' },
              }
            }
          },
          divergences: { type: 'array', items: { type: 'string' } },
          top_micro_signals: { type: 'array', items: { type: 'string' } },
          conclusion: { type: 'string' },
          risk_factors: { type: 'array', items: { type: 'string' } },
        }
      }
    });

    setMicroData(res);
    setIsLoading(false);
  };

  const microScore = microData?.micro_score;
  const scoreColor = microScore > 40 ? 'text-emerald-400' : microScore < -40 ? 'text-red-400' : 'text-amber-400';

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Microscope className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Análisis Micro · <span className="text-primary">{assetName}</span>
          </h3>
          {microScore != null && (
            <span className={`text-xs font-mono font-bold ${scoreColor}`}>
              [{microScore > 0 ? '+' : ''}{microScore}]
            </span>
          )}
        </div>
        <button
          onClick={fetchMicroData}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors disabled:opacity-60"
        >
          {isLoading
            ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Analizando...</>
            : <><Microscope className="w-3.5 h-3.5" /> {microData ? 'Actualizar' : 'Analizar Micro'}</>
          }
        </button>
      </div>

      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex items-center gap-3 py-10 justify-center">
            <div className="flex gap-1">
              {[0, 150, 300].map(d => (
                <div key={d} className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: `${d}ms` }} />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">Buscando datos micro de {assetName}...</span>
          </motion.div>
        )}

        {!isLoading && !microData && (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-8 text-center">
            <Microscope className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-40" />
            <p className="text-xs text-muted-foreground">
              Analiza datos microeconómicos específicos de <strong className="text-foreground">{assetName}</strong>:<br />
              on-chain, earnings, posicionamiento institucional, derivados y más.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-3">
              {MICRO_CATEGORIES.map(cat => {
                const c = colorMap[cat.color];
                return (
                  <span key={cat.id} className={`px-2 py-1 rounded-lg border text-[10px] font-medium ${c.border} ${c.bg} ${c.text}`}>
                    {cat.label}
                  </span>
                );
              })}
            </div>
          </motion.div>
        )}

        {!isLoading && microData && (
          <motion.div key="result" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

            {/* Alignment Banner */}
            {microData.macro_micro_alignment && (
              <div className={`p-3 rounded-lg border ${
                microData.macro_micro_alignment.toLowerCase().includes('alineado') || microData.macro_micro_alignment.toLowerCase().includes('confirm')
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                  : 'border-amber-500/30 bg-amber-500/10 text-amber-400'
              } text-xs font-medium`}>
                🔄 {microData.macro_micro_alignment}
              </div>
            )}

            {/* Categories */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(microData.categories || []).map((cat, i) => {
                const c = colorMap[cat.color] || colorMap.blue;
                return (
                  <motion.div
                    key={cat.id || i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className={`p-3 rounded-lg border ${c.border} ${cat.bullish ? c.bg : 'bg-secondary/20'}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className={`text-xs font-semibold ${c.text}`}>{cat.title}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${cat.bullish ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                        {cat.signal}
                      </span>
                    </div>
                    {cat.key_metrics?.length > 0 && (
                      <ul className="space-y-0.5 mb-2">
                        {cat.key_metrics.slice(0, 3).map((m, mi) => (
                          <li key={mi} className="text-[10px] text-muted-foreground flex items-start gap-1">
                            <span className={`${c.text} mt-0.5`}>·</span> {m}
                          </li>
                        ))}
                      </ul>
                    )}
                    {cat.analysis && (
                      <p className="text-[10px] text-muted-foreground leading-relaxed">{cat.analysis}</p>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Top Signals */}
            {microData.top_micro_signals?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-foreground mb-2">🎯 Señales micro más relevantes:</p>
                <div className="space-y-1">
                  {microData.top_micro_signals.map((s, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <span className="text-primary mt-0.5 font-bold">{i + 1}.</span> {s}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Divergences */}
            {microData.divergences?.length > 0 && (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                <p className="text-xs font-semibold text-amber-400 mb-1">⚠️ Divergencias Macro/Micro:</p>
                {microData.divergences.map((d, i) => (
                  <p key={i} className="text-xs text-amber-300/80">· {d}</p>
                ))}
              </div>
            )}

            {/* Risk Factors */}
            {microData.risk_factors?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-red-400 mb-2">🚨 Factores de riesgo micro:</p>
                <ul className="space-y-0.5">
                  {microData.risk_factors.map((r, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                      <span className="text-red-400 mt-0.5">·</span> {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {microData.conclusion && (
              <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <span className="font-semibold text-foreground">Conclusión Micro: </span>
                  {microData.conclusion}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}