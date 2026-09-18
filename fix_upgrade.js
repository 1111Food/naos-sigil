const fs = require('fs');
let content = fs.readFileSync('client/src/components/UpgradeModal.tsx', 'utf8');

// Needs useProfile imported
if (!content.includes('useProfile')) {
    content = content.replace("import { Lock, Sparkles, X, ShieldAlert, Zap, Globe, Cpu } from 'lucide-react';", "import { Lock, Sparkles, X, ShieldAlert, Zap, Globe, Cpu } from 'lucide-react';\nimport { useProfile } from '../hooks/useProfile';");
}

if (!content.includes('const { profile } = useProfile();')) {
    content = content.replace("export const UpgradeModal: React.FC<UpgradeModalProps> = ({ feature, onClose }) => {", "export const UpgradeModal: React.FC<UpgradeModalProps> = ({ feature, onClose }) => {\n    const { profile } = useProfile();\n    const archName = profile?.canonical_archetype?.nombre || 'Arquitecto';");
}

let newContent = content.replace(/Acceso restringido al Arquitecto/g, 'Acceso restringido al {archName}');
newContent = newContent.replace(/al nivel de Arquitecto/g, 'al nivel de {archName}');
newContent = newContent.replace(/Modo Arquitecto/g, 'Modo {archName}');
newContent = newContent.replace(/'Acceso restringido al \{archName\}'/g, '`Acceso restringido al ${archName}`');
newContent = newContent.replace(/"Acceso restringido al \{archName\}"/g, '`Acceso restringido al ${archName}`');
newContent = newContent.replace(/"Para gestionar múltiples arquitecturas humanas simultáneamente, expande tu acceso al nivel de \{archName\}."/g, '`Para gestionar múltiples arquitecturas humanas simultáneamente, expande tu acceso al nivel de ${archName}.`');
newContent = newContent.replace(/Plan Seleccionado: Modo \{archName\}/g, 'Plan Seleccionado: Modo ${archName}');
newContent = newContent.replace(/Activar Modo \{archName\}/g, 'Activar Modo {archName}');


fs.writeFileSync('client/src/components/UpgradeModal.tsx', newContent);
