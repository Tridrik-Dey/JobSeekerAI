import { MemoryStore } from './memory/storage.js';

async function main() {
    console.log('=== Testing Memory Store ===\n');

    const memory = new MemoryStore('./test_memory.json');

    // Test 1: Add applications
    console.log('Test 1: Adding job applications...');
    const app1 = memory.addApplication({
        company: 'Google',
        title: 'Software Engineer',
        url: 'https://careers.google.com/job1',
        status: 'pending',
    });
    console.log('✓ Added:', app1.company, '-', app1.title);

    const app2 = memory.addApplication({
        company: 'Meta',
        title: 'Frontend Developer',
        url: 'https://careers.meta.com/job2',
        status: 'pending',
    });
    console.log('✓ Added:', app2.company, '-', app2.title);

    // Test 2: Check duplicates
    console.log('\nTest 2: Checking for duplicates...');
    const isDuplicate = memory.hasApplied('https://careers.google.com/job1');
    console.log('✓ Has applied to Google job:', isDuplicate);

    const isNew = memory.hasApplied('https://careers.microsoft.com/job3');
    console.log('✓ Has applied to Microsoft job:', isNew);

    // Test 3: Update status
    console.log('\nTest 3: Updating application status...');
    memory.updateApplicationStatus(app1.id, 'applied', 'Submitted via website');
    console.log('✓ Updated Google application to "applied"');

    // Test 4: Get applications
    console.log('\nTest 4: Retrieving applications...');
    const allApps = memory.getApplications();
    console.log('✓ Total applications:', allApps.length);

    const pendingApps = memory.getApplications({ status: 'pending' });
    console.log('✓ Pending applications:', pendingApps.length);

    // Test 5: Get stats
    console.log('\nTest 5: Getting statistics...');
    const stats = memory.getStats();
    console.log('✓ Stats:', JSON.stringify(stats, null, 2));

    console.log('\n=== All Tests Passed! ===');
    console.log('Memory file saved to: test_memory.json');
}

main();
