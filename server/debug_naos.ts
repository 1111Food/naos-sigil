
import { NaosCompilerService } from './src/modules/user/naosCompiler.service';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '.env') });

const supabase = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_ANON_KEY || '');

async function debug() {
    const userId = 'a9b60edd-55ae-4bab-bf5e-a7a1141eb46b';
    console.log(`🔍 Debugging user: ${userId}`);

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (!profile) {
        console.error("❌ Profile not found");
        return;
    }

    console.log("📂 RAW Profile:", JSON.stringify(profile, null, 2));

    // @ts-ignore (Accessing private method for debugging)
    const bible = await NaosCompilerService.consolidateBible(profile);
    console.log("📖 Consolidated Bible:", JSON.stringify(bible, null, 2));
}

debug();
