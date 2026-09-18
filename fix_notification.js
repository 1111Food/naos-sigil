const fs = require('fs');
let content = fs.readFileSync('server/src/modules/notifications/NotificationEngine.ts', 'utf8');

const search = `                const offset = DateUtils.getCurrentTimezoneOffset(user);
                
                const userLocal = new Date(now.getTime() + (3600000 * offset));
                const userHours = String(userLocal.getUTCHours()).padStart(2, '0');
                const userMins = String(userLocal.getUTCMinutes()).padStart(2, '0');
                const userTimeStr = \`\${userHours}:\${userMins}\`;
                const userDateStr = userLocal.toISOString().split('T')[0];`;

const replacement = `                const offset = DateUtils.getCurrentTimezoneOffset(user);
                const iana = DateUtils.getCurrentTimezoneIana(user);
                let userTimeStr = '';
                let userDateStr = '';
                
                if (iana) {
                    const timeFormatter = new Intl.DateTimeFormat('en-US', { timeZone: iana, hour: '2-digit', minute: '2-digit', hour12: false });
                    const parts = timeFormatter.formatToParts(now);
                    let h = parts.find(p => p.type === 'hour').value;
                    let m = parts.find(p => p.type === 'minute').value;
                    if (h === '24') h = '00';
                    userTimeStr = \`\${h}:\${m}\`;
                    
                    const dateFormatter = new Intl.DateTimeFormat('en-CA', { timeZone: iana, year: 'numeric', month: '2-digit', day: '2-digit' });
                    userDateStr = dateFormatter.format(now).replace(/\\//g, '-');
                } else {
                    const userLocal = new Date(now.getTime() + (3600000 * offset));
                    const userHours = String(userLocal.getUTCHours()).padStart(2, '0');
                    const userMins = String(userLocal.getUTCMinutes()).padStart(2, '0');
                    userTimeStr = \`\${userHours}:\${userMins}\`;
                    
                    const year = userLocal.getUTCFullYear();
                    const month = String(userLocal.getUTCMonth() + 1).padStart(2, '0');
                    const day = String(userLocal.getUTCDate()).padStart(2, '0');
                    userDateStr = \`\${year}-\${month}-\${day}\`;
                }`;

content = content.replace(search, replacement);
fs.writeFileSync('server/src/modules/notifications/NotificationEngine.ts', content);
