import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../i18n';
import { useProfile } from '../hooks/useProfile';
import { useAuth } from '../contexts/AuthContext';
import { Lock, LogOut } from 'lucide-react';

interface PreLaunchGateProps {
  children: React.ReactNode;
}

export const PreLaunchGate: React.FC<PreLaunchGateProps> = ({ children }) => {
  const { profile, loading } = useProfile();
  const { signOut } = useAuth();
  const { language } = useTranslation();
  
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  const launchDate = new Date('2026-09-22T00:00:00Z').getTime();
  
  // ACTIVADO POR DEFECTO: El candado está puesto en producción automáticamente
  const isPreLaunchMode = true; // import.meta.env.VITE_PRE_LAUNCH_MODE === 'true';

  useEffect(() => {
    if (!isPreLaunchMode) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = launchDate - now;

      if (distance < 0) {
        clearInterval(interval);
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPreLaunchMode, launchDate]);

  if (!isPreLaunchMode) {
    return <>{children}</>;
  }

  // Allow admins to bypass the gate
  if (!loading && profile?.plan_type === 'admin') {
    return <>{children}</>;
  }

  // While checking profile status, just show a smooth loading or nothing to avoid flashes
  if (loading) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="min-h-full flex flex-col items-center justify-center px-6 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="max-w-2xl text-center space-y-12"
        >
          <div className="flex justify-center mb-8">
          <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
            <Lock className="w-6 h-6 text-amber-400 opacity-80" />
          </div>
        </div>
        
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-serif text-white tracking-wide">
            {language === 'en' ? 'The Temple Opens' : 'Las Puertas del Templo abren el'}
          </h1>
          <h2 className="text-3xl md:text-4xl font-serif text-amber-400 italic">
            22 . 09 . 2026
          </h2>
        </div>

        <p className="text-white/50 text-sm md:text-base font-sans tracking-widest leading-relaxed max-w-lg mx-auto">
          {language === 'en' 
            ? 'NAOS is currently in an exclusive Pre-Launch Phase. Only Architects with Master Access can enter the sanctuary. Public Beta begins on the Equinox.'
            : 'NAOS se encuentra actualmente en fase de Pre-Lanzamiento. Solo Arquitectos con acceso maestro pueden ingresar al santuario. La Beta Pública comienza en el Equinoccio.'}
        </p>

        {/* Countdown */}
        <div className="grid grid-cols-4 gap-4 md:gap-8 pt-8 border-t border-white/10">
          {[
            { label: language === 'en' ? 'DAYS' : 'DÍAS', value: timeLeft.days },
            { label: language === 'en' ? 'HOURS' : 'HORAS', value: timeLeft.hours },
            { label: language === 'en' ? 'MINS' : 'MINS', value: timeLeft.minutes },
            { label: language === 'en' ? 'SECS' : 'SEGS', value: timeLeft.seconds }
          ].map((item, idx) => (
            <div key={idx} className="flex flex-col items-center justify-center space-y-2">
              <span className="text-3xl md:text-5xl font-serif text-white">{item.value.toString().padStart(2, '0')}</span>
              <span className="text-[9px] md:text-xs font-sans tracking-[0.2em] text-white/40 uppercase">{item.label}</span>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 flex flex-col items-center justify-center gap-6">
          <button 
            onClick={() => {
              // Si el usuario no está autenticado, esto lo redirigirá al componente de Login en lugar del Gate
              // Como el Gate envuelve a todo (incluyendo App.tsx maneja las vistas), necesitamos un mecanismo para forzar el login.
              // La mejor manera es usar un Custom Event para decirle a App.tsx que cambie la vista.
              window.dispatchEvent(new CustomEvent('naos-force-login'));
            }}
            className="px-8 py-3 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-400 text-xs uppercase tracking-widest rounded-xl transition-colors font-bold shadow-[0_0_15px_rgba(245,158,11,0.1)]"
          >
            {language === 'en' ? 'Admin Login' : 'Ingreso de Administrador'}
          </button>

          <button 
            onClick={() => signOut()}
            className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/20 hover:text-white/70 transition-colors"
          >
            <LogOut size={12} />
            {language === 'en' ? 'Sign out' : 'Cerrar sesión'}
          </button>
        </div>
      </motion.div>
      </div>
    </div>
  );
};
