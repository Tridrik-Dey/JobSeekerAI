import puppeteer, { Browser, Page } from 'puppeteer';
import * as tools from '../../tools/puppeteer-tools.js';

export class BrowserAgent {
    private browser: Browser | null = null;
    private page: Page | null = null;

    async start() {
        this.browser = await puppeteer.launch({ headless: false });
        this.page = await this.browser.newPage();
    }

    async stop() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
            this.page = null;
        }
    }

    async execute(step: string): Promise<string> {
        if (!this.page) {
            throw new Error('Browser not started');
        }

        console.log(`Executing step: ${step}`);
        const lowerStep = step.toLowerCase();

        try {
            // Navigate to URL
            if (lowerStep.includes('navigate to') || lowerStep.includes('go to')) {
                const url = this.extractUrl(step);
                if (url) {
                    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
                    return `Navigated to ${url}`;
                }
            }

            // Search on Google
            if (lowerStep.includes('search for')) {
                const query = step.replace(/search for/i, '').replace(/["']/g, '').trim();
                await this.page.goto('https://www.google.com');
                await tools.fillInput(this.page, 'textarea[name="q"]', query);
                await this.page.keyboard.press('Enter');
                await this.page.waitForNavigation({ waitUntil: 'domcontentloaded' });
                return `Searched for "${query}"`;
            }

            // Click on element
            if (lowerStep.includes('click')) {
                const textToClick = step.replace(/click (on)?/i, '').replace(/["']/g, '').trim();
                const element = await this.page.$(`::-p-text(${textToClick})`);
                if (element) {
                    await element.click();
                    return `Clicked on "${textToClick}"`;
                } else {
                    return `Could not find element with text "${textToClick}"`;
                }
            }

            // Fill form field
            if (lowerStep.includes('fill') && lowerStep.includes('with')) {
                const match = step.match(/fill (.+?) with (.+)/i);
                if (match) {
                    const [, field, value] = match;
                    // Try to find input by placeholder, label, or name
                    const selector = `input[placeholder*="${field}" i], input[name*="${field}" i]`;
                    await tools.fillInput(this.page, selector, value.replace(/["']/g, '').trim());
                    return `Filled "${field}" with "${value}"`;
                }
            }

            // Extract data
            if (lowerStep.includes('extract')) {
                const selector = step.replace(/extract/i, '').trim();
                const text = await tools.extractText(this.page, selector);
                return `Extracted: ${text}`;
            }

            // Take screenshot
            if (lowerStep.includes('screenshot')) {
                const name = step.replace(/screenshot/i, '').trim() || 'page';
                const filepath = await tools.takeScreenshot(this.page, name);
                return `Screenshot saved: ${filepath}`;
            }

            return `Executed (simulated): ${step}`;
        } catch (error) {
            console.error(`Error executing step "${step}":`, error);
            throw error;
        }
    }

    private extractUrl(text: string): string | null {
        const urlRegex = /(https?:\/\/[^\s'"]+)/g;
        const match = text.match(urlRegex);
        if (match) {
            // Remove trailing punctuation like quotes, periods, commas
            return match[0].replace(/['".,;:!?)]+$/, '');
        }
        return null;
    }
}
