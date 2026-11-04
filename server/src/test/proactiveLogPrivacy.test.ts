import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Source-level privacy gate; behavioral delivery tests are covered separately.
const notificationSource = readFileSync(resolve(__dirname, '../modules/notifications/NotificationEngine.ts'), 'utf8');
const mcpSource = readFileSync(resolve(__dirname, '../mcp/naos-mcp-server.ts'), 'utf8');

function loggingStatements(source: string): string[] {
    return source.split(/\r?\n/).filter(line => /console\.(?:log|info|warn|error)\s*\(/.test(line));
}

describe('Proactive notification log privacy guard', () => {
    it('does not interpolate user email or user ID into notification logs', () => {
        for (const line of loggingStatements(notificationSource)) {
            expect(line).not.toMatch(/\$\{user\.(?:email|id)\}/);
        }
    });

    it('does not serialize raw provider and database errors in notification logs', () => {
        for (const line of loggingStatements(notificationSource)) {
            expect(line).not.toMatch(/,\s*(?:err\.message|e|error)\s*\)/);
        }
    });

    it('does not interpolate raw user, chat, module or aspect values into MCP logs', () => {
        for (const line of loggingStatements(mcpSource)) {
            expect(line).not.toMatch(/\$\{(?:userId|telegramChatId|moduleType|aspect)\}/);
        }
    });

    it('preserves operational success and failure log markers', () => {
        expect(notificationSource).toContain('[NOTIF]');
        expect(notificationSource).toContain('NOTIFICATION_CYCLE_FAILURE');
        expect(mcpSource).toContain('[MCP_SIGIL]');
        expect(mcpSource).toContain('sendProactiveMessage');
    });
});
