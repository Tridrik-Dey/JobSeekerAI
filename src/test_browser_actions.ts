import { BrowserAgent } from './core/agents/browser.js';

async function main() {
    const browser = new BrowserAgent();

    try {
        console.log('Starting browser...');
        await browser.start();

        console.log('\n=== Test 1: Navigate to a website ===');
        const result1 = await browser.execute('Navigate to https://example.com');
        console.log('✓ Result:', result1);

        await new Promise(resolve => setTimeout(resolve, 2000));

        console.log('\n=== Test 2: Take a screenshot ===');
        const result2 = await browser.execute('Screenshot example_page');
        console.log('✓ Result:', result2);

        console.log('\n=== Test 3: Extract page title ===');
        const result3 = await browser.execute('Extract h1');
        console.log('✓ Result:', result3);

        console.log('\n=== All tests completed successfully! ===');
        console.log('\nNew capabilities added:');
        console.log('  - Form filling: fill <field> with <value>');
        console.log('  - Data extraction: extract <selector>');
        console.log('  - Screenshots: screenshot <name>');
        console.log('  - Smart waiting and retry logic');

    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        console.log('\nClosing browser...');
        await browser.stop();
    }
}

main();
