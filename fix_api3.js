const fs = require('fs');
let content = fs.readFileSync('server/src/routes/api.ts', 'utf8');

// Replace offset usages of getUserLocalDate
content = content.replace(/DateUtils\.getUserLocalDate\(currentTimezoneOffset\)/g, "DateUtils.getUserLocalDate(fullProfile)");
content = content.replace(/DateUtils\.getUserLocalDate\(currentTimezoneOffset, now\)/g, "DateUtils.getUserLocalDate(fullProfile, now)");

// Replace userHours logic in api/oracle/daily
const userHoursSearch = `            const now = new Date();
            const userLocal = new Date(now.getTime() + (3600000 * currentTimezoneOffset));
            const userHours = userLocal.getUTCHours();`;
            
const userHoursReplacement = `            const now = new Date();
            const userHours = DateUtils.getUserLocalHour(fullProfile, now);`;

content = content.replace(userHoursSearch, userHoursReplacement);

fs.writeFileSync('server/src/routes/api.ts', content);
