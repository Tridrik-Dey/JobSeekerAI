# 🤖 JobSeekerAI - AI-Powered Job Application Agent

An intelligent, autonomous job application agent built with TypeScript, XState, Puppeteer, and LangChain. This project uses AI to automate the job search and application process through web browser automation.

> ⚠️ **Important**: This project is in its **foundational stage**. The core infrastructure is complete and working, but there are many opportunities for enhancement and improvement.

---

## 🎯 Project Status

### ✅ **Completed - Solid Foundation**

- **AI Planning System**: Uses GPT-4 (via OpenAI or OpenRouter) to generate step-by-step plans for job search goals
- **State Machine Orchestration**: XState-based FSM manages workflow states (IDLE → PLANNING → EXECUTING → COMPLETED/FAILED)
- **Browser Automation**: Puppeteer integration for web navigation and interaction
- **CLI Interface**: Command-line tool with multiple commands (start, list, stats, clear, setup)
- **Memory System**: JSON-based storage for tracking job applications and statistics
- **Multi-Provider Support**: Works with OpenAI, OpenRouter, and NVIDIA APIs
- **Error Handling**: Graceful error handling and state recovery

### 🚧 **Future Enhancements (Not Yet Implemented)**

- **Advanced Element Detection**: Improve browser agent's ability to locate and interact with UI elements
- **Job Site Integration**: Direct integration with LinkedIn, Indeed, Glassdoor, etc.
- **Resume Parsing**: Extract and use resume information for applications
- **Cover Letter Generation**: AI-generated personalized cover letters
- **Application Tracking**: Enhanced tracking with status updates and notifications
- **Multi-tab Support**: Handle multiple job applications simultaneously
- **Smart Retry Logic**: Retry failed applications with different strategies
- **Analytics Dashboard**: Visual dashboard for application statistics
- **Email Integration**: Track application responses and follow-ups
- **Interview Scheduling**: Automated interview scheduling and reminders

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **pnpm** (v10.23.0 or higher)
- **API Key** from one of the following providers:
  - [OpenAI](https://platform.openai.com/api-keys) (Recommended)
  - [OpenRouter](https://openrouter.ai/) (Alternative, supports multiple models)
  - [NVIDIA](https://build.nvidia.com/) (Alternative)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/JobSeekerAI.git
   cd JobSeekerAI
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Configure your API key**

   **Option A: Using the Setup Wizard (Recommended)**
   ```bash
   npm run jobber setup
   ```
   
   The wizard will guide you through:
   - Selecting your AI provider (OpenAI, NVIDIA)
   - Entering your API key
   - Saving the configuration

   **Option B: Manual Configuration**
   
   Create a `.env` file in the root directory:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your API key:
   ```env
   # For OpenAI
   OPENAI_API_KEY=your_openai_api_key_here
   AI_PROVIDER=openai
   
   # OR for OpenRouter
   OPENAI_API_KEY=your_openrouter_api_key_here
   AI_PROVIDER=openai
   
   # OR for NVIDIA
   NVIDIA_API_KEY=your_nvidia_api_key_here
   AI_PROVIDER=nvidia
   ```

   > ⚠️ **Security Note**: Never commit your `.env` file to version control. It's already included in `.gitignore`.

---

## 📖 Usage

### Basic Commands

```bash
# Show help and available commands
npm run jobber help

# Run the interactive setup wizard
npm run jobber setup

# Start the agent with a goal
npm run jobber start "Search for Software Engineer jobs on LinkedIn"

# List all job applications
npm run jobber list

# List applications by status
npm run jobber list --status applied

# View application statistics
npm run jobber stats

# Clear all memory
npm run jobber clear
```

### Example Workflows

**1. Search for jobs on Google**
```bash
npm run jobber start "Search for AI Engineer jobs on Google"
```

**2. Find React developer positions**
```bash
npm run jobber start "Find React developer jobs"
```

**3. Check your application status**
```bash
npm run jobber list
npm run jobber stats
```

---

## 🏗️ Architecture

### Project Structure

```
JobSeekerAI-main/
├── src/
│   ├── core/
│   │   ├── agents/
│   │   │   ├── planner.ts      # AI planning agent
│   │   │   └── browser.ts      # Browser automation agent
│   │   └── orchestrator.ts     # XState FSM orchestrator
│   ├── memory/
│   │   ├── storage.ts          # Memory management
│   │   └── types.ts            # Type definitions
│   ├── tools/
│   │   ├── index.ts            # Tool exports
│   │   └── puppeteer-tools.ts  # Browser automation tools
│   ├── cli.ts                  # CLI interface
│   ├── index.ts                # Main entry point
│   └── setup.ts                # Setup wizard
├── .env                        # Your API keys (DO NOT COMMIT)
├── .env.example                # Example environment file
├── package.json
├── tsconfig.json
└── README.md
```

### Technology Stack

- **TypeScript**: Type-safe development
- **XState**: State machine orchestration
- **Puppeteer**: Headless browser automation
- **LangChain**: AI/LLM integration
- **Zod**: Schema validation
- **Pino**: Logging
- **tsx**: TypeScript execution

### State Machine Flow

```
IDLE → PLANNING → STARTING_BROWSER → EXECUTING → COMPLETED
                                              ↓
                                           FAILED
```

---

## 🔧 Configuration

### Supported AI Providers

#### OpenAI (Recommended)
- **Model**: GPT-4o
- **Setup**: Get API key from [OpenAI Platform](https://platform.openai.com/api-keys)
- **Cost**: Pay-per-use

#### OpenRouter (Alternative)
- **Model**: Multiple models available (GPT-4o, Claude, etc.)
- **Setup**: Get API key from [OpenRouter](https://openrouter.ai/)
- **Cost**: Pay-per-use with free tier available
- **Note**: API keys starting with `sk-or-` are automatically detected

#### NVIDIA (Alternative)
- **Model**: Llama 3.1 70B Instruct
- **Setup**: Get API key from [NVIDIA Build](https://build.nvidia.com/)
- **Cost**: Free tier available

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI or OpenRouter API key | Yes (if using OpenAI/OpenRouter) |
| `NVIDIA_API_KEY` | NVIDIA API key | Yes (if using NVIDIA) |
| `AI_PROVIDER` | Provider to use: `openai`, `nvidia`, or `mock` | Yes |

---

## 🧪 Testing

### Run Test Scripts

```bash
# Test with real API
npx tsx src/test_real.ts

# Test memory system
npx tsx src/test_memory.ts

# Test FSM
npx tsx src/test_fsm.ts
```

### Current Limitations

- **Element Detection**: The browser agent uses simple text matching, which may not work for all websites
- **No Resume Upload**: Cannot automatically upload resumes yet
- **Limited Job Site Support**: Generic web automation, not optimized for specific job sites
- **No Application Saving**: Currently doesn't save actual job applications to memory

---

## 🤝 Contributing

Contributions are welcome! This project has a solid foundation but needs enhancement in many areas.

### Areas for Contribution

1. **Improve Browser Agent**: Better element detection and interaction
2. **Add Job Site Integrations**: LinkedIn, Indeed, Glassdoor APIs
3. **Resume Parser**: Extract information from PDF/DOCX resumes
4. **Cover Letter Generator**: AI-powered personalized cover letters
5. **Testing**: Add comprehensive unit and integration tests
6. **Documentation**: Improve code documentation and examples

### Development Setup

```bash
# Install dependencies
pnpm install

# Run in development mode
npm run jobber start "your goal here"

# Build for production
pnpm build
```

---

## 📝 License

ISC License

---

## ⚠️ Disclaimer

This tool is for educational and personal use only. Please:
- Respect website terms of service
- Don't spam job applications
- Review applications before submitting
- Use responsibly and ethically

---

## 🙏 Acknowledgments

Built with:
- [XState](https://xstate.js.org/) - State machines
- [Puppeteer](https://pptr.dev/) - Browser automation
- [LangChain](https://js.langchain.com/) - LLM integration
- [OpenAI](https://openai.com/) - GPT-4 API

---

## 📧 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing issues for solutions

---

**Happy Job Hunting! 🎯**
