const fs = require('fs');
let content = fs.readFileSync('client/src/pages/Sanctuary.tsx', 'utf8');

const oldEffect = /useEffect\(\(\) => \{\s*const urlParams = new URLSearchParams\(window\.location\.search\);\s*if \(urlParams\.get\('upgrade'\) === 'success'\) \{\s*setShowWelcomeArchitect\(true\);\s*refreshProfile\(\); \/\/ Forzar refresh del perfil en background\s*window\.history\.replaceState\(\{\}, document\.title, window\.location\.pathname\);\s*\}\s*\}, \[\]\);/g;

const newEffect =     useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('upgrade') === 'success') {
            setShowWelcomeArchitect(true);
            refreshProfile();
        }
    }, []);

    const handleWelcomeComplete = () => {
        setShowWelcomeArchitect(false);
        window.history.replaceState({}, document.title, window.location.pathname);
    };;

content = content.replace(oldEffect, newEffect);

const oldRender = /<WelcomeArchitectExperience onComplete=\{\(\) => setShowWelcomeArchitect\(false\)\} \/>/g;
const newRender = <WelcomeArchitectExperience onComplete={handleWelcomeComplete} />;
content = content.replace(oldRender, newRender);

fs.writeFileSync('client/src/pages/Sanctuary.tsx', content, 'utf8');
