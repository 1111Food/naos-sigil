import { config } from './config/env';
const t = config.TELEGRAM_BOT_TOKEN;
console.log('Token snippet:', t ? t.substring(0,5) + '...' + t.slice(-5) : 'MISSING');
