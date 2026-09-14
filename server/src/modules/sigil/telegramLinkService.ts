import { supabase } from '../../lib/supabase';
import * as crypto from 'crypto';

export class TelegramLinkService {
    static async generateToken(userId: string): Promise<string> {
        const jti = crypto.randomUUID();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        
        const { error } = await supabase
            .from('telegram_link_tokens')
            .insert({
                jti,
                user_id: userId,
                expires_at: expiresAt.toISOString()
            });
            
        if (error) {
            console.error('[TELEGRAM] Error generating link token:', error);
            throw new Error('Failed to generate link token');
        }
        
        return jti; // For this simple opaque token implementation, jti IS the token.
    }
    
    static async consumeToken(jti: string, telegramChatId: string): Promise<string> {
        // 1. Find token
        const { data: token, error: findError } = await supabase
            .from('telegram_link_tokens')
            .select('user_id, expires_at, consumed_at')
            .eq('jti', jti)
            .maybeSingle();
            
        if (findError || !token) throw new Error('invalid_token');
        if (token.consumed_at) throw new Error('consumed_token');
        if (new Date(token.expires_at) < new Date()) throw new Error('expired_token');
        
        const userId = token.user_id;
        
        // 2. Mark consumed
        const { error: consumeError } = await supabase
            .from('telegram_link_tokens')
            .update({ consumed_at: new Date().toISOString() })
            .eq('jti', jti);
            
        if (consumeError) throw new Error('consume_failed');
        
        // 3. Check if Telegram Chat is already linked to another NAOS user
        const { data: existingChat, error: checkChatError } = await supabase
            .from('profiles')
            .select('id')
            .eq('telegram_chat_id', telegramChatId)
            .maybeSingle();
            
        if (existingChat && existingChat.id !== userId) {
            // Already linked to someone else!
            throw new Error('chat_already_linked');
        }
        
        // 4. Update Profile
        const { error: linkError } = await supabase
            .from('profiles')
            .update({ telegram_chat_id: telegramChatId })
            .eq('id', userId);
            
        if (linkError) throw new Error('link_failed');
        
        return userId;
    }
}

