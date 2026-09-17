import { useState, useEffect } from 'react';
import { Download, Smartphone, Share, PlusSquare, X, Monitor, ChevronRight } from 'lucide-react';
import { useTranslation } from '../i18n';

export function PWAInstallButton() {
    const { language } = useTranslation();
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isInstalled, setIsInstalled] = useState(false);
    const [showModal, setShowModal] = useState(false);
    
    // Platform detection
    const [isIOS, setIsIOS] = useState(false);
    const [isAndroid, setIsAndroid] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        // 1. Detect already installed via display-mode or iOS standalone
        const checkStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
        if (checkStandalone) {
            setIsInstalled(true);
            setIsStandalone(true);
        }

        // Detect platform
        const ua = window.navigator.userAgent;
        setIsIOS(/iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream);
        setIsAndroid(/android/i.test(ua));

        // 2. Listen for the native install prompt
        const handleBeforeInstallPrompt = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };

        // 3. Listen for successful installation
        const handleAppInstalled = () => {
            setIsInstalled(true);
            setDeferredPrompt(null);
            setShowModal(false);
            
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const handleInstallClick = async () => {
        if (deferredPrompt) {
            // Native prompt is available
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                setDeferredPrompt(null);
            }
        } else {
            // Show manual instructions
            setShowModal(true);
        }
    };

    if (isInstalled || isStandalone) return null;

    const t = {
        es: {
            installApp: 'Descargar aplicación',
            installNAOS: 'Instalar NAOS',
            close: 'Cerrar',
            iosTitle: 'Instalar en iPhone / iPad',
            iosStep1: 'Abre NAOS en Safari.',
            iosStep2: 'Toca el ícono Compartir',
            iosStep3: 'Selecciona "Añadir a pantalla de inicio".',
            iosStep4: 'Confirma con "Añadir".',
            androidTitle: 'Instalar en Android',
            androidDesc: 'Toca el menú de opciones (tres puntos) en tu navegador y selecciona "Instalar aplicación" o "Añadir a pantalla de inicio".',
            desktopTitle: 'Instalar en Computadora',
            desktopDesc: 'Haz clic en el ícono de instalación en la barra de direcciones de Chrome, Edge o Safari, o usa el menú del navegador.',
            genericDesc: 'Añade NAOS a tu pantalla de inicio desde el menú de opciones de tu navegador web para la mejor experiencia.',
        },
        en: {
            installApp: 'Install NAOS',
            installNAOS: 'Install NAOS',
            close: 'Close',
            iosTitle: 'Install on iPhone / iPad',
            iosStep1: 'Open NAOS in Safari.',
            iosStep2: 'Tap the Share icon',
            iosStep3: 'Select "Add to Home Screen".',
            iosStep4: 'Confirm with "Add".',
            androidTitle: 'Install on Android',
            androidDesc: 'Tap the options menu (three dots) in your browser and select "Install app" or "Add to Home screen".',
            desktopTitle: 'Install on Desktop',
            desktopDesc: 'Click the install icon in the address bar of Chrome, Edge, or Safari, or use the browser menu.',
            genericDesc: 'Add NAOS to your home screen from your web browser options menu for the best experience.',
        }
    }[language] || { es: { installApp: 'Descargar aplicación', installNAOS: 'Instalar NAOS', close: 'Cerrar', iosTitle: 'Instalar en iPhone / iPad', iosStep1: 'Abre NAOS en Safari.', iosStep2: 'Toca el ícono Compartir', iosStep3: 'Selecciona "Añadir a pantalla de inicio".', iosStep4: 'Confirma con "Añadir".', androidTitle: 'Instalar en Android', androidDesc: 'Toca el menú de opciones (tres puntos) en tu navegador y selecciona "Instalar aplicación" o "Añadir a pantalla de inicio".', desktopTitle: 'Instalar en Computadora', desktopDesc: 'Haz clic en el ícono de instalación en la barra de direcciones de Chrome, Edge o Safari, o usa el menú del navegador.', genericDesc: 'Añade NAOS a tu pantalla de inicio desde el menú de opciones de tu navegador web para la mejor experiencia.' } }.es; // Default to ES

    return (
        <>
            <button
                onClick={handleInstallClick}
                className="flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/20 hover:bg-primary/20 transition-all group animate-in slide-in-from-top-2 duration-500"
            >
                <Smartphone className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                <span className="text-[10px] uppercase tracking-widest font-bold text-white/80">{t.installApp}</span>
                <Download className="w-3 h-3 text-primary/60" />
            </button>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="relative w-full max-w-sm glass border border-white/10 rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-300">
                        <button 
                            onClick={() => setShowModal(false)}
                            className="absolute top-4 right-4 p-2 text-white/50 hover:text-white transition-colors"
                            aria-label={t.close}
                        >
                            <X className="w-5 h-5" />
                        </button>
                        
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl mx-auto flex items-center justify-center mb-4">
                                <Download className="w-8 h-8 text-primary" />
                            </div>
                            <h2 className="text-xl font-playfair text-white">{t.installNAOS}</h2>
                        </div>

                        {isIOS ? (
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-primary uppercase tracking-widest text-center mb-4">{t.iosTitle}</h3>
                                <ul className="space-y-3 text-sm text-white/80">
                                    <li className="flex items-start gap-3">
                                        <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs shrink-0 mt-0.5">1</span>
                                        <span>{t.iosStep1}</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs shrink-0 mt-0.5">2</span>
                                        <span>{t.iosStep2} <Share className="inline w-4 h-4 ml-1 mb-1" /></span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs shrink-0 mt-0.5">3</span>
                                        <span>{t.iosStep3} <PlusSquare className="inline w-4 h-4 ml-1 mb-1" /></span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs shrink-0 mt-0.5">4</span>
                                        <span>{t.iosStep4}</span>
                                    </li>
                                </ul>
                            </div>
                        ) : isAndroid ? (
                            <div className="space-y-4 text-center">
                                <h3 className="text-sm font-bold text-primary uppercase tracking-widest">{t.androidTitle}</h3>
                                <p className="text-sm text-white/80">{t.androidDesc}</p>
                            </div>
                        ) : (
                            <div className="space-y-4 text-center">
                                <h3 className="text-sm font-bold text-primary uppercase tracking-widest">{t.desktopTitle}</h3>
                                <Monitor className="w-8 h-8 text-white/30 mx-auto" />
                                <p className="text-sm text-white/80">{t.desktopDesc}</p>
                            </div>
                        )}
                        
                        <div className="mt-8">
                            <button 
                                onClick={() => setShowModal(false)}
                                className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-colors border border-white/10"
                            >
                                {t.close}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

