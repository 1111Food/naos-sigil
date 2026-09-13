const fs = require('fs');
let content = fs.readFileSync('client/src/pages/CurrentEnergyView.tsx', 'utf8');

// Insert buttons
content = content.replace(
    /<\/div>\s*<div className="grid md:grid-cols-3 gap-6 mb-12">/,
    \                <div className="inline-flex bg-black/40 p-1.5 rounded-full border border-white/10 mb-8 backdrop-blur-sm">
                    <button
                        onClick={() => setViewMode('symbolic')}
                        className={\\\px-6 py-2 rounded-full text-xs uppercase tracking-widest font-bold transition-all duration-300 \\\\}
                    >
                        Simbólico
                    </button>
                    <button
                        onClick={() => setViewMode('behavioral')}
                        className={\\\px-6 py-2 rounded-full text-xs uppercase tracking-widest font-bold transition-all duration-300 \\\\}
                    >
                        Conductual
                    </button>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-12">\
);

// Update fields
content = content.replace(
    /\{energy\.daily\.title\}/g,
    "{viewMode === 'symbolic' ? energy.daily.title : (energy.behavioral?.title || energy.daily.title)}"
);
content = content.replace(
    /\{energy\.daily\.description\}/g,
    "{viewMode === 'symbolic' ? energy.daily.description : (energy.behavioral?.description || energy.daily.description)}"
);
content = content.replace(
    /\{energy\.daily\.action\}/g,
    "{viewMode === 'symbolic' ? energy.daily.action : (energy.behavioral?.action || energy.daily.action)}"
);
content = content.replace(
    /\{energy\.daily\.avoid\}/g,
    "{viewMode === 'symbolic' ? energy.daily.avoid : (energy.behavioral?.avoid || energy.daily.avoid)}"
);
content = content.replace(
    /\{energy\.daily\.score\}/g,
    "{viewMode === 'symbolic' ? energy.daily.score : (energy.behavioral?.score || energy.daily.score)}"
);

fs.writeFileSync('client/src/pages/CurrentEnergyView.tsx', content, 'utf8');
