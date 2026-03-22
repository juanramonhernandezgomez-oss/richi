import React from 'react';
import { MessageSquare, Twitter, TrendingUp, Newspaper } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SocialSentimentPanel({ socialData, assetSymbol }) {
  if (!socialData) return null;

  const { social_sentiment, key_news, capital_flows } = socialData;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-card p-5 space-y-4"
    >
      <div className="flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Sentimiento & Noticias · <span className="text-primary">{assetSymbol}</span>
        </h3>
      </div>

      {social_sentiment && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-secondary/50">
          <Twitter className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-foreground mb-1">Sentimiento Social</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{social_sentiment}</p>
          </div>
        </div>
      )}

      {key_news?.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Newspaper className="w-3.5 h-3.5 text-muted-foreground" />
            <p className="text-xs font-semibold text-foreground">Noticias Clave (24h)</p>
          </div>
          <div className="space-y-1.5">
            {key_news.slice(0, 5).map((news, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                <span className="text-primary mt-0.5 flex-shrink-0">·</span>
                <span className="leading-relaxed">{news}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {capital_flows && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-emerald-400 mb-1">Flujos de Capital</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{capital_flows}</p>
          </div>
        </div>
      )}
    </motion.div>
  );
}