const fs = require('fs');

const filesToUpdate = [
    'server/src/modules/relationship/consultant/RelationshipConsultant.ts',
    'server/src/modules/sigil/service.ts',
    'server/src/modules/synastry/GroupOracle.ts',
    'server/src/modules/synastry/SynastryOracle.ts',
    'server/src/services/SynastryOracleService.ts',
    'server/src/routes/interpret.ts',
    'server/src/modules/memory/MemoryPolicy.ts'
];

filesToUpdate.forEach(file => {
    try {
        if (!fs.existsSync(file)) return;
        let content = fs.readFileSync(file, 'utf8');
        let modified = false;

        const replaceStr = (search, replace) => {
            if (content.includes(search)) {
                content = content.split(search).join(replace);
                modified = true;
            }
        };

        replaceStr('models/" + config.GEMINI_MODEL + "', 'models/');

        if (modified) {
            fs.writeFileSync(file, content, 'utf8');
            console.log("Fixed", file);
        }
    } catch (e) {
        console.error("Failed to fix", file, e.message);
    }
});
