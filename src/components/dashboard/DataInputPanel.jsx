import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RefreshCw, Save, Brain } from 'lucide-react';

const fields = [
  { key: 'dxy', label: 'DXY', placeholder: '103.5', step: '0.1' },
  { key: 'vix', label: 'VIX', placeholder: '18.5', step: '0.1' },
  { key: 'oil_wti', label: 'WTI Oil ($)', placeholder: '78.50', step: '0.1' },
  { key: 'bond_10y', label: '10Y Yield (%)', placeholder: '4.35', step: '0.01' },
  { key: 'tga_balance', label: 'TGA ($B)', placeholder: '650', step: '1' },
  { key: 'rrp_balance', label: 'RRP ($B)', placeholder: '100', step: '1' },
  { key: 'sofr_rate', label: 'SOFR (%)', placeholder: '5.05', step: '0.01' },
  { key: 'credit_spread', label: 'Credit Spread', placeholder: '3.22', step: '0.01' },
  { key: 'mmf_total', label: 'MMF ($T)', placeholder: '7.77', step: '0.01' },
  { key: 'btc_price', label: 'BTC ($)', placeholder: '85000', step: '100' },
  { key: 'sp500', label: 'S&P 500', placeholder: '5200', step: '1' },
];

export default function DataInputPanel({ data, onChange, onSave, onAnalyze, isAnalyzing, isSaving }) {
  const handleChange = (key, value) => {
    onChange({ ...data, [key]: value === '' ? null : parseFloat(value) });
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Datos Macro
        </h3>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onAnalyze}
            disabled={isAnalyzing}
            className="text-xs gap-1.5"
          >
            <Brain className="w-3.5 h-3.5" />
            {isAnalyzing ? 'Analizando...' : 'AI Análisis'}
          </Button>
          <Button
            size="sm"
            onClick={onSave}
            disabled={isSaving}
            className="text-xs gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            {isSaving ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {fields.map(({ key, label, placeholder, step }) => (
          <div key={key}>
            <Label className="text-xs text-muted-foreground mb-1 block">{label}</Label>
            <Input
              type="number"
              step={step}
              placeholder={placeholder}
              value={data[key] ?? ''}
              onChange={(e) => handleChange(key, e.target.value)}
              className="h-9 text-sm font-mono bg-secondary/50 border-border"
            />
          </div>
        ))}
      </div>
    </div>
  );
}