#!/usr/bin/env node
import 'dotenv/config';
import { createActor } from 'xstate';
import { jobberMachine } from './core/orchestrator.js';
import { MemoryStore } from './memory/storage.js';
import { runSetup } from './setup.js';

const args = process.argv.slice(2);
const command = args[0];

async function startAgent(goal: string) {
    console.log(`🚀 Starting Jobber Agent...`);
    console.log(`Goal: ${goal}\n`);

    const actor = createActor(jobberMachine);

    actor.subscribe((snapshot) => {
        console.log(`📍 State: ${String(snapshot.value)}`);

        if (snapshot.context.error) {
            console.error(`❌ Error: ${snapshot.context.error}`);
        }

        if (snapshot.matches('COMPLETED')) {
            console.log('\n✅ Workflow Completed!');
            console.log('Results:', snapshot.context.results);
            process.exit(0);
        }

        if (snapshot.matches('FAILED')) {
            console.log('\n❌ Workflow Failed!');
            process.exit(1);
        }
    });

    actor.start();
    actor.send({ type: 'START', goal });
}

function listApplications(statusFilter?: string) {
    const memory = new MemoryStore();
    const filter = statusFilter ? { status: statusFilter as any } : undefined;
    const apps = memory.getApplications(filter);

    if (apps.length === 0) {
        console.log('📭 No applications found.');
        return;
    }

    console.log(`\n📋 Job Applications (${apps.length}):\n`);
    apps.forEach((app, index) => {
        const statusEmoji = {
            'pending': '⏳',
            'applied': '✅',
            'rejected': '❌',
            'interview': '📞',
            'offer': '🎉'
        }[app.status] || '📄';

        console.log(`${index + 1}. ${statusEmoji} ${app.company} - ${app.title}`);
        console.log(`   URL: ${app.url}`);
        console.log(`   Status: ${app.status}`);
        console.log(`   Applied: ${new Date(app.appliedAt).toLocaleDateString()}`);
        if (app.notes) {
            console.log(`   Notes: ${app.notes}`);
        }
        console.log('');
    });
}

function showStats() {
    const memory = new MemoryStore();
    const stats = memory.getStats();

    console.log('\n📊 Statistics:\n');
    console.log(`Total Applications: ${stats.totalApplications}`);
    console.log(`Successful: ${stats.successfulApplications} ✅`);
    console.log(`Failed: ${stats.failedApplications} ❌`);

    if (stats.totalApplications > 0) {
        const successRate = ((stats.successfulApplications / stats.totalApplications) * 100).toFixed(1);
        console.log(`Success Rate: ${successRate}%`);
    }
    console.log('');
}

function clearMemory() {
    const memory = new MemoryStore();
    memory.clear();
    console.log('🗑️  Memory cleared successfully!');
}

function showHelp() {
    console.log(`
🤖 Jobber - AI Job Application Agent

Usage:
  jobber <command> [options]

Commands:
  setup                       Run interactive setup wizard
  start "<goal>"              Start the agent with a specific goal
  list [--status <status>]    List job applications (optional status filter)
  stats                       Show application statistics
  clear                       Clear all memory
  help                        Show this help message

Examples:
  jobber setup
  jobber start "Find React developer jobs"
  jobber list
  jobber list --status applied
  jobber stats
  jobber clear

Status values: pending, applied, rejected, interview, offer
`);
}

// Main CLI logic
async function main() {
    if (!command || command === 'help') {
        showHelp();
        return;
    }

    switch (command) {
        case 'setup':
            await runSetup();
            break;

        case 'start':
            const goal = args[1];
            if (!goal) {
                console.error('❌ Error: Please provide a goal.');
                console.log('Usage: jobber start "<goal>"');
                process.exit(1);
            }
            await startAgent(goal);
            break;

        case 'list':
            const statusIndex = args.indexOf('--status');
            const status = statusIndex !== -1 ? args[statusIndex + 1] : undefined;
            listApplications(status);
            break;

        case 'stats':
            showStats();
            break;

        case 'clear':
            clearMemory();
            break;

        default:
            console.error(`❌ Unknown command: ${command}`);
            showHelp();
            process.exit(1);
    }
}

main().catch(console.error);
