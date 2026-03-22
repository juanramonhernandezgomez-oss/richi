const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { Bell, BellOff, Send, Plus, Trash2, CheckCircle2, Mail } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const DEFAULT_ALERTS = [
  { id: 1, name: 'VIX Spike Risk-Off', condition: 'VIX > 25', active: true, color: 'red' },
  { id: 2, name: 'DXY Ruptura Alcista', condition: 'DXY > 105', active: true, color: 'red' },
  { id: 3, name: 'RRP Colapso', condition: 'RRP < 50B', active: true, color: 'amber' },
  { id: 4, name: 'Fase Risk-On Detectada', condition: 'Phase Score > 40', active: true, color: 'emerald' },
  { id: 5, name: 'Credit Spread Explosión', condition: 'Credit Spread > 5', active: false, color: 'red' },
];

const colorMap = {
  red: 'border-red-500/30 bg-red-500/10 text-red-400',
  amber: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  emerald: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
};

export default function EmailAlerts({ data, phaseScore, selectedAsset }) {
  const [email, setEmail] = useState('');
  const [alerts, setAlerts] = useState(DEFAULT_ALERTS);
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [newAlert, setNewAlert] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const toggleAlert = (id) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, active: !a.active } : a));
  };

  const removeAlert = (id) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const addAlert = () => {
    if (!newAlert.trim()) return;
    setAlerts(prev => [...prev, {
      id: Date.now(),
      name: newAlert.trim(),
      condition: 'Personalizada',
      active: true,
      color: 'amber',
    }]);
    setNewAlert('');
    setShowAdd(false);
  };

  // Check which alerts are currently triggered
  const triggered = alerts.filter(a => {
    if (!a.active) return false;
    if (a.condition.includes('VIX > 25') && data.vix > 25) return true;
    if (a.condition.includes('DXY > 105') && data.dxy > 105) return true;
    if (a.condition.includes('RRP < 50') && data.rrp_balance < 50) return true;
    if (a.condition.includes('Phase Score > 40') && phaseScore > 40) return true;
    if (a.condition.includes('Credit Spread > 5') && data.credit_spread > 5) return true;
    return false;
  });

  const sendAlertEmail = async () => {
    if (!email) return;
    setIsSending(true);

    const triggeredList = triggered.length > 0
      ? triggered.map(a => `• ${a.name} (${a.condition})`).join('\n')
      : 'Ninguna alerta activa disparada actualmente.';

    const body = `
🚨 ALERTA MACRO LIQUIDITY DASHBOARD

Activo analizado: ${selectedAsset?.symbol || 'BTC'}
Phase Score actual: ${phaseScore} ${phaseScore > 40 ? '(RISK ON ✅)' : phaseScore < -40 ? '(RISK OFF ⚠️)' : '(LATERAL ⚡)'}

📊 DATOS MACRO ACTUALES:
• DXY: ${data.dxy ?? 'N/A'}
• VIX: ${data.vix ?? 'N/A'}
• WTI: $${data.oil_wti ?? 'N/A'}
• 10Y Yield: ${data.bond_10y ?? 'N/A'}%
• TGA: $${data.tga_balance ?? 'N/A'}B
• RRP: $${data.rrp_balance ?? 'N/A'}B
• Credit Spread: ${data.credit_spread ?? 'N/A'}
• MMF: $${data.mmf_total ?? 'N/A'}T

🔔 ALERTAS DISPARADAS:
${triggeredList}

---
Enviado desde Macro Liquidity Dashboard — Framework Richy
    `.trim();

    await db.integrations.Core.SendEmail({
      to: email,
      subject: `🚨 [MacroDash] Alerta: ${triggered.length} señal(es) activa(s) — ${selectedAsset?.symbol || 'BTC'}`,
      body,
    });

    setIsSending(false);
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Alertas por Email
          </h3>
          {triggered.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-mono font-bold animate-pulse">
              {triggered.length} activa{triggered.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Nueva alerta
        </button>
      </div>

      {/* Triggered Banner */}
      {triggered.length > 0 && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
          <p className="text-xs text-red-400 font-semibold mb-1">⚠️ Alertas disparadas ahora mismo:</p>
          {triggered.map(a => (
            <p key={a.id} className="text-xs text-red-300 font-mono">• {a.name}</p>
          ))}
        </div>
      )}

      {/* Alert List */}
      <div className="space-y-2 mb-4">
        {alerts.map((alert) => {
          const isTriggered = triggered.some(t => t.id === alert.id);
          return (
            <div
              key={alert.id}
              className={`flex items-center justify-between px-3 py-2 rounded-lg border transition-all ${
                isTriggered ? colorMap[alert.color] : 'border-border bg-secondary/20'
              }`}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <button onClick={() => toggleAlert(alert.id)}>
                  {alert.active
                    ? <Bell className={`w-3.5 h-3.5 ${isTriggered ? 'text-current' : 'text-primary'}`} />
                    : <BellOff className="w-3.5 h-3.5 text-muted-foreground" />}
                </button>
                <div className="min-w-0">
                  <p className={`text-xs font-medium truncate ${alert.active ? 'text-foreground' : 'text-muted-foreground line-through'}`}>
                    {alert.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-mono">{alert.condition}</p>
                </div>
              </div>
              {isTriggered && <span className="text-[10px] font-bold mr-2 text-current animate-pulse">● ACTIVA</span>}
              <button onClick={() => removeAlert(alert.id)} className="text-muted-foreground hover:text-red-400 transition-colors ml-1">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Add Alert */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-4"
          >
            <div className="flex gap-2 pt-1">
              <Input
                value={newAlert}
                onChange={e => setNewAlert(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addAlert()}
                placeholder="Nombre de la alerta personalizada..."
                className="h-8 text-xs bg-secondary/50"
              />
              <button onClick={addAlert} className="px-3 py-1 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/80">
                Añadir
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Email Send */}
      <div className="border-t border-border pt-4">
        <Label className="text-xs text-muted-foreground mb-2 block">Enviar resumen a email:</Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="pl-9 h-9 text-xs bg-secondary/50"
            />
          </div>
          <button
            onClick={sendAlertEmail}
            disabled={isSending || !email}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/80 disabled:opacity-50 transition-colors"
          >
            {sent ? (
              <><CheckCircle2 className="w-3.5 h-3.5" /> Enviado</>
            ) : isSending ? (
              <>Enviando...</>
            ) : (
              <><Send className="w-3.5 h-3.5" /> Enviar</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}