import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Brain, Sparkles } from 'lucide-react';

export default function AIAnalysisCard({ analysis, isLoading }) {
  if (!analysis && !isLoading) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-4 h-4 text-purple-400" />
        <h3 className="text-sm font-semibold uppercase tracking-wider text-purple-400">
          Análisis AI
        </h3>
      </div>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 py-6"
          >
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-sm text-purple-400">Analizando datos macro con AI...</span>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="prose prose-sm prose-invert max-w-none"
          >
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="text-sm text-muted-foreground leading-relaxed mb-2">{children}</p>,
                strong: ({ children }) => <strong className="text-foreground font-semibold">{children}</strong>,
                ul: ({ children }) => <ul className="text-sm text-muted-foreground space-y-1 mb-2 ml-4 list-disc">{children}</ul>,
                li: ({ children }) => <li className="text-sm text-muted-foreground">{children}</li>,
                h1: ({ children }) => <h3 className="text-sm font-bold text-foreground mt-3 mb-1">{children}</h3>,
                h2: ({ children }) => <h3 className="text-sm font-bold text-foreground mt-3 mb-1">{children}</h3>,
                h3: ({ children }) => <h3 className="text-sm font-bold text-foreground mt-3 mb-1">{children}</h3>,
              }}
            >
              {analysis}
            </ReactMarkdown>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}