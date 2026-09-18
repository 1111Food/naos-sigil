const fs = require('fs');
let content = fs.readFileSync('client/src/components/PWAInstallButton.tsx', 'utf8');

const search = `    useEffect(() => {
        // 1. Detect already installed via display-mode or iOS standalone
        const checkStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
        if (checkStandalone) {
            setIsInstalled(true);
            setIsStandalone(true);
        }`;

const replacement = `    useEffect(() => {
        // 1. Detect already installed via display-mode or iOS standalone
        const checkStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
        if (checkStandalone) {
            setIsInstalled(true);
            setIsStandalone(true);
        }

        // 1.5. Detect if installed via getInstalledRelatedApps
        if ('getInstalledRelatedApps' in navigator) {
            (navigator as any).getInstalledRelatedApps().then((relatedApps: any[]) => {
                if (relatedApps.length > 0) {
                    setIsInstalled(true);
                }
            });
        }`;

content = content.replace(search, replacement);

// The user states: "Where reliable browser APIs allow it, an already-installed state may show: Open NAOS or hide installation CTA according to existing UX."
// We hide it if isInstalled is true. 
fs.writeFileSync('client/src/components/PWAInstallButton.tsx', content);
