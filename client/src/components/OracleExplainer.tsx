import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Target, Zap, Shield, Heart, Users, Compass, BookOpen, Eye, Info, X, ChevronRight, RefreshCw } from 'lucide-react';
import { cn } from '../lib/utils';
import { useSound } from '../hooks/useSound';
import { useEffect } from 'react';

interface OracleExplainerProps {
    type: 'TAROT' | 'SOULS' | 'DUAL' | 'GROUP' | 'IDENTITY_NEXUS' | 'IDENTITY_COMPLETE' | 'IDENTITY_WISDOM' | 'IDENTITY_ARCHETYPE';
    onClose: () => void;
}

const CONTENT = {
    TAROT: {
        title: "El Oráculo Personal",
        subtitle: "Una ventana al inconsciente",
        color: "text-rose-400",
        gradient: "from-rose-500/20 to-orange-500/10",
        border: "border-rose-500/30",
        icon: Compass,
        steps: [
            {
                number: "01",
                title: "La Intención",
                description: "Todo oráculo nace de una pregunta o estado mental. Al formular tu intención, enfocas tu campo magnético hacia un punto del multiverso.",
                icon: Sparkles,
                iconColor: "text-rose-400"
            },
            {
                number: "02",
                title: "Tirada de 3 Arcanos",
                description: "Se extraen 3 fuerzas. La izquierda rige el Pasado (De dónde vienes), el centro el Presente (Dónde estás parado) y la derecha el Futuro (Hacia dónde evolucionas).",
                icon: Zap,
                iconColor: "text-amber-400"
            },
            {
                number: "03",
                title: "Integración",
                description: "El mensaje no es predictivo, es una directriz de poder. Utiliza la interpretación para sincronizar tu Arquetipo con las fuerzas activas del día.",
                icon: Shield,
                iconColor: "text-cyan-400"
            }
        ]
    },
    SOULS: {
        title: "Dinámica de Vínculos",
        subtitle: "La física cuántica de las relaciones",
        color: "text-purple-400",
        gradient: "from-purple-500/20 to-indigo-500/10",
        border: "border-purple-500/30",
        icon: Users,
        steps: [
            {
                number: "01",
                title: "Contraste de Códigos",
                description: "Superposición de dos códigos Naos. Se cruzan datos astrológicos, numerológicos y mayas para ver cómo vibran juntos.",
                icon: Heart,
                iconColor: "text-purple-400"
            },
            {
                number: "02",
                title: "Fricción y Sinergia",
                description: "Identificamos zonas de flujo natural (Armonías) y puntos de aprendizaje kármico (Fricciones) que retan el crecimiento mutuo.",
                icon: Zap,
                iconColor: "text-fuchsia-400"
            },
            {
                number: "03",
                title: "El Tercer Código",
                description: "Al juntarse, dos personas crean un 'Campo Relacional' único. Descubren el propósito espiritual de su encuentro.",
                icon: Sparkles,
                iconColor: "text-indigo-400"
            }
        ]
    },
    DUAL: {
        title: "Sinergia Dual",
        subtitle: "Vínculo de Dos Almas",
        color: "text-purple-400",
        gradient: "from-purple-500/20 to-indigo-500/10",
        border: "border-purple-500/30",
        icon: Heart,
        steps: [
            {
                number: "01",
                title: "Mapa de Elementos",
                description: "Se contrastan los fluidos (Fuego, Agua, Tierra, Aire). Evaluamos si la complementariedad es fluida o requiere trabajo consciente.",
                icon: Sparkles,
                iconColor: "text-purple-400"
            },
            {
                number: "02",
                title: "Zonas de Fricción",
                description: "Física Cuántica Relacional: Nodos de contacto o choque kármico. Identificar dónde se retan a crecer juntos.",
                icon: Zap,
                iconColor: "text-amber-400"
            },
            {
                number: "03",
                title: "El Motor Común",
                description: "La sintonía de dos personas crea un 'Campo Relacional' único. Revela el propósito espiritual mayor de su encuentro.",
                icon: Shield,
                iconColor: "text-cyan-400"
            }
        ]
    },
    GROUP: {
        title: "Dinámica de Redes",
        subtitle: "Arquitectura Organizacional",
        color: "text-blue-400",
        gradient: "from-blue-500/20 to-cyan-500/10",
        border: "border-blue-500/30",
        icon: Users,
        steps: [
            {
                number: "01",
                title: "Campo Relacional",
                description: "Ecosistemas de equipo. Cómo influye la frecuencia de cada red en el rendimiento global (Proyectos, Misiones).",
                icon: Sparkles,
                iconColor: "text-blue-400"
            },
            {
                number: "02",
                title: "Nodos de Saturación",
                description: "Lugares donde la energía grupal u organizacional se estanca o colisiona. Identificar brechas de comunicación.",
                icon: Zap,
                iconColor: "text-fuchsia-400"
            },
            {
                number: "03",
                title: "Propósito Unificado",
                description: "El Sigil de Grupo. La energía que arrastra al equipo hacia su Misión y Coherencia empresarial.",
                icon: Shield,
                iconColor: "text-teal-400"
            }
        ]
    },
    IDENTITY_NEXUS: {
        title: 'Nexo de Identidad',
        subtitle: "Tu Arcano NAOS",
        color: "text-cyan-400",
        gradient: 'from-cyan-500/20 via-blue-500/10 to-transparent',
        border: "border-cyan-500/30",
        icon: Info,
        steps: [
            {
                number: "01",
                title: "Fusión Holística",
                description: "Tu diseño suma 4 vertientes (Astrología, Números, Maya y Chino) para unificarse en el Arcano NAOS.",
                icon: Sparkles,
                iconColor: "text-cyan-400"
            },
            {
                number: "02",
                title: "Alineación de Poder",
                description: "Cada escuela inyecta una respuesta a tus nodos evolutivos para trazar el sendero de tu rol maestro.",
                icon: Target,
                iconColor: "text-blue-400"
            },
            {
                number: "03",
                title: "ADN Bio-Arquitectónico",
                description: "Descubre las fuerzas latentes y sintonizaciones diarias asignadas para elevar tu nivel de consciencia hoy.",
                icon: Compass,
                iconColor: "text-indigo-400"
            }
        ]
    },
    IDENTITY_COMPLETE: {
        title: 'Código Completo',
        subtitle: "Navegación Profunda",
        color: "text-blue-400",
        gradient: 'from-blue-500/20 via-indigo-500/10 to-transparent',
        border: "border-blue-500/30",
        icon: Shield,
        steps: [
            {
                number: "01",
                title: "Navegación Intuitiva",
                description: "Un módulo de pestañas que permite aislar y decodificar cada pilar de tu herencia estelar y numérica.",
                icon: Compass,
                iconColor: "text-blue-400"
            },
            {
                number: "02",
                title: "Estructura Dinámica",
                description: "Accede a interpretaciones profundas, decanatos, casas y regentes asignados a cada nodo de tu ser.",
                icon: Shield,
                iconColor: "text-indigo-400"
            },
            {
                number: "03",
                title: "Re-Cálculo en Vivo",
                description: "Usa el recálculo analítico si actualizas tu perfil para re-compilar el tensor de datos sin demora.",
                icon: RefreshCw,
                iconColor: "text-purple-400"
            }
        ]
    },
    IDENTITY_WISDOM: {
        title: 'Biblioteca de Sabiduría',
        subtitle: "Acceso al Conocimiento",
        color: "text-purple-400",
        gradient: 'from-purple-500/20 via-fuchsia-500/10 to-transparent',
        border: "border-purple-500/30",
        icon: BookOpen,
        steps: [
            {
                number: "01",
                title: "Repositorio Central",
                description: "Manuales, guías y transcripciones canalizadas para absorber la filosofía detrás de cada Arquetipo.",
                icon: BookOpen,
                iconColor: "text-purple-400"
            },
            {
                number: "02",
                title: "Exploración del Códice",
                description: "Contempla la galería de Arcanos maestros y decodifica las matemáticas sagradas que los conectan.",
                icon: Eye,
                iconColor: "text-fuchsia-400"
            },
            {
                number: "03",
                title: "Sintonización Directa",
                description: "Agrega rituales a la biblioteca con tu Sigil para acelerar tu salto evolutivo.",
                icon: Zap,
                iconColor: "text-rose-400"
            }
        ]
    },
    IDENTITY_ARCHETYPE: {
        title: 'Código de Identidad',
        subtitle: "Alquimia de Escuelas",
        color: "text-cyan-400",
        gradient: 'from-cyan-500/20 via-blue-500/10 to-transparent',
        border: "border-cyan-500/30",
        icon: Info,
        steps: [
            {
                number: "01",
                title: "Cuatro Escuelas",
                description: "Integra el análisis entrelazado de tu Astrología, Numerología, Cosmogonía Maya y Horóscopo Chino.",
                icon: Compass,
                iconColor: "text-cyan-400"
            },
            {
                number: "02",
                title: "Quinto Elemento: El Arcano",
                description: "Surge de una Alquimia Sagrada que unifica las 4 vertientes para condensar tu Esencia Primordial o Arcano NAOS.",
                icon: Sparkles,
                iconColor: "text-purple-400"
            }
        ]
    }
};
// @ts-ignore
export const OracleExplainer: React.FC<OracleExplainerProps> = ({ type, onClose }) => {
    const { playSound } = useSound();

    useEffect(() => {
        playSound('transition');
    }, [playSound]);

    const data = CONTENT[type];
    const Icon = data.icon;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className={cn(
                    "relative w-full max-w-4xl glass-panel border p-8 md:p-12 overflow-hidden rounded-[3.5rem] bg-black/40 shadow-2xl",
                    data.border
                )}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Background ambient glow */}
                <div className={cn("absolute inset-0 bg-gradient-to-br opacity-10 pointer-events-none", data.gradient)} />

                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 text-white/40 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="flex flex-col items-center text-center mb-12 space-y-4">
                    <div className={cn("p-4 rounded-full bg-white/5 border border-white/10 mb-2", data.color)}>
                        <Icon size={32} />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-serif italic text-white/90">
                        {data.title}
                    </h2>
                    <div className="h-px w-24 bg-gradient-to-r from-transparent via-white/20 to-transparentmx-auto" />
                    <p className="text-xs uppercase tracking-[0.3em] text-white/40 font-black">
                        {data.subtitle}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                    {data.steps.map((step, i) => {
                        const StepIcon = step.icon;
                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.2, duration: 0.6 }}
                                className="group relative p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all flex flex-col items-center text-center space-y-4 h-full justify-start"
                            >
                                <div className="absolute top-4 right-4 text-2xl font-black text-white/5 font-mono group-hover:text-white/10 transition-colors">
                                    {step.number}
                                </div>
                                
                                <div className={cn("p-3 rounded-2xl bg-white/5 border border-white/5", step.iconColor)}>
                                    <StepIcon size={24} />
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-lg font-bold tracking-wider text-white/90 uppercase">
                                        {step.title}
                                    </h3>
                                    <p className="text-[13px] text-white/60 leading-relaxed">
                                        {step.description}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                <div className="pt-12 text-center">
                    <button
                        onClick={onClose}
                        className={cn(
                            "px-8 py-3 rounded-full border border-white/10 text-[11px] uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/5 transition-all"
                        )}
                    >
                        Entendido
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};
