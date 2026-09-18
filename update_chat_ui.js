const fs = require('fs');
let c = fs.readFileSync('client/src/components/ChatInterface.tsx', 'utf8');

const emptyStateRegex = /<div className=\"flex flex-col items-center justify-center h-full opacity-30\">.*?<p className=\"text-amber-100\/50 font-serif tracking-\\[0\.2em\\] uppercase text-\\[10px\\]\">\{t\('oracle_listens'\)\}<\/p>\\s*<\/div>/s;

const newEmptyState = \
                    <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto px-4 gap-8">
                        <div className="flex flex-col items-center opacity-40">
                            <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center mb-6 animate-pulse">
                                <Send size={20} className="text-white/50" />
                            </div>
                            <p className="text-amber-100/70 font-sans text-xs text-center whitespace-pre-wrap leading-relaxed tracking-wider">{t('oracle_listens')}</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-xl opacity-70">
                            {(i18n.language === 'es' ? [
                                "¿Qué parte de mi Código de Identidad está influyendo más en cómo actúo?",
                                "¿Qué está más activo para mí hoy y cómo puedo usarlo?",
                                "¿Qué patrón ves entre quién soy y lo que estoy viviendo ahora?",
                                "Dame una acción concreta para hoy basada en mi contexto."
                            ] : [
                                "Which part of my Identity Code is influencing how I act the most?",
                                "What is most active for me today and how can I use it?",
                                "What pattern do you see between who I am and what I'm experiencing now?",
                                "Give me a concrete action for today based on my context."
                            ]).map((starter, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSend(starter)}
                                    className="text-left p-4 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10 transition-all text-[11px] text-white/60 font-medium leading-relaxed"
                                >
                                    {starter}
                                </button>
                            ))}
                        </div>
                    </div>
\;

c = c.replace(emptyStateRegex, newEmptyState);
fs.writeFileSync('client/src/components/ChatInterface.tsx', c);
