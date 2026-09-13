const fs = require("fs");
let content = fs.readFileSync("client/src/pages/Sanctuary.tsx", "utf8");
const targetStr = `        <motion.div\n            initial={{ opacity: 0 }}\n            animate={{ opacity: 1 }}\n            exit={{ opacity: 0 }}\n            className="fixed inset-0 z-50 bg-transparent flex flex-col overflow-hidden"\n        >`;
const replacement = targetStr + `\n            {showWelcomeArchitect && (\n                <WelcomeArchitectExperience onComplete={() => setShowWelcomeArchitect(false)} />\n            )}`;
content = content.replace(targetStr, replacement);
fs.writeFileSync("client/src/pages/Sanctuary.tsx", content, "utf8");
