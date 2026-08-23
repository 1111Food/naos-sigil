import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe('NAOS Full Product Experience Audit', () => {
    let consoleLogs: any[] = [];
    let networkErrors: any[] = [];
    let performanceMetrics: any = {};
    
    const TARGET_URL = 'http://localhost:5173/review/full';
    
    // Config outputs
    const ARTIFACTS_DIR = path.join(__dirname, 'artifacts', 'naos-playwright');
    
    test.beforeAll(async () => {
        fs.mkdirSync(path.join(ARTIFACTS_DIR, 'screenshots', 'desktop'), { recursive: true });
        fs.mkdirSync(path.join(ARTIFACTS_DIR, 'screenshots', 'mobile'), { recursive: true });
        fs.mkdirSync(path.join(ARTIFACTS_DIR, 'dom'), { recursive: true });
    });

    test.beforeEach(async ({ page }) => {
        consoleLogs = [];
        networkErrors = [];

        page.on('console', msg => {
            if (msg.type() === 'error' || msg.type() === 'warning') {
                consoleLogs.push({ type: msg.type(), text: msg.text() });
            }
        });

        page.on('pageerror', err => {
            consoleLogs.push({ type: 'pageerror', text: err.message });
        });

        page.on('response', response => {
            if (response.status() >= 400) {
                networkErrors.push({ url: response.url(), status: response.status() });
            }
        });
    });

    test('Automated Walkthrough (Desktop)', async ({ page }) => {
        // 1. Landing / First Revelation
        await page.goto(TARGET_URL, { waitUntil: 'networkidle' });
        
        await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'screenshots', 'desktop', '1-initial_load.png'), fullPage: true });
        const initialDom = await page.content();
        fs.writeFileSync(path.join(ARTIFACTS_DIR, 'dom', '1-initial_load.html'), initialDom);
        
        // Medir tiempos
        const timing = await page.evaluate(() => JSON.stringify(window.performance.timing));
        performanceMetrics.initialLoad = JSON.parse(timing);

        // Interactuar (Asumimos que el Sigilo o Botones del Temple están visibles)
        // Check for specific elements in the UI
        try {
            await page.waitForTimeout(3000); // Wait for settlement
            await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'screenshots', 'desktop', '2-settled_temple.png'), fullPage: true });

            // Click Sigil (assuming clicking the orb opens chat)
            // Using a generic selector, might need adjustment if actual DOM is strictly different
            const sigilOrbs = await page.$$('img[alt="Sigil"]');
            if (sigilOrbs.length > 0) {
                await sigilOrbs[0].click();
                await page.waitForTimeout(2000);
                
                // Typing in chat
                const input = await page.$('input[type="text"]');
                if (input) {
                    const startSigil = Date.now();
                    await input.fill('What should I focus on today?');
                    await input.press('Enter');
                    
                    // Wait for response text to stream/appear
                    await page.waitForTimeout(8000); // 8 seconds for AI response buffer
                    performanceMetrics.sigilLatencyMs = Date.now() - startSigil;

                    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'screenshots', 'desktop', '3-sigil_response.png'), fullPage: true });
                    const chatDom = await page.content();
                    fs.writeFileSync(path.join(ARTIFACTS_DIR, 'dom', '3-sigil_chat.html'), chatDom);
                }
            }

            // Write Output
            const results = {
                consoleErrors: consoleLogs,
                networkFailures: networkErrors,
                performance: performanceMetrics
            };
            
            fs.writeFileSync(path.join(ARTIFACTS_DIR, 'NAOS_PLAYWRIGHT_RESULTS.json'), JSON.stringify(results, null, 2));

        } catch (e: any) {
            console.error("Walkthrough interruption: ", e.message);
        }
    });
});
