import { useState, useCallback, useRef, useEffect } from 'react';
import { endpoints, getAuthHeaders } from '../lib/api';
import { useGuardianState } from '../contexts/GuardianContext';
import { useLanguage } from '../contexts/LanguageContext';

export function useSigil(userName?: string, energyContext?: any) {
    const { language } = useLanguage();
    const { oracleState, addMessage: addGlobalMessage, isHistoryLoading } = useGuardianState();

    const getWelcomeMessage = useCallback(() => {
        const cleanName = (userName || 'Viajero').replace(/\.+$/, '');
        const intros = [
            `El silencio ha terminado. NAOS te reconoce, ${cleanName}.`,
            `Las esferas se han alineado. ¿Qué buscas en el tejido del tiempo?`,
            `Bienvenido al Templo, ${cleanName}. Tu rastro estelar nos guía.`
        ];
        return intros[Math.floor(Math.random() * intros.length)];
    }, [userName]);

    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const lastCallRef = useRef<number>(0);

    // Sync messages from global state
    useEffect(() => {
        if (isHistoryLoading) return;

        if (oracleState.messages.length > 0) {
            setMessages(oracleState.messages.map(m => ({
                id: m.id,
                role: m.sender === 'user' ? 'user' : 'model',
                text: m.text?.replace(/\bhla\b/gi, 'Saludos').replace(/conooimiento/gi, 'conocimiento') || m.text,
                isHistory: m.isHistory,
                audioUrl: m.audioUrl
            })));
        } else if (messages.length === 0) {
            setMessages([{ id: 'welcome', role: 'model', text: getWelcomeMessage(), isHistory: false }]);
        }
    }, [oracleState.messages, getWelcomeMessage, isHistoryLoading]);

    const sendMessage = async (text: string, role: 'maestro' | 'guardian' = 'maestro', retryCount = 0) => {
        const now = Date.now();
        if (now - lastCallRef.current < 2000 && retryCount === 0) {
            setMessages(prev => [...prev, { role: 'model', text: "⏳ Calibrando frecuencia... espera un momento." }]);
            return;
        }
        lastCallRef.current = now;

        setLoading(true);
        if (retryCount === 0) {
            // Immediate feedback (optimistic UI controlled by GuardianContext would be better, but keeping it simple)
            setMessages(prev => [...prev, { id: `local-u-${now}`, role: 'user', text }]);
        }

        try {
            const response = await fetch(endpoints.chat, {
                method: 'POST',
                headers: getAuthHeaders() as HeadersInit,
                body: JSON.stringify({
                    message: text,
                    localTimestamp: new Date().toISOString(),
                    oracleState,
                    energyContext,
                    role,
                    language
                })
            });

            if (!response.ok) {
                if (response.status === 429 && retryCount < 1) {
                    setMessages(prev => [...prev, { id: `local-s-timeout-${now}`, role: 'model', text: "La red estelar está saturada... Recalibrando energía." }]);
                    setTimeout(() => sendMessage(text, role, retryCount + 1), 2000);
                    return;
                }
                throw new Error(`Error ${response.status}`);
            }

            const data = await response.json();

            // Sanitización inmediata frontend
            const sanitizedData = (data.text || '')
                .replace(/\bhla\b/gi, 'Saludos')
                .replace(/hla,/gi, 'Saludos,')
                .replace(/conooimiento/gi, 'conocimiento');

            // Permanent storage in global context
            if (retryCount === 0) {
                addGlobalMessage({ id: `u-${now}`, text, sender: 'user' });
            }
            
            addGlobalMessage({ 
                id: `s-${Date.now()}`, 
                text: sanitizedData, 
                sender: 'sigil',
                audioUrl: data.audioUrl 
            });

        } catch (err) {
            console.error("Sigil Connection Error:", err);
            setMessages(prev => [
                ...prev.filter(m => m.text !== "La red estelar está saturada... Recalibrando energía."),
                { id: `local-err-${Date.now()}`, role: 'model', text: "La conexión estelar está inestable. Revisa tu red mística o intenta más tarde." }
            ]);
        } finally {
            setLoading(false);
        }
    };

    return { messages, sendMessage, loading, isHistoryLoading };
}
