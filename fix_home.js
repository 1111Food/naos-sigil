const fs = require('fs');
let content = fs.readFileSync('client/src/pages/Home.tsx', 'utf8');

const searchHome = `                              <span className="text-[10px] uppercase tracking-widest text-amber-400/90 font-bold">
                                {language === 'en' ? 'Architect Mode Active' : 'Modo Arquitecto Activo'}
                              </span>`;
                              
const replaceHome = `                              <span className="text-[10px] uppercase tracking-widest text-amber-400/90 font-bold">
                                {language === 'en' ? (profile?.canonical_archetype?.nombre_en || profile?.canonical_archetype?.nombre || 'Architect') + ' Mode Active' : 'Modo ' + (profile?.canonical_archetype?.nombre || 'Arquitecto') + ' Activo'}
                              </span>`;

content = content.replace(searchHome, replaceHome);
fs.writeFileSync('client/src/pages/Home.tsx', content);
