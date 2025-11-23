import { Page, ElementHandle } from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Fill an input field with a value
 */
export async function fillInput(
    page: Page,
    selector: string,
    value: string,
    options: { clear?: boolean; delay?: number } = {}
): Promise<void> {
    const { clear = true, delay = 50 } = options;

    await page.waitForSelector(selector, { timeout: 10000 });

    if (clear) {
        await page.click(selector, { clickCount: 3 }); // Select all
        await page.keyboard.press('Backspace');
    }

    await page.type(selector, value, { delay });
}

/**
 * Click an element with retry logic
 */
export async function clickElement(
    page: Page,
    selector: string,
    options: { timeout?: number; retries?: number } = {}
): Promise<void> {
    const { timeout = 10000, retries = 3 } = options;

    for (let i = 0; i < retries; i++) {
        try {
            await page.waitForSelector(selector, { timeout });
            await page.click(selector);
            return;
        } catch (error) {
            if (i === retries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
}

/**
 * Extract text from an element
 */
export async function extractText(
    page: Page,
    selector: string
): Promise<string | null> {
    try {
        await page.waitForSelector(selector, { timeout: 5000 });
        const text = await page.$eval(selector, el => el.textContent?.trim() || '');
        return text;
    } catch (error) {
        console.warn(`Could not extract text from selector: ${selector}`);
        return null;
    }
}

/**
 * Extract multiple elements' text
 */
export async function extractMultipleText(
    page: Page,
    selector: string
): Promise<string[]> {
    try {
        await page.waitForSelector(selector, { timeout: 5000 });
        const texts = await page.$$eval(selector, elements =>
            elements.map(el => el.textContent?.trim() || '')
        );
        return texts;
    } catch (error) {
        console.warn(`Could not extract multiple text from selector: ${selector}`);
        return [];
    }
}

/**
 * Take a screenshot
 */
export async function takeScreenshot(
    page: Page,
    name: string,
    options: { fullPage?: boolean; directory?: string } = {}
): Promise<string> {
    const { fullPage = true, directory = './screenshots' } = options;

    // Ensure directory exists
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${name}_${timestamp}.png`;
    const filepath = path.join(directory, filename);

    await page.screenshot({ path: filepath, fullPage });
    console.log(`Screenshot saved: ${filepath}`);

    return filepath;
}

/**
 * Wait for an element to appear
 */
export async function waitForElement(
    page: Page,
    selector: string,
    timeout: number = 10000
): Promise<ElementHandle | null> {
    try {
        const element = await page.waitForSelector(selector, { timeout });
        return element;
    } catch (error) {
        console.warn(`Element not found: ${selector}`);
        return null;
    }
}

/**
 * Check if element exists
 */
export async function elementExists(
    page: Page,
    selector: string
): Promise<boolean> {
    const element = await page.$(selector);
    return element !== null;
}

/**
 * Extract structured data from a page
 */
export async function extractData(
    page: Page,
    schema: Record<string, string>
): Promise<Record<string, string | null>> {
    const result: Record<string, string | null> = {};

    for (const [key, selector] of Object.entries(schema)) {
        result[key] = await extractText(page, selector);
    }

    return result;
}

/**
 * Fill a form with multiple fields
 */
export async function fillForm(
    page: Page,
    fields: Record<string, string>
): Promise<void> {
    for (const [selector, value] of Object.entries(fields)) {
        await fillInput(page, selector, value);
    }
}
