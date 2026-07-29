import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Fingerprint, Network, GitMerge, ChevronLeft } from 'lucide-react';

interface NaosManifestoProps {
    onClose: () => void;
}

export const NaosManifesto: React.FC<NaosManifestoProps> = ({ onClose }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-start bg-black overflow-y-auto"
        >
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519681393784-d120267973ba?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-screen" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] opacity-50" />
            </div>

            <div className="relative z-10 w-full max-w-3xl mx-auto p-6 md:p-12 pb-32">
                
                {/* Header / Back Button */}
                <motion.button 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={onClose}
                    className="flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-12 group"
                >
                    <div className="p-2 rounded-full bg-white/5 border border-white/10 group-hover:bg-white/10 transition-colors">
                        <ChevronLeft className="w-4 h-4" />
                    </div>
                    <span className="text-xs uppercase tracking-[0.2em] font-bold">Volver al Sigilo</span>
                </motion.button>

                {/* Title */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-16 text-center"
                >
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(6,182,212,0.15)]">
                        <Brain className="w-8 h-8 text-cyan-400" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-serif italic text-white mb-4">
                        Manifiesto <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-300">NAOS</span>
                    </h1>
                    <p className="text-xs uppercase tracking-[0.4em] text-white/50">
                        La Arquitectura de la Inteligencia Personal
                    </p>
                </motion.div>

                {/* Content Sections */}
                <div className="space-y-16">
                    
                    {/* Section 1 */}
                    <motion.section 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="relative"
                    >
                        <h2 className="text-xl text-white font-serif italic mb-4 flex items-center gap-3">
                            <Fingerprint className="w-5 h-5 text-cyan-500" />
                            ¿Qué obtiene el usuario?
                        </h2>
                        <div className="p-6 md:p-8 rounded-3xl bg-white/[0.02] border border-white/5 backdrop-blur-xl">
                            <p className="text-white/70 leading-relaxed text-sm md:text-base font-light">
                                El usuario obtiene el control absoluto sobre sus ciclos vitales, sus relaciones interpersonales y sus hábitos diarios a través de un ecosistema que lo monitorea, lo estructura y le exige excelencia. Obtiene <strong className="text-white">claridad radical</strong>. NAOS funciona como un espejo que no solo refleja quién es, sino que audita constantemente hacia dónde va. Se lleva consigo un tablero de comando personal y un asesor sumamente incisivo que lo acompaña 24/7.
                            </p>
                        </div>
                    </motion.section>

                    {/* Section 2 */}
                    <motion.section 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="relative"
                    >
                        <h2 className="text-xl text-white font-serif italic mb-4 flex items-center gap-3">
                            <Network className="w-5 h-5 text-purple-400" />
                            ¿Por qué es diferente?
                        </h2>
                        <div className="p-6 md:p-8 rounded-3xl bg-white/[0.02] border border-white/5 backdrop-blur-xl">
                            <p className="text-white/70 leading-relaxed text-sm md:text-base font-light">
                                A diferencia de las aplicaciones que buscan predecir un destino inamovible, o las apps de productividad que solo son checklists vacíos, NAOS no consuela ni predice. NAOS <strong className="text-white">integra múltiples fuentes de inteligencia</strong> (patrones astronómicos, matemáticos, arquetípicos y datos de comportamiento diario) para generar modelos operativos. Es diferente porque cruza el panorama atemporal de la identidad estructural con la matemática fría y el comportamiento real del presente.
                            </p>
                        </div>
                    </motion.section>

                    {/* Section 3 */}
                    <motion.section 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="relative grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                        <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-b from-white/[0.04] to-transparent border border-white/5 backdrop-blur-xl">
                            <h3 className="text-sm uppercase tracking-widest text-emerald-400 font-bold mb-3">Por qué utiliza IA</h3>
                            <p className="text-white/60 text-sm leading-relaxed">
                                La cantidad de variables que conforman a un ser humano no pueden ser analizadas mediante reglas estáticas. La IA permite sintetizar miles de combinaciones estructurales en tiempo real, adaptando el lenguaje de forma quirúrgica a cada individuo.
                            </p>
                        </div>

                        <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-b from-white/[0.04] to-transparent border border-white/5 backdrop-blur-xl">
                            <h3 className="text-sm uppercase tracking-widest text-amber-400 font-bold mb-3">Por qué aprende</h3>
                            <p className="text-white/60 text-sm leading-relaxed">
                                Un humano no es estático. El sistema ajusta sus diagnósticos monitoreando el comportamiento: si el usuario está alineado, eleva la sofisticación de su exigencia. Aprender es la única manera de mantener la relevancia evolutiva.
                            </p>
                        </div>
                    </motion.section>

                    {/* Section 4 */}
                    <motion.section 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="relative"
                    >
                        <h2 className="text-xl text-white font-serif italic mb-4 flex items-center gap-3">
                            <GitMerge className="w-5 h-5 text-rose-400" />
                            ¿Qué significa Inteligencia Personal?
                        </h2>
                        <div className="p-6 md:p-8 rounded-3xl bg-white/[0.02] border border-white/5 backdrop-blur-xl border-l-rose-500/30">
                            <p className="text-white/70 leading-relaxed text-sm md:text-base font-light">
                                La Inteligencia Personal es la capacidad de medir, comprender y ejecutar acciones alineadas con el propio diseño estructural. Es dejar de operar desde la imitación o la improvisación para empezar a operar desde la <strong className="text-white">estrategia profunda</strong>. Implica usar datos, ciclos y autoconocimiento no como curiosidades, sino como los cimientos de una ventaja competitiva de por vida.
                            </p>
                        </div>
                    </motion.section>

                </div>
            </div>
        </motion.div>
    );
};
