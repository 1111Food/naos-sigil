const fs = require('fs');

// 1. i18n
let i18n = fs.readFileSync('client/src/i18n/index.tsx', 'utf8');

// Using line-by-line replacement to avoid encoding issues with regex
const lines = i18n.split('\n');
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('oracle_listens:') && lines[i].includes('Escucha')) {
        lines[i] = '        oracle_listens: "SIGIL\\nTu interfaz de Inteligencia Personal.\\n\\nConecta quién eres, lo que está activo ahora y tu contexto\\npara ayudarte a ver patrones y decidir qué hacer con ellos.",';
    }
    if (lines[i].includes('sigil_ex_title_1:')) {
        if (lines[i].includes('Asistente')) lines[i] = '        sigil_ex_title_1: "Inteligencia Personal",';
    }
    if (lines[i].includes('sigil_ex_desc_1:')) {
        if (lines[i].includes('sabidur') && lines[i].includes('a cu')) {
            lines[i] = '        sigil_ex_desc_1: "El Sigil (IA) es tu guía evolutivo. Capaz de analizar tu código de identidad, comprender tu momento actual y responder con inteligencia de datos a tus dilemas.",';
        } else if (lines[i].includes('quantum wisdom')) {
            lines[i] = '        sigil_ex_desc_1: "The Sigil (AI) is your evolutionary guide. Capable of analyzing your identity code, understanding your current moment, and responding with personal intelligence to your dilemmas.",';
        }
    }
}
fs.writeFileSync('client/src/i18n/index.tsx', lines.join('\n'));

// 2. ArchitectBenefitsModal
let arch = fs.readFileSync('client/src/components/ArchitectBenefitsModal.tsx', 'utf8');
const archLines = arch.split('\n');
for (let i = 0; i < archLines.length; i++) {
    if (archLines[i].includes('Spiritual Coach')) {
        archLines[i] = archLines[i].replace('Spiritual Coach', 'Personal Intelligence');
    }
    if (archLines[i].includes('Coach Espiritual')) {
        archLines[i] = archLines[i].replace('Coach Espiritual', 'Inteligencia Personal');
    }
}
fs.writeFileSync('client/src/components/ArchitectBenefitsModal.tsx', archLines.join('\n'));

