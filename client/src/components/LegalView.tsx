import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Scale, Info } from 'lucide-react';

interface LegalViewProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'terms' | 'privacy' | 'disclaimer';
}

export const LegalView: React.FC<LegalViewProps> = ({ isOpen, onClose, type }) => {
    const getContent = () => {
        switch (type) {
            case 'terms':
                return {
                    title: 'Términos de Servicio',
                    icon: <Scale className="w-4 h-4 text-cyan-400" />,
                    text: `1. Aceptación de los Términos\nAl acceder a NAOS, aceptas cumplir con estos términos en su fase Beta.\n\n2. Uso del Software\nEl software se proporciona "tal cual". No garantizamos precisión absoluta en cálculos astrológicos o energéticos en esta etapa.\n\n3. Propiedad Intelectual\nTodo el contenido y algoritmos son propiedad de NAOS.`
                };
            case 'privacy':
                return {
                    title: 'Política de Privacidad',
                    icon: <Shield className="w-4 h-4 text-emerald-400" />,
                    text: `1. Datos Recopilados\nRecopilamos datos de nacimiento (fecha, hora, lugar) únicamente para procesar tus cálculos energéticos.\n\n2. No Compartimos Datos\nTus datos son privados y nunca se venderán a terceros.\n\n3. Seguridad\nUtilizamos Supabase para encriptar y proteger tu información.`
                };
            case 'disclaimer':
                return {
                    title: 'Descargo de Responsabilidad',
                    icon: <Info className="w-4 h-4 text-amber-400" />,
                    text: `⚠️ IMPORTANTE:\n\nEsta plataforma NO proporciona consejo médico, financiero, terapéutico o psicológico.\n\nNAOS es una herramienta de auto-descubrimiento y arquitectura del comportamiento. Cualquier decisión tomada en base a los análisis aquí presentados es responsabilidad exclusiva del usuario.`
                };
        }
    };

    const content = getContent();

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ type: "spring", damping: 30 }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative w-full max-w-md p-6 rounded-[2rem] bg-slate-950/90 border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.4)] flex flex-col gap-4 overflow-hidden"
                    >
                        <div className="absolute -top-12 -left-12 w-32 h-32 bg-cyan-500/10 blur-[50px] rounded-full" />

                        <div className="flex items-center justify-between border-b pb-3 border-white/5">
                            <div className="flex items-center gap-2">
                                {content.icon}
                                <h3 className="text-xs font-bold text-white uppercase tracking-wider">{content.title}</h3>
                            </div>
                            <button onClick={onClose} className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all">
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        <div className="mt-1 text-xs text-white/70 leading-relaxed whitespace-pre-wrap max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar font-sans">
                            {content.text}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
