import React, { useState } from 'react';
import { Search, TrendingUp, Bitcoin, BarChart3, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const PRESET_ASSETS = [
  { symbol: 'BTC', name: 'Bitcoin', category: 'crypto' },
  { symbol: 'ETH', name: 'Ethereum', category: 'crypto' },
  { symbol: 'SOL', name: 'Solana', category: 'crypto' },
  { symbol: 'SPY', name: 'S&P 500 ETF', category: 'equity' },
  { symbol: 'QQQ', name: 'NASDAQ 100 ETF', category: 'equity' },
  { symbol: 'GLD', name: 'Gold ETF', category: 'commodity' },
  { symbol: 'AAPL', name: 'Apple', category: 'equity' },
  { symbol: 'NVDA', name: 'NVIDIA', category: 'equity' },
  { symbol: 'TSLA', name: 'Tesla', category: 'equity' },
  { symbol: 'META', name: 'Meta', category: 'equity' },
  { symbol: 'MSFT', name: 'Microsoft', category: 'equity' },
  { symbol: 'AMZN', name: 'Amazon', category: 'equity' },
];

const categoryColors = {
  crypto: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  equity: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  commodity: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
};

export default function AssetSelector({ selectedAsset, onSelect }) {
  const [search, setSearch] = useState('');
  const [customInput, setCustomInput] = useState('');
  const [open, setOpen] = useState(false);

  const filtered = PRESET_ASSETS.filter(a =>
    a.symbol.toLowerCase().includes(search.toLowerCase()) ||
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCustomAdd = () => {
    const sym = customInput.trim().toUpperCase();
    if (sym) {
      onSelect({ symbol: sym, name: sym, category: 'equity' });
      setCustomInput('');
      setOpen(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Activo Analizado</span>
        </div>
        {selectedAsset && (
          <div className={`flex items-center gap-2 px-3 py-1 rounded-lg border text-sm font-bold font-mono ${categoryColors[selectedAsset.category] || categoryColors.equity}`}>
            {selectedAsset.symbol}
            <span className="text-xs font-normal opacity-70">{selectedAsset.name}</span>
          </div>
        )}
      </div>

      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
      >
        {open ? '▲ Cerrar selector' : '▼ Cambiar activo / buscar ticker'}
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar activo..."
              className="pl-9 h-8 text-xs bg-secondary/50"
            />
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 max-h-48 overflow-y-auto">
            {filtered.map(asset => (
              <button
                key={asset.symbol}
                onClick={() => { onSelect(asset); setOpen(false); setSearch(''); }}
                className={`text-left px-2 py-1.5 rounded-lg border text-xs font-mono transition-all hover:scale-105 ${
                  selectedAsset?.symbol === asset.symbol
                    ? categoryColors[asset.category]
                    : 'border-border bg-secondary/30 text-muted-foreground hover:border-primary/30 hover:text-foreground'
                }`}
              >
                <div className="font-bold">{asset.symbol}</div>
                <div className="opacity-60 text-[10px] truncate">{asset.name}</div>
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              value={customInput}
              onChange={e => setCustomInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCustomAdd()}
              placeholder="Ticker personalizado (ej: MSTR)"
              className="h-8 text-xs bg-secondary/50 font-mono uppercase"
            />
            <button
              onClick={handleCustomAdd}
              className="px-3 py-1 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/80 transition-colors"
            >
              Añadir
            </button>
          </div>
        </div>
      )}
    </div>
  );
}