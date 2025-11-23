import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query: string): Promise<string> {
    return new Promise(resolve => rl.question(query, resolve));
}

export async function runSetup() {
    console.log('\n🚀 Welcome to Jobber Setup!\n');

    // Check if .env already exists
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
        const overwrite = await question('.env file already exists. Do you want to reconfigure? (yes/no): ');
        if (overwrite.toLowerCase() !== 'yes' && overwrite.toLowerCase() !== 'y') {
            console.log('Setup cancelled.');
            rl.close();
            return;
        }
    }

    // Ask for provider
    console.log('\nWhich AI provider would you like to use?');
    console.log('1. OpenAI (GPT-4)');
    console.log('2. NVIDIA (Various models)');

    const providerChoice = await question('\nEnter your choice (1 or 2): ');

    let provider: string;
    let apiKey: string;

    if (providerChoice === '1') {
        provider = 'openai';
        console.log('\n📝 You selected OpenAI');
        apiKey = await question('Enter your OpenAI API key: ');

        // Create .env file
        const envContent = `OPENAI_API_KEY=${apiKey}\nNVIDIA_API_KEY=\nAI_PROVIDER=openai\n`;
        fs.writeFileSync(envPath, envContent);

    } else if (providerChoice === '2') {
        provider = 'nvidia';
        console.log('\n📝 You selected NVIDIA');
        apiKey = await question('Enter your NVIDIA API key: ');

        // Create .env file
        const envContent = `OPENAI_API_KEY=\nNVIDIA_API_KEY=${apiKey}\nAI_PROVIDER=nvidia\n`;
        fs.writeFileSync(envPath, envContent);

    } else {
        console.log('❌ Invalid choice. Setup cancelled.');
        rl.close();
        return;
    }

    console.log('\n✅ Setup complete!');
    console.log(`Provider: ${provider.toUpperCase()}`);
    console.log('Configuration saved to .env\n');
    console.log('You can now run: pnpm jobber start "Your goal here"\n');

    rl.close();
}

// Run setup if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runSetup();
}
