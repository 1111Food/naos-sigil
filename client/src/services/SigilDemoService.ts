export const SigilDemoService = {
    generateMockResponse: async (message: string): Promise<string> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const lowerMsg = message.toLowerCase();
                
                if (lowerMsg.includes('proyecto') || lowerMsg.includes('trabajo')) {
                    resolve("Veo la estructura que estás construyendo. Tu código NAOS (Aries · B'atz') sugiere que debes iniciar rápido pero asegurar tus cimientos. ¿Qué es lo que más temes que falle en este proyecto?");
                } else if (lowerMsg.includes('relacion') || lowerMsg.includes('amor')) {
                    resolve("La sinastría de tu energía con la de otros revela patrones interesantes. No busques controlar la marea, observa de dónde viene. ¿Estás buscando un espejo o un refugio?");
                } else if (lowerMsg.includes('cansado') || lowerMsg.includes('energia')) {
                    resolve("El mapa de tiempo actual muestra una transición densa. El cansancio no es debilidad, es una petición de tu sistema para recalibrar. Ve al Santuario y respira.");
                } else {
                    resolve("Tus palabras reverberan en el éter. En este espacio demostrativo puedo ver la superficie de tu diseño. Para profundizar verdaderamente en tu código energético, necesitaríamos establecer tu bóveda personal en la experiencia completa.");
                }
            }, 1500); // 1.5 seconds simulated latency
        });
    }
};
