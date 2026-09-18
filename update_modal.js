const fs = require('fs');
let content = fs.readFileSync('client/src/components/FrecuenciaDiaModal.tsx', 'utf8');

const search = `                    {/* Texto Principal */}
                    <div className="space-y-4">`;

const replacement = `                    {/* Vigía Cósmico Transmissions */}
                    {data.transmissions && data.transmissions.length > 0 && (
                        <div className="space-y-4 mb-4">
                            {data.transmissions.map((t, i) => (
                                <div key={i} className="bg-naos-gold/10 border border-naos-gold/20 rounded-2xl p-4 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-naos-gold" />
                                    <p className="text-naos-gold text-xs uppercase tracking-widest font-semibold mb-2">
                                        VIGÍA CÓSMICO — {t.moment}
                                    </p>
                                    <p className="text-white/90 text-sm font-light leading-relaxed whitespace-pre-wrap">
                                        {t.transmission}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Texto Principal */}
                    <div className="space-y-4">`;

content = content.replace(search, replacement);
fs.writeFileSync('client/src/components/FrecuenciaDiaModal.tsx', content);
