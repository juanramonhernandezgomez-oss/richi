const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { FlaskConical, RefreshCw, TrendingUp, TrendingDown, BarChart3, Target } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid } from 'recharts';
import ReactMarkdown from 'react-markdown';

export default function BacktestModule({ snapshots, selectedAsset }) {
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const assetName = selectedAsset?.symbol || 'BTC';

  const runBacktest = async () => {
    setIsLoading(true);

    // Prepare historical snapshots summary for the AI
    const snapshotSummary = snapshots.length > 0
      ? snapshots.slice(0, 15).map(s =>
          `[${new Date(s.created_date).toLocaleDateString('es-ES')}] Phase: ${s.phase_detected}, Score: ${s.phase_score}, DXY: ${s.dxy}, VIX: ${s.vix}, BTC: ${s.btc_price}, SP500: ${s.sp500}`
        ).join('\n')
      : 'No hay snapshots históricos guardados en el dashboard.';

    const res = await db.integrations.Core.InvokeLLM({
      prompt: `Eres un quant trader experto en backtesting del framework macro de Richy.

ACTIVO: ${assetName}
SNAPSHOTS HISTÓRICOS DEL DASHBOARD:
${snapshotSummary}

FRAMEWORK RICHY A TESTEAR:
- Señal COMPRA: Phase Score > 40 (Risk-On) → entrar en ${assetName}
- Señal VENTA: Phase Score < -40 (Risk-Off) → salir / short
- LATERAL: mantener posición

Busca datos históricos reales de ${assetName} y los indicadores macro (DXY, VIX, Fed policy, TGA, RRP) para los últimos 3-4 años.

TAREAS:
1. Evalúa cómo habría funcionado el framework Richy aplicado a ${assetName} históricamente
2. Calcula retorno estimado vs buy & hold
3. Identifica los mejores y peores trades del framework
4. Analiza en qué condiciones el framework falla o funciona mejor
5. Genera 6-8 puntos de datos históricos (fecha, evento macro, señal Richy, resultado)
6. Da métricas: win rate, max drawdown, Sharpe estimado

Responde en español con análisis detallado y datos reales buscados en internet.`,
      add_context_from_internet: true,
      model: 'gemini_3_flash',
      response_json_schema: {
        type: 'object',
        properties: {
          summary: { type: 'string' },
          win_rate: { type: 'number' },
          framework_return: { type: 'string' },
          buyhold_return: { type: 'string' },
          max_drawdown: { type: 'string' },
          sharpe_ratio: { type: 'string' },
          best_trade: { type: 'string' },
          worst_trade: { type: 'string' },
          key_insights: { type: 'array', items: { type: 'string' } },
          historical_signals: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                date: { type: 'string' },
                event: { type: 'string' },
                signal: { type: 'string' },
                outcome: { type: 'string' },
                return_pct: { type: 'number' },
              }
            }
          },
          conclusion: { type: 'string' },
        }
      }
    });

    setResult(res);
    setIsLoading(false);
  };

  const chartData = result?.historical_signals?.map(s => ({
    date: s.date,
    return: s.return_pct ?? 0,
    signal: s.signal,
  })) || [];

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FlaskConical className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Backtesting · <span className="text-primary">{assetName}</span>
          </h3>
        </div>
        <button
          onClick={runBacktest}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors disabled:opacity-60"
        >
          {isLoading
            ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Analizando...</>
            : <><FlaskConical className="w-3.5 h-3.5" /> {result ? 'Re-ejecutar' : 'Ejecutar Backtest'}</>
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
            <span className="text-sm text-muted-foreground">Analizando historial macro + {assetName} con IA...</span>
          </motion.div>
        )}

        {!isLoading && !result && (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="py-8 text-center">
            <FlaskConical className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-40" />
            <p className="text-xs text-muted-foreground">
              Ejecuta el backtest para ver cómo habría funcionado el framework Richy<br />
              en <strong className="text-foreground">{assetName}</strong> usando datos históricos reales.
            </p>
          </motion.div>
        )}

        {!isLoading && result && (
          <motion.div key="result" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

            {/* KPI Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: 'Win Rate', value: result.win_rate ? `${Math.round(result.win_rate * 100)}%` : 'N/A', color: 'emerald' },
                { label: 'Retorno Framework', value: result.framework_return, color: 'blue' },
                { label: 'Buy & Hold', value: result.buyhold_return, color: 'amber' },
                { label: 'Max Drawdown', value: result.max_drawdown, color: 'red' },
                { label: 'Sharpe (est.)', value: result.sharpe_ratio, color: 'purple' },
              ].map(m => (
                <div key={m.label} className={`p-3 rounded-lg border border-${m.color}-500/20 bg-${m.color}-500/10 text-center`}>
                  <p className="text-[10px] text-muted-foreground mb-1">{m.label}</p>
                  <p className={`text-sm font-bold font-mono text-${m.color}-400`}>{m.value ?? 'N/A'}</p>
                </div>
              ))}
            </div>

            {/* Historical Signals Chart */}
            {chartData.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2 font-semibold">Retornos por señal histórica:</p>
                <ResponsiveContainer width="100%" height={140}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 16%)" />
                    <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'hsl(215, 20%, 55%)' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 9, fill: 'hsl(215, 20%, 55%)' }} axisLine={false} tickLine={false} unit="%" />
                    <Tooltip
                      contentStyle={{ background: 'hsl(222,44%,8%)', border: '1px solid hsl(222,30%,16%)', borderRadius: '8px', fontSize: '11px' }}
                      formatter={(v) => [`${v}%`, 'Retorno']}
                    />
                    <ReferenceLine y={0} stroke="hsl(222, 30%, 25%)" />
                    <Line type="monotone" dataKey="return" stroke="hsl(210, 100%, 56%)" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Historical Signals Table */}
            {result.historical_signals?.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 text-muted-foreground font-medium">Fecha</th>
                      <th className="text-left py-2 text-muted-foreground font-medium">Evento</th>
                      <th className="text-center py-2 text-muted-foreground font-medium">Señal</th>
                      <th className="text-right py-2 text-muted-foreground font-medium">Retorno</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.historical_signals.map((s, i) => (
                      <tr key={i} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                        <td className="py-2 font-mono text-muted-foreground text-[10px]">{s.date}</td>
                        <td className="py-2 text-foreground max-w-[200px] truncate">{s.event}</td>
                        <td className="py-2 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                            s.signal?.includes('COMPRA') || s.signal?.includes('BUY') ? 'bg-emerald-500/20 text-emerald-400' :
                            s.signal?.includes('VENTA') || s.signal?.includes('SELL') ? 'bg-red-500/20 text-red-400' :
                            'bg-amber-500/20 text-amber-400'
                          }`}>{s.signal}</span>
                        </td>
                        <td className={`py-2 text-right font-mono font-bold ${(s.return_pct ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {s.return_pct != null ? `${s.return_pct > 0 ? '+' : ''}${s.return_pct}%` : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Key Insights */}
            {result.key_insights?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-foreground mb-2">💡 Insights clave:</p>
                <ul className="space-y-1">
                  {result.key_insights.map((insight, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                      <span className="text-primary mt-0.5">·</span>{insight}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.conclusion && (
              <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <span className="font-semibold text-foreground">Conclusión: </span>{result.conclusion}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}