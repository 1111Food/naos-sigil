const fs = require('fs');
let content = fs.readFileSync('client/src/components/WelcomeArchitectExperience.tsx', 'utf8');

// Needs useProfile imported
if (!content.includes('useProfile')) {
    content = content.replace("import { useTranslation } from '../i18n';", "import { useTranslation } from '../i18n';\nimport { useProfile } from '../hooks/useProfile';");
}

if (!content.includes('const { profile } = useProfile();')) {
    content = content.replace("const { t, language } = useTranslation();", "const { t, language } = useTranslation();\n    const { profile } = useProfile();");
}

let newContent = content.replace(/isEn \? "NAOS ARCHITECT" : "NAOS ARQUITECTO"/g, 'isEn ? `NAOS ${profile?.canonical_archetype?.nombre_en?.toUpperCase() || "ARCHITECT"}` : `NAOS ${profile?.canonical_archetype?.nombre?.toUpperCase() || "ARQUITECTO"}`');

newContent = newContent.replace(/isEn \? "WELCOME, ARCHITECT" : "BIENVENIDO,\\nARQUITECTO"/g, 'isEn ? `WELCOME, ${profile?.canonical_archetype?.nombre_en?.toUpperCase() || "ARCHITECT"}` : `BIENVENIDO,\\n${profile?.canonical_archetype?.nombre?.toUpperCase() || "ARQUITECTO"}`');

newContent = newContent.replace(/isEn \? "NAOS ARCHITECT\\nIS ACTIVE" : "NAOS ARQUITECTO\\nESTÁ ACTIVO"/g, 'isEn ? `NAOS ${profile?.canonical_archetype?.nombre_en?.toUpperCase() || "ARCHITECT"}\\nIS ACTIVE` : `NAOS ${profile?.canonical_archetype?.nombre?.toUpperCase() || "ARQUITECTO"}\\nESTÁ ACTIVO`');

fs.writeFileSync('client/src/components/WelcomeArchitectExperience.tsx', newContent);
