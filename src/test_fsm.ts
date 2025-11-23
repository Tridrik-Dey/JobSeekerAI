import { createActor } from 'xstate';
import { jobberMachine } from './core/orchestrator.js';

async function main() {
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
    actor.send({ type: 'START', goal: 'Find a software engineer job' });
}

main();
