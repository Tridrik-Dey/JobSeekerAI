import 'dotenv/config';
import { createActor } from 'xstate';
import { jobberMachine } from './core/orchestrator.js';

async function main() {
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_api_key_here') {
        console.error('ERROR: OPENAI_API_KEY is missing in .env file.');
        console.error('Please add your API key to run the real agent.');
        process.exit(1);
    }

    const actor = createActor(jobberMachine);

    actor.subscribe((snapshot) => {
        console.log('State:', snapshot.value);
        if (snapshot.context.error) {
            console.error('Error:', snapshot.context.error);
        }
        if (snapshot.matches('COMPLETED')) {
            console.log('Workflow Completed!');
            console.log('Results:', snapshot.context.results);
            process.exit(0);
        }
    });

    actor.start();
    // A real goal that the LLM can understand
    actor.send({ type: 'START', goal: 'Search for "AI Engineer" jobs on Google' });
}

main();
