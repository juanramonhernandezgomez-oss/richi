import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { format } from 'date-fns';
import { BarChart3 } from 'lucide-react';

export default function HistoryChart({ snapshots }) {
  if (!snapshots || snapshots.length < 2) {
    return (
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Histórico Phase Score
          </h3>
        </div>
        <div className="flex items-center justify-center h-32 text-xs text-muted-foreground">
          Guarda al menos 2 snapshots para ver el gráfico
        </div>
      </div>
    );
  }

  const chartData = snapshots.map(s => ({
    date: format(new Date(s.created_date), 'dd/MM'),
    score: s.phase_score || 0,
    btc: s.btc_price || 0,
  }));

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Histórico Phase Score
        </h3>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={chartData}>
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: 'hsl(215, 20%, 55%)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[-100, 100]}
            tick={{ fontSize: 10, fill: 'hsl(215, 20%, 55%)' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: 'hsl(222, 44%, 8%)',
              border: '1px solid hsl(222, 30%, 16%)',
              borderRadius: '8px',
              fontSize: '12px',
            }}
          />
          <ReferenceLine y={0} stroke="hsl(222, 30%, 20%)" strokeDasharray="3 3" />
          <ReferenceLine y={40} stroke="hsl(160, 84%, 39%)" strokeDasharray="3 3" strokeOpacity={0.3} />
          <ReferenceLine y={-40} stroke="hsl(0, 72%, 51%)" strokeDasharray="3 3" strokeOpacity={0.3} />
          <Line
            type="monotone"
            dataKey="score"
            stroke="hsl(210, 100%, 56%)"
            strokeWidth={2}
            dot={{ fill: 'hsl(210, 100%, 56%)', r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}