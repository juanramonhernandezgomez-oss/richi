const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { RefreshCw, Wifi, WifiOff, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function LiveMacroPanel({ data, onDataUpdate, selectedAsset }) {
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);

  const fetchLiveData = async () => {
    setIsLoading(true);
    setError(null);
    const assetName = selectedAsset?.symbol || 'BTC';

    const result = await db.integrations.Core.InvokeLLM({
      prompt: `Eres un extractor de datos financieros en tiempo real. Busca y proporciona los valores ACTUALES (hoy ${new Date().toISOString().split('T')[0]}) de los siguientes indicadores macroeconómicos.

Activo principal a analizar: ${assetName}

Busca en fuentes como: FRED, Investing.com, TradingEconomics, Bloomberg, Reuters, Yahoo Finance, CoinGecko, CMC.

Proporciona:
- DXY (US Dollar Index) - valor actual
- VIX (CBOE Volatility Index) - valor actual
- WTI Crude Oil price - en USD por barril
- US 10Y Treasury Yield - en %
- TGA balance (Treasury General Account) - en billions USD, busca en FRED o US Treasury
- RRP balance (Fed Reverse Repo) - en billions USD, busca en FRED
- SOFR overnight rate - en %
- HY Credit Spread (OAS) - en basis points o %
- Money Market Fund total - en trillions USD
- Precio actual de ${assetName}
- S&P 500 nivel actual

También busca:
- Sentiment actual en Twitter/X sobre ${assetName} y macro
- Noticias clave de las últimas 24h que afecten a ${assetName}
- Discusiones en Reddit (r/investing, r/CryptoCurrency, r/wallstreetbets) sobre ${assetName}
- Flujos de capital recientes (ETF flows, institutional)

Devuelve SOLO un JSON con estos campos exactos.`,
      add_context_from_internet: true,
      model: 'gemini_3_flash',
      response_json_schema: {
        type: 'object',
        properties: {
          dxy: { type: 'number' },
          vix: { type: 'number' },
          oil_wti: { type: 'number' },
          bond_10y: { type: 'number' },
          tga_balance: { type: 'number' },
          rrp_balance: { type: 'number' },
          sofr_rate: { type: 'number' },
          credit_spread: { type: 'number' },
          mmf_total: { type: 'number' },
          asset_price: { type: 'number' },
          sp500: { type: 'number' },
          social_sentiment: { type: 'string' },
          key_news: { type: 'array', items: { type: 'string' } },
          capital_flows: { type: 'string' },
        }
      }
    });

    if (result) {
      onDataUpdate({
        dxy: result.dxy,
        vix: result.vix,
        oil_wti: result.oil_wti,
        bond_10y: result.bond_10y,
        tga_balance: result.tga_balance,
        rrp_balance: result.rrp_balance,
        sofr_rate: result.sofr_rate,
        credit_spread: result.credit_spread,
        mmf_total: result.mmf_total,
        btc_price: result.asset_price,
        sp500: result.sp500,
      }, {
        social_sentiment: result.social_sentiment,
        key_news: result.key_news || [],
        capital_flows: result.capital_flows,
      });
      setLastUpdated(new Date());
    }
    setIsLoading(false);
  };

  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {lastUpdated ? (
            <Wifi className="w-4 h-4 text-emerald-400" />
          ) : (
            <WifiOff className="w-4 h-4 text-muted-foreground" />
          )}
          <span className="text-sm font-semibold text-foreground">
            Datos en Tiempo Real
          </span>
          {lastUpdated && (
            <span className="text-xs text-muted-foreground font-mono">
              · actualizado {lastUpdated.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
        <button
          onClick={fetchLiveData}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/80 transition-colors disabled:opacity-60"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Cargando datos...' : 'Actualizar con IA'}
        </button>
      </div>
      {!lastUpdated && (
        <p className="text-xs text-muted-foreground mt-2">
          Pulsa "Actualizar con IA" para obtener todos los datos macro en tiempo real usando internet + IA. 
          También puedes introducir los valores manualmente.
        </p>
      )}
    </div>
  );
}