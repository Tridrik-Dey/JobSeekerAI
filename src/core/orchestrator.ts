import { setup, assign, fromPromise } from 'xstate';
import { PlannerAgent } from './agents/planner.js';
import { BrowserAgent } from './agents/browser.js';
import { MemoryStore } from '../memory/storage.js';

export interface JobberContext {
    goal: string;
    plan: string[];
    currentStep: number;
    results: string[];
    error?: string;
    planner: PlannerAgent;
    browser: BrowserAgent;
    memory: MemoryStore;
}

export type JobberEvent =
    | { type: 'START'; goal: string }
    | { type: 'PLAN_CREATED'; plan: string[] }
    | { type: 'STEP_COMPLETED'; result: string }
    | { type: 'STEP_FAILED'; error: string }
    | { type: 'RETRY' }
    | { type: 'ABORT' };

export const jobberMachine = setup({
    types: {
        context: {} as JobberContext,
        events: {} as JobberEvent,
    },
    actors: {
        planner: fromPromise(async ({ input }: { input: { goal: string, agent: PlannerAgent } }) => {
            return await input.agent.plan(input.goal);
        }),
        browser: fromPromise(async ({ input }: { input: { step: string, agent: BrowserAgent } }) => {
            return await input.agent.execute(input.step);
        }),
    }
}).createMachine({
    id: 'jobber',
    initial: 'IDLE',
    context: {
        goal: '',
        plan: [],
        currentStep: 0,
        results: [],
        planner: new PlannerAgent(),
        browser: new BrowserAgent(),
        memory: new MemoryStore(),
    },
    states: {
        IDLE: {
            on: {
                START: {
                    target: 'PLANNING',
                    actions: assign({ goal: ({ event }) => event.goal })
                }
            }
        },
        PLANNING: {
            invoke: {
                src: 'planner',
                input: ({ context }) => ({ goal: context.goal, agent: context.planner }),
                onDone: {
                    target: 'STARTING_BROWSER',
                    actions: assign({
                        plan: ({ event }) => event.output.steps
                    })
                },
                onError: {
                    target: 'FAILED',
                    actions: assign({ error: ({ event }) => String(event.error) })
                }
            }
        },
        STARTING_BROWSER: {
            invoke: {
                src: fromPromise(async ({ input }: { input: BrowserAgent }) => {
                    await input.start();
                }),
                input: ({ context }) => context.browser,
                onDone: {
                    target: 'EXECUTING'
                },
                onError: {
                    target: 'FAILED',
                    actions: assign({ error: ({ event }) => String(event.error) })
                }
            }
        },
        EXECUTING: {
            invoke: {
                src: 'browser',
                input: ({ context }) => ({
                    step: context.plan[context.currentStep],
                    agent: context.browser
                }),
                onDone: {
                    actions: assign({
                        results: ({ context, event }) => [...context.results, event.output],
                        currentStep: ({ context }) => context.currentStep + 1
                    }),
                    target: 'CHECK_COMPLETION'
                },
                onError: {
                    target: 'FAILED',
                    actions: assign({ error: ({ event }) => String(event.error) })
                }
            }
        },
        CHECK_COMPLETION: {
            always: [
                {
                    guard: ({ context }) => context.currentStep >= context.plan.length,
                    target: 'COMPLETED'
                },
                {
                    target: 'EXECUTING'
                }
            ]
        },
        COMPLETED: {
            entry: async ({ context }) => {
                await context.browser.stop();
            },
            type: 'final'
        },
        FAILED: {
            entry: async ({ context }) => {
                await context.browser.stop();
            },
            on: {
                RETRY: {
                    target: 'PLANNING',
                    actions: assign({
                        currentStep: 0,
                        results: [],
                        error: undefined
                    })
                },
                ABORT: 'IDLE'
            }
        }
    },
});
