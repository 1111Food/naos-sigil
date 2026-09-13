import * as dotenv from 'dotenv'; dotenv.config();
import { config } from './src/config/env';
console.log('SUPABASE_SERVICE_ROLE_KEY loaded:', !!config.SUPABASE_SERVICE_ROLE_KEY);
console.log('GEMINI_MODEL:', config.GEMINI_MODEL);
