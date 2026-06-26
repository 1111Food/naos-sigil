// client/src/components/AiInterpretationCards.tsx
// Premium swipeable card viewer for Gemini AI interpretation results

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';

interface Section {
    emoji: string;
    title: string;
    body: string[];
    isIntro?: boolean;
}

const SECTION_EMOJIS = ['🧠', '🗣️', '📚', '🧩', '👨‍👩‍👧', '🌍', '🧭', '⚡', '🌑', '🔥', '🧬', '🔍', '🎭', '💼', '👁️', '🌊', '🤝', '🐅', '❤️', '📈', '✨'];

function parseInterpretationToCards(text: string): { intro: string; sections: Section[] } {
    if (!text) return { intro: '', sections: [] };
    const lines = text.split('\n');
    const sections: Section[] = [];
    let intro = '';
    let currentSection: Section | null = null;
    let isIntro = true;
    const introLines: string[] = [];

    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed === '⸻' || trimmed === '---' || trimmed.startsWith('⸻')) {
            if (isIntro) isIntro = false;
            continue;
        }
        let matchedEmoji = null;
        for (const emoji of SECTION_EMOJIS) {
            if (trimmed.startsWith(emoji)) {
                matchedEmoji = emoji;
                break;
            }
        }
        
        if (matchedEmoji) {
            isIntro = false;
            if (currentSection) sections.push(currentSection);
            const title = trimmed.slice(matchedEmoji.length).replace(/^\s*\d+\.\s*/, '').replace(/^\*\*/, '').replace(/\*\*$/, '').trim();
            currentSection = { emoji: matchedEmoji, title, body: [] };
            continue;
        }
        if (isIntro) { if (trimmed) introLines.push(trimmed); }
        else if (currentSection) { currentSection.body.push(trimmed); }
    }
    if (currentSection) sections.push(currentSection);
    intro = introLines.join(' ').replace(/\*\*/g, '');
    return { intro, sections };
}

function renderLine(line: string, index: number) {
    if (!line.trim()) return null;
    const isBullet = line.startsWith('* ') || line.startsWith('- ');
    const content = isBullet ? line.slice(2) : line;
    const parts = content.split('**');
    const rendered = parts.map((part, i) =>
        i % 2 === 1 ? <strong key={i} className="text-white font-bold">{part}</strong> : part
    );
    if (isBullet) return <li key={index} className="ml-4 text-white/70 text-xs leading-relaxed list-disc">{rendered}</li>;
    return <p key={index} className="text-white/80 text-xs leading-relaxed">{rendered}</p>;
}

const CARD_COLORS: Record<string, { border: string; bg: string; text: string; glow: string }> = {
    '🧠': { border: 'border-violet-500/40', bg: 'bg-violet-950/60', text: 'text-violet-300', glow: 'shadow-[0_0_30px_rgba(139,92,246,0.15)]' },
    '🗣️': { border: 'border-sky-500/40', bg: 'bg-sky-950/60', text: 'text-sky-300', glow: 'shadow-[0_0_30px_rgba(56,189,248,0.15)]' },
    '📚': { border: 'border-emerald-500/40', bg: 'bg-emerald-950/60', text: 'text-emerald-300', glow: 'shadow-[0_0_30px_rgba(52,211,153,0.15)]' },
    '🧩': { border: 'border-amber-500/40', bg: 'bg-amber-950/60', text: 'text-amber-300', glow: 'shadow-[0_0_30px_rgba(251,191,36,0.15)]' },
    '👨‍👩‍👧': { border: 'border-pink-500/40', bg: 'bg-pink-950/60', text: 'text-pink-300', glow: 'shadow-[0_0_30px_rgba(244,114,182,0.15)]' },
    '🌍': { border: 'border-teal-500/40', bg: 'bg-teal-950/60', text: 'text-teal-300', glow: 'shadow-[0_0_30px_rgba(45,212,191,0.15)]' },
    '🧭': { border: 'border-cyan-500/40', bg: 'bg-cyan-950/60', text: 'text-cyan-300', glow: 'shadow-[0_0_30px_rgba(34,211,238,0.15)]' },
    '⚡': { border: 'border-yellow-400/40', bg: 'bg-yellow-950/60', text: 'text-yellow-300', glow: 'shadow-[0_0_30px_rgba(250,204,21,0.15)]' },
    '🌑': { border: 'border-slate-500/40', bg: 'bg-slate-900/80', text: 'text-slate-300', glow: 'shadow-[0_0_30px_rgba(100,116,139,0.15)]' },
    '🔥': { border: 'border-orange-500/40', bg: 'bg-orange-950/60', text: 'text-orange-300', glow: 'shadow-[0_0_30px_rgba(249,115,22,0.15)]' },
    '🧬': { border: 'border-purple-500/40', bg: 'bg-purple-950/60', text: 'text-purple-300', glow: 'shadow-[0_0_30px_rgba(168,85,247,0.15)]' },
    '🔍': { border: 'border-indigo-500/40', bg: 'bg-indigo-950/60', text: 'text-indigo-300', glow: 'shadow-[0_0_30px_rgba(99,102,241,0.15)]' },
    '🎭': { border: 'border-rose-500/40', bg: 'bg-rose-950/60', text: 'text-rose-300', glow: 'shadow-[0_0_30px_rgba(244,63,94,0.15)]' },
    '💼': { border: 'border-lime-500/40', bg: 'bg-lime-950/60', text: 'text-lime-300', glow: 'shadow-[0_0_30px_rgba(132,204,22,0.15)]' },
    '👁️': { border: 'border-fuchsia-500/40', bg: 'bg-fuchsia-950/60', text: 'text-fuchsia-300', glow: 'shadow-[0_0_30px_rgba(217,70,239,0.15)]' },
    '🌊': { border: 'border-blue-500/40', bg: 'bg-blue-950/60', text: 'text-blue-300', glow: 'shadow-[0_0_30px_rgba(59,130,246,0.15)]' },
    '🤝': { border: 'border-green-500/40', bg: 'bg-green-950/60', text: 'text-green-300', glow: 'shadow-[0_0_30px_rgba(34,197,94,0.15)]' },
    '🐅': { border: 'border-amber-600/40', bg: 'bg-amber-950/60', text: 'text-amber-400', glow: 'shadow-[0_0_30px_rgba(217,119,6,0.15)]' },
    '❤️': { border: 'border-red-500/40', bg: 'bg-red-950/60', text: 'text-red-300', glow: 'shadow-[0_0_30px_rgba(239,68,68,0.15)]' },
    '📈': { border: 'border-green-400/40', bg: 'bg-green-950/60', text: 'text-green-400', glow: 'shadow-[0_0_30px_rgba(74,222,128,0.15)]' },
    '✨': { border: 'border-amber-400/30', bg: 'bg-amber-950/40', text: 'text-amber-300', glow: 'shadow-[0_0_30px_rgba(251,191,36,0.1)]' },
};
const DEFAULT_COLOR = { border: 'border-purple-500/30', bg: 'bg-purple-950/50', text: 'text-purple-300', glow: 'shadow-[0_0_20px_rgba(168,85,247,0.1)]' };

interface AiInterpretationCardsProps {
    text: string;
}

export const AiInterpretationCards: React.FC<AiInterpretationCardsProps> = ({ text }) => {
    const { intro, sections } = parseInterpretationToCards(text);
    const allCards: Section[] = [
        ...(intro ? [{ emoji: '✨', title: 'Síntesis', body: [intro], isIntro: true }] : []),
        ...sections
    ];

    const [current, setCurrent] = useState(0);
    const [direction, setDirection] = useState(0);

    if (allCards.length === 0) return null;

    const goTo = (index: number) => {
        setDirection(index > current ? 1 : -1);
        setCurrent(index);
    };

    const handleDragEnd = (_: any, info: PanInfo) => {
        if (info.offset.x < -50 && current < allCards.length - 1) goTo(current + 1);
        else if (info.offset.x > 50 && current > 0) goTo(current - 1);
    };

    const card = allCards[current];
    const colors = (card.emoji && CARD_COLORS[card.emoji]) ? CARD_COLORS[card.emoji] : DEFAULT_COLOR;

    const variants = {
        enter: (dir: number) => ({ x: dir > 0 ? 260 : -260, opacity: 0, scale: 0.94 }),
        center: { x: 0, opacity: 1, scale: 1 },
        exit: (dir: number) => ({ x: dir > 0 ? -260 : 260, opacity: 0, scale: 0.94 }),
    };

    return (
        <div className="w-full select-none" style={{ touchAction: 'pan-y' }}>
            <div className="flex justify-center gap-1 mb-4">
                {allCards.map((_, i) => (
                    <button key={i} onClick={() => goTo(i)}
                        className={cn('h-1 rounded-full transition-all duration-500',
                            i === current ? 'w-6 bg-gradient-to-r from-amber-400 to-purple-400' : 'w-1.5 bg-white/20 hover:bg-white/40'
                        )}
                    />
                ))}
            </div>

            <div className="relative overflow-hidden" style={{ minHeight: '180px' }}>
                <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                        key={current}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.18}
                        onDragEnd={handleDragEnd}
                        className={cn('rounded-2xl border p-5 cursor-grab active:cursor-grabbing', colors.border, colors.bg, colors.glow)}
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-2xl">{card.emoji}</span>
                            <h4 className={cn('text-xs font-black uppercase tracking-widest', colors.text)}>
                                {card.title}
                            </h4>
                        </div>
                        <div className="space-y-2 font-serif italic leading-relaxed overflow-y-auto max-h-56 pr-1 custom-scrollbar">
                            {card.body.filter(Boolean).map((line, i) => renderLine(line, i))}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className="flex items-center justify-between mt-4 px-1">
                <button onClick={() => goTo(Math.max(0, current - 1))} disabled={current === 0}
                    className="p-2 rounded-full bg-white/5 border border-white/10 disabled:opacity-20 hover:bg-white/10 transition-all">
                    <ChevronLeft size={14} className="text-white/60" />
                </button>
                <span className="text-[9px] uppercase tracking-[0.3em] text-white/30 font-bold">
                    {current + 1} / {allCards.length}
                </span>
                <button onClick={() => goTo(Math.min(allCards.length - 1, current + 1))} disabled={current === allCards.length - 1}
                    className="p-2 rounded-full bg-white/5 border border-white/10 disabled:opacity-20 hover:bg-white/10 transition-all">
                    <ChevronRight size={14} className="text-white/60" />
                </button>
            </div>
        </div>
    );
};