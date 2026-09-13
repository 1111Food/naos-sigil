const fs = require('fs');
let content = fs.readFileSync('server/src/modules/energy/engine.ts', 'utf8');

content = content.replace(
    /const apiKey = process.env.GEMINI_API_KEY \|\| '';/g,
    "import { config } from '../../config/env';\nconst apiKey = config.GOOGLE_API_KEY;"
);

content = content.replace(
    /CRITICAL INSTRUCTION: You MUST translate all astrological planets/g,
    Context:\n        Macro (Current Life Cycle): \\n        Meso (Current Month): \\n\n        CRITICAL INSTRUCTION: You MUST translate all astrological planets
);

content = content.replace(
    /"action": "A specific action or habit to perform today",\n\s*"avoid": "What to avoid today"\n\s*\},/g,
    "action": "A specific action or habit to perform today",
                "avoid": "What to avoid today"
            },
            "behavioral": {
                "score": number,
                "title": "Short title of the day's vibe in biohacking/pragmatic terms",
                "description": "2-3 sentences explaining the primary energy of the day from a behavioral perspective.",
                "action": "A pragmatic habit to perform today",
                "avoid": "What behavioral pitfall to avoid today"
            },
);

fs.writeFileSync('server/src/modules/energy/engine.ts', content, 'utf8');
