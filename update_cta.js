const fs = require('fs');
let c = fs.readFileSync('client/src/pages/CurrentEnergyView.tsx', 'utf8');

c = c.replace(/interface CurrentEnergyViewProps \{\\s*onBack: \(\) => void;\\s*\}/, "interface CurrentEnergyViewProps {\n    onBack: () => void;\n    onNavigate?: (view: string, payload?: any) => void;\n}");

c = c.replace(/export const CurrentEnergyView: React\.FC<CurrentEnergyViewProps> = \(\{ onBack \}\) => \{/, "export const CurrentEnergyView: React.FC<CurrentEnergyViewProps> = ({ onBack, onNavigate }) => {");

const ctaHtml = \
            {/* SIGIL CTA */}
            <div className="flex justify-center mt-4 mb-8">
                <button
                    onClick={() => onNavigate?.('CHAT', { pendingSigilPrompt: language === 'es' ? 'Ayúdame a entender cómo lo que está activo hoy se relaciona con mi Código de Identidad.' : 'Help me understand how what is active today relates to my Identity Code.' })}
                    className="group relative px-8 py-4 bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-purple-500/30 rounded-2xl overflow-hidden hover:border-purple-400/60 transition-all active:scale-[0.98]"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-black/50 border border-purple-500/30 flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-purple-300" />
                        </div>
                        <div className="text-left">
                            <span className="block text-[10px] uppercase tracking-widest text-purple-300/70 font-medium mb-1">
                                {language === 'es' ? 'Inteligencia Personal' : 'Personal Intelligence'}
                            </span>
                            <span className="block text-sm text-white/90 font-serif tracking-wide">
                                {language === 'es' ? 'EXPLORAR CON SIGIL' : 'EXPLORE WITH SIGIL'}
                            </span>
                        </div>
                    </div>
                </button>
            </div>
\;

c = c.replace(/\{showIllusion && <LaborIllusion \/>\}\\s*<\/motion\.div>/, ctaHtml + "\n            {showIllusion && <LaborIllusion />}\n        </motion.div>");

fs.writeFileSync('client/src/pages/CurrentEnergyView.tsx', c);
