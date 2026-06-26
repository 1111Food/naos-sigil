// client/src/components/AiInterpretationCards.tsx
// Premium swipeable card viewer for Gemini AI interpretation results

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';

import React from 'react';

interface AiInterpretationCardsProps {
    text: string;
}

export const AiInterpretationCards: React.FC<AiInterpretationCardsProps> = ({ text }) => {
    if (!text) return null;

    const lines = text.split('\n');

    return (
        <div className="w-full bg-black/40 border border-purple-500/30 rounded-2xl p-5 max-h-[500px] overflow-y-auto custom-scrollbar shadow-[0_0_30px_rgba(168,85,247,0.1)]">
            <div className="space-y-4">
                {lines.map((line, idx) => {
                    const trimmed = line.trim();
                    if (!trimmed || trimmed === '---' || trimmed.startsWith('⸻')) return null;

                    const isBullet = trimmed.startsWith('* ') || trimmed.startsWith('- ');
                    let content = isBullet ? trimmed.slice(2) : trimmed;

                    // Detect headers (markdown style)
                    let isHeader = false;
                    if (content.startsWith('### ')) {
                        isHeader = true;
                        content = content.replace(/^###\s*/, '');
                    } else if (content.startsWith('## ')) {
                        isHeader = true;
                        content = content.replace(/^##\s*/, '');
                    } else if (content.startsWith('# ')) {
                        isHeader = true;
                        content = content.replace(/^#\s*/, '');
                    }

                    // Bold text parsing
                    const parts = content.split('**');
                    const rendered = parts.map((part, i) =>
                        i % 2 === 1 ? <strong key={i} className="text-white font-bold">{part}</strong> : part
                    );

                    if (isHeader) {
                        return (
                            <h4 key={idx} className="text-sm font-bold text-amber-300 mt-6 mb-2 tracking-wide uppercase">
                                {rendered}
                            </h4>
                        );
                    }

                    if (isBullet) {
                        return <li key={idx} className="ml-4 text-white/70 text-[13px] leading-relaxed list-disc font-serif">{rendered}</li>;
                    }

                    return <p key={idx} className="text-white/80 text-[13px] leading-relaxed font-serif">{rendered}</p>;
                })}
            </div>
        </div>
    );
};