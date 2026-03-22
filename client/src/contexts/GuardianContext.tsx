import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

type GuardianState = 'RESTING' | 'LISTENING' | 'RESPONDING';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'sigil';
    timestamp: string;
    isHistory?: boolean;
    audioUrl?: string;
}

interface SynastryEntry {
    partnerName: string;
    type: string;
    results: any;
    timestamp: string;
}

interface OracleState {
    events: {
        lastTarot?: { card: string; meaning: string; answer: string };
        lastPinnacle?: { position: string; number: number; archetype: string };
        lastAstrology?: string;
        lastOriental?: { animal: string; element: string; depth: boolean };
        lastNahual?: { name: string; meaning: string };
    };
    essence: {
        traits: string[];
        tensions: string[];
        shadows: string[];
        elementalBalance?: string;
    };
    messages: Message[];
    synastryHistory: SynastryEntry[];
    rituals?: {
        day: number;
        checks: Record<string, boolean>;
    };
}

interface GuardianContextType {
    state: GuardianState;
    setState: (state: GuardianState) => void;
    oracleState: OracleState;
    trackEvent: (type: 'TAROT' | 'PINNACLE' | 'ASTRO' | 'ORIENTAL' | 'NAHUAL', data: any) => void;
    refineEssence: (essenceData: Partial<OracleState['essence']>) => void;
    addMessage: (message: Omit<Message, 'timestamp'>) => void;
    addSynastry: (entry: Omit<SynastryEntry, 'timestamp'>) => void;
    saveRituals: (day: number, checks: Record<string, boolean>) => void;
    isHistoryLoading: boolean;
}

const GuardianContext = createContext<GuardianContextType | undefined>(undefined);

export const GuardianProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [state, setState] = useState<GuardianState>('RESTING');
    const [isHistoryLoading, setIsHistoryLoading] = useState(true);
    const [oracleState, setOracleState] = useState<OracleState>(() => {
        const saved = localStorage.getItem('guardian_oracle_state');
        if (saved) {
            try {
                const parsedState = JSON.parse(saved);

                // If it's saved but belongs to a different user, ignore it.
                // We'll hydrate the actual user ID on the first sync if it's missing.
                // But if an ownerId exists and it doesn't match the currently resolving user, we shouldn't use it.
                // However, user is null on mount during first render usually, so we'll just parse it 
                // and let a useEffect clear it if the user resolves to someone else.

                if (parsedState.messages) {
                    parsedState.messages = parsedState.messages.map((msg: Message) => ({
                        ...msg,
                        text: msg.text?.replace(/\bhla\b/gi, 'Saludos').replace(/hla,/gi, 'Saludos,') || msg.text
                    }));
                }
                return parsedState;
            } catch (e) {
                console.error("Failed to parse saved oracle state", e);
            }
        }
        return {
            events: {
                lastAstrology: JSON.stringify({
                    birthDate: '1990-01-01',
                    birthTime: '09:40',
                    name: 'Luis Alfredo Herrera Mendez',
                    location: { lat: 14.6349, lng: -90.5069 }
                })
            },
            essence: {
                traits: [],
                tensions: [],
                shadows: []
            },
            messages: [],
            synastryHistory: []
        };
    });

    // Persistence Effect
    useEffect(() => {
        // Sync only the necessary subset to localStorage
        const syncState = {
            ...oracleState,
            ownerId: user?.id || null, // Attach user ID to the cache
            messages: oracleState.messages.slice(-5), // Last 5 messages
            synastryHistory: oracleState.synastryHistory.slice(-3) // Last 3 queries
        };
        localStorage.setItem('guardian_oracle_state', JSON.stringify(syncState));
    }, [oracleState, user?.id]);

    // Cross-Account Bleed Protection
    useEffect(() => {
        const saved = localStorage.getItem('guardian_oracle_state');
        if (saved && user?.id) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.ownerId && parsed.ownerId !== user.id) {
                    // Different user logged in, nuke the state completely
                    setOracleState({
                        events: {
                            lastAstrology: JSON.stringify({
                                birthDate: '1990-01-01',
                                birthTime: '09:40',
                                name: 'Luis Alfredo Herrera Mendez',
                                location: { lat: 14.6349, lng: -90.5069 }
                            })
                        },
                        essence: { traits: [], tensions: [], shadows: [] },
                        messages: [],
                        synastryHistory: []
                    });
                    localStorage.removeItem('guardian_oracle_state');
                }
            } catch (e) { }
        }
    }, [user?.id]);

    // Load Message History from Supabase
    useEffect(() => {
        if (!user?.id) {
            setIsHistoryLoading(false);
            return;
        }

        const loadHistory = async () => {
            setIsHistoryLoading(true);
            try {
                const { data, error } = await supabase
                    .from('interaction_logs')
                    .select('user_message, sigil_response, created_at, id')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(25);

                if (error) throw error;

                if (data) {
                    const formattedMessages: Message[] = [];
                    [...data].reverse().forEach(log => {
                        formattedMessages.push({
                            id: `u-${log.id}`,
                            text: log.user_message,
                            sender: 'user',
                            timestamp: log.created_at,
                            isHistory: true
                        });
                        if (log.sigil_response) {
                            formattedMessages.push({
                                id: `s-${log.id}`,
                                text: log.sigil_response,
                                sender: 'sigil',
                                timestamp: log.created_at,
                                isHistory: true
                            });
                        }
                    });

                    const sanitizedMessages = formattedMessages.map(msg => ({
                        ...msg,
                        text: msg.text.replace(/\bhla\b/gi, 'Saludos').replace(/hla,/gi, 'Saludos,')
                    }));

                    setOracleState(prev => ({ ...prev, messages: sanitizedMessages }));
                }
            } catch (error) {
                console.error("GuardianContext loadHistory Error:", error);
            } finally {
                setIsHistoryLoading(false);
            }
        };

        if (user?.id) {
            loadHistory();
        }
    }, [user?.id]);

    const trackEvent = useCallback((type: 'TAROT' | 'PINNACLE' | 'ASTRO' | 'ORIENTAL' | 'NAHUAL', data: any) => {
        setOracleState(prev => {
            const newEvents = { ...prev.events };
            if (type === 'TAROT') newEvents.lastTarot = data;
            if (type === 'PINNACLE') newEvents.lastPinnacle = data;
            if (type === 'ASTRO') newEvents.lastAstrology = data;
            if (type === 'ORIENTAL') newEvents.lastOriental = data;
            if (type === 'NAHUAL') newEvents.lastNahual = data;
            return { ...prev, events: newEvents };
        });
    }, []);

    const refineEssence = useCallback((essenceData: Partial<OracleState['essence']>) => {
        setOracleState(prev => ({
            ...prev,
            essence: {
                ...prev.essence,
                ...essenceData,
                traits: Array.from(new Set([...prev.essence.traits, ...(essenceData.traits || [])])),
                tensions: Array.from(new Set([...prev.essence.tensions, ...(essenceData.tensions || [])])),
                shadows: Array.from(new Set([...prev.essence.shadows, ...(essenceData.shadows || [])])),
            }
        }));
    }, []);

    const addMessage = useCallback(async (message: Omit<Message, 'timestamp'>) => {
        const newMessage = { ...message, timestamp: new Date().toISOString() };

        setOracleState(prev => ({
            ...prev,
            messages: [...prev.messages, newMessage].slice(-50)
        }));

        // Persistence is handled by the Backend (SigilService.persistInteraction) 
        // which writes to interaction_logs. We don't need to insert to chat_logs here.
    }, []);

    const addSynastry = useCallback((entry: Omit<SynastryEntry, 'timestamp'>) => {
        setOracleState(prev => ({
            ...prev,
            synastryHistory: [{ ...entry, timestamp: new Date().toISOString() }, ...prev.synastryHistory].slice(0, 10)
        }));
    }, []);

    const saveRituals = useCallback(async (day: number, checks: Record<string, boolean>) => {
        setOracleState(prev => ({
            ...prev,
            rituals: { day, checks }
        }));

        if (user?.id) {
            await supabase.from('rituals').upsert({
                user_id: user.id,
                day_number: day,
                checks: checks,
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id,day_number' });
        }
    }, [user?.id]);

    return (
        <GuardianContext.Provider value={{ state, setState, oracleState, trackEvent, refineEssence, addMessage, addSynastry, saveRituals, isHistoryLoading }}>
            {children}
        </GuardianContext.Provider>
    );
};

export const useGuardianState = () => {
    const context = useContext(GuardianContext);
    if (!context) throw new Error('useGuardianState must be used within a GuardianProvider');
    return context;
};
