import 'dotenv/config';
import { jobberMachine } from './core/orchestrator.js';
import { createActor } from 'xstate';

console.log('Starting Jobber FSM Agent...');

const actor = createActor(jobberMachine);
actor.start();

console.log('Agent started. Current state:', actor.getSnapshot().value);
