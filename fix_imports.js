const fs = require('fs');

let content = fs.readFileSync('client/src/contexts/ProfileContext.tsx', 'utf8');

const line2 = "import { getAsyncAuthHeaders, API_BASE_URL } from '../lib/api';";
const line4 = "import { endpoints, getAsyncAuthHeaders } from '../lib/api';";

content = content.replace(line2, "import { getAsyncAuthHeaders, API_BASE_URL, endpoints } from '../lib/api';");
content = content.replace(line4, "");
content = content.replace("import { endpoints } from '../lib/api';\n", "");

fs.writeFileSync('client/src/contexts/ProfileContext.tsx', content);
console.log("Fixed imports");
