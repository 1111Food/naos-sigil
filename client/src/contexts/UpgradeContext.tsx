import React, { createContext, useContext, useState, useCallback } from 'react';
import { UpgradeModal } from '../components/UpgradeModal';

type FeatureType = 'sigil' | 'synastry' | 'protocol' | 'evolution' | 'profile';

interface UpgradeContextType {
    triggerUpgrade: (feature: FeatureType) => void;
}

const UpgradeContext = createContext<UpgradeContextType | undefined>(undefined);

export const UpgradeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [feature, setFeature] = useState<FeatureType>('sigil');

    const triggerUpgrade = useCallback((feat: FeatureType) => {
        setFeature(feat);
        setIsOpen(true);
    }, []);

    const handleClose = () => setIsOpen(false);

    return (
        <UpgradeContext.Provider value={{ triggerUpgrade }}>
            {children}
            <UpgradeModal 
                isOpen={isOpen} 
                feature={feature} 
                onClose={handleClose} 
            />
        </UpgradeContext.Provider>
    );
};

export const useUpgrade = () => {
    const context = useContext(UpgradeContext);
    if (!context) {
        throw new Error("useUpgrade must be used within an UpgradeProvider");
    }
    return context;
};
