const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from 'react';

import { calculatePhaseScore, detectPhase, getPhaseInfo } from '@/lib/phaseEngine';
import PhaseIndicator from '@/components/dashboard/PhaseIndicator';
import MacroCard from '@/components/dashboard/MacroCard';
import DataInputPanel from '@/components/dashboard/DataInputPanel';
import AIAnalysisCard from '@/components/dashboard/AIAnalysisCard';
import ScenarioPanel from '@/components/dashboard/ScenarioPanel';
import HistoryChart from '@/components/dashboard/HistoryChart';
import LiquidityCalculator from '@/components/dashboard/LiquidityCalculator';
import AssetSelector from '@/components/dashboard/AssetSelector';
import LiveMacroPanel from '@/components/dashboard/LiveMacroPanel';
import RichyScenarioAI from '@/components/dashboard/RichyScenarioAI';
import SocialSentimentPanel from '@/components/dashboard/SocialSentimentPanel';
import CorrelationMatrix from '@/components/dashboard/CorrelationMatrix';
import EmailAlerts from '@/components/dashboard/EmailAlerts';
import BacktestModule from '@/components/dashboard/BacktestModule';
import MicroAnalysisPanel from '@/components/dashboard/MicroAnalysisPanel';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Activity, DollarSign, BarChart2, Droplets, Bitcoin, TrendingUp, Percent, CreditCard, PiggyBank } from 'lucide-react';

const INITIAL_DATA = {
  dxy: null, vix: null, oil_wti: null, bond_10y: null,
  tga_balance: null, rrp_balance: null, sofr_rate: null,
  credit_spread: null, mmf_total: null, btc_price: null, sp500: null,
};

const MACRO_CARDS = [
  { key: 'dxy', label: 'DXY', unit: '', icon: DollarSign, threshold: { riskOff: '105', riskOn: '100' } },
  { key: 'vix', label: 'VIX', unit: '', icon: Activity, threshold: { riskOff: '25', riskOn: '15' } },
  { key: 'oil_wti', label: 'WTI Oil', unit: '$', icon: Droplets, threshold: { riskOff: '$90', riskOn: '$70' } },
  { key: 'bond_10y', label: '10Y Yield', unit: '%', icon: BarChart2, threshold: { riskOff: '4.5%', riskOn: '3.8%' } },
  { key: 'tga_balance', label: 'TGA', unit: 'B', icon: PiggyBank, threshold: { riskOff: '$800B', riskOn: '$300B' } },
  { key: 'rrp_balance', label: 'RRP', unit: 'B', icon: DollarSign, threshold: { riskOff: '$500B', riskOn: '$50B' } },
  { key: 'sofr_rate', label: 'SOFR', unit: '%', icon: Percent, threshold: { riskOff: '5.3%', riskOn: '4.5%' } },
  { key: 'credit_spread', label: 'Credit Spread', unit: '', icon: CreditCard, threshold: { riskOff: '4.5', riskOn: '2.5' } },
  { key: 'mmf_total', label: 'MMF', unit: 'T', icon: PiggyBank, threshold: { riskOff: '$6T', riskOn: '$5T' } },
  { key: 'btc_price', label: 'BTC', unit: '$', icon: Bitcoin, threshold: { riskOff: '$60k', riskOn: '$100k' } },
  { key: 'sp500', label: 'S&P 500', unit: '', icon: TrendingUp, threshold: { riskOff: '4800', riskOn: '5500' } },
];

export default function Dashboard() {
  const [formData, setFormData] = useState(INITIAL_DATA);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [socialData, setSocialData] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState({ symbol: 'BTC', name: 'Bitcoin', category: 'crypto' });

  const queryClient = useQueryClient();

  const { data: snapshots = [] } = useQuery({
    queryKey: ['snapshots'],
    queryFn: () => db.entities.MacroSnapshot.list('-created_date', 20),
  });

  const saveMutation = useMutation({
    mutationFn: (data) => db.entities.MacroSnapshot.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['snapshots'] }),
  });

  const { phaseScore, individualScores: scores } = calculatePhaseScore(formData);
  const phase = detectPhase(phaseScore);

  const handleSave = () => {
    saveMutation.mutate({
      ...formData,
      phase_detected: phase,
      phase_score: phaseScore,
      ai_analysis: aiAnalysis,
    });
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    const result = await db.integrations.Core.InvokeLLM({
      prompt: `Eres un analista macro experto. Analiza estos datos macroeconómicos y el activo ${selectedAsset.symbol} con el framework de liquidez de Richy.

Datos actuales:
- DXY: ${formData.dxy ?? 'N/A'} | VIX: ${formData.vix ?? 'N/A'} | WTI: $${formData.oil_wti ?? 'N/A'}
- 10Y Yield: ${formData.bond_10y ?? 'N/A'}% | SOFR: ${formData.sofr_rate ?? 'N/A'}%
- TGA: $${formData.tga_balance ?? 'N/A'}B | RRP: $${formData.rrp_balance ?? 'N/A'}B
- Credit Spread: ${formData.credit_spread ?? 'N/A'} | MMF: $${formData.mmf_total ?? 'N/A'}T
- BTC: $${formData.btc_price ?? 'N/A'} | S&P 500: ${formData.sp500 ?? 'N/A'}
- Phase Score: ${phaseScore} / Fase: ${phase}
- Activo analizado: ${selectedAsset.symbol}

Busca noticias recientes sobre ${selectedAsset.symbol} y el contexto macro.
Proporciona un análisis conciso en español con: fase actual, señales clave, riesgos y oportunidades.`,
      add_context_from_internet: true,
      model: 'gemini_3_flash',
    });
    setAiAnalysis(result);
    setIsAnalyzing(false);
  };

  const handleLiveDataUpdate = (macroData, social) => {
    setFormData(prev => ({ ...prev, ...macroData }));
    if (social) setSocialData(social);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-mono text-foreground tracking-tight">
              Macro Liquidity Dashboard
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">Framework Richy · Liquidez & Fases de Mercado</p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/manual.html"
              target="_blank"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/50 border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              📖 Manual
            </a>
            <div className="text-xs text-muted-foreground font-mono">
              {new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
            </div>
          </div>
        </div>

        {/* Asset Selector */}
        <AssetSelector selectedAsset={selectedAsset} onSelect={setSelectedAsset} />

        {/* Live Data Panel */}
        <LiveMacroPanel data={formData} onDataUpdate={handleLiveDataUpdate} selectedAsset={selectedAsset} />

        {/* Phase Indicator */}
        <PhaseIndicator phase={phase} phaseScore={phaseScore} />

        {/* Macro Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {MACRO_CARDS.map(({ key, label, unit, icon, threshold }, i) => (
            <MacroCard
              key={key}
              label={label}
              value={formData[key]}
              unit={unit}
              score={scores[key] ?? 0}
              threshold={threshold}
              icon={icon}
              delay={i}
            />
          ))}
        </div>

        {/* Data Input */}
        <DataInputPanel
          data={formData}
          onChange={setFormData}
          onSave={handleSave}
          onAnalyze={handleAnalyze}
          isAnalyzing={isAnalyzing}
          isSaving={saveMutation.isPending}
        />

        {/* AI Analysis */}
        <AIAnalysisCard analysis={aiAnalysis} isLoading={isAnalyzing} />

        {/* Social Sentiment */}
        {socialData && <SocialSentimentPanel socialData={socialData} selectedAsset={selectedAsset} />}

        {/* Two columns: Scenarios + Calculator */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <RichyScenarioAI data={formData} phaseScore={phaseScore} selectedAsset={selectedAsset} />
          </div>
          <LiquidityCalculator
            tga={formData.tga_balance}
            rrp={formData.rrp_balance}
            mmf={formData.mmf_total}
          />
        </div>

        {/* Micro Analysis */}
        <MicroAnalysisPanel data={formData} selectedAsset={selectedAsset} phaseScore={phaseScore} />

        {/* Backtest */}
        <BacktestModule snapshots={snapshots} selectedAsset={selectedAsset} />

        {/* Correlation Matrix + Email Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <CorrelationMatrix />
          <EmailAlerts data={formData} phaseScore={phaseScore} selectedAsset={selectedAsset} />
        </div>

        {/* History Chart */}
        <HistoryChart snapshots={snapshots} />

      </div>
    </div>
  );
}