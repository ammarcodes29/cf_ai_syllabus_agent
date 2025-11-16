# cf_ai_syllabus_agent

An AI-powered Cloudflare Workers application that converts class syllabi into personalized study plans.

**🚀 Live Demo:** [https://cf-ai-syllabus-agent.your-subdomain.workers.dev](https://cf-ai-syllabus-agent.your-subdomain.workers.dev) *(Coming Soon)*

## Overview

This application demonstrates a complete AI agent built on Cloudflare's platform, featuring:

- **Workers AI** (Llama 3.3 70B) for LLM inference
- **Cloudflare Workflows** for orchestration
- **Durable Objects** for user memory and state persistence
- **WebSocket Support** for real-time chat
- **Vanilla JavaScript** - No frontend frameworks required

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Browser                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Upload       │  │ Preferences  │  │ Chat UI      │          │
│  │ Syllabus     │  │ Form         │  │ (WebSocket)  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└────────────┬────────────────┬──────────────┬───────────────────┘
             │                │              │
             │ POST           │ POST         │ WS/POST
             │ /upload-syllabus  /prefs      │ /ws or /chat
             │                │              │
             ▼                ▼              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Cloudflare Worker                             │
│                      (src/worker.ts)                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Routes:                                                  │   │
│  │  • POST /upload-syllabus → Extract syllabus w/ AI        │   │
│  │  • POST /prefs → Generate study plan                     │   │
│  │  • POST /chat → Revise plan via chat                     │   │
│  │  • GET  /ws → WebSocket for real-time chat               │   │
│  └──────────────────────────────────────────────────────────┘   │
│          │                  │                  │                 │
│          ▼                  ▼                  ▼                 │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐          │
│  │ Workers AI  │   │ Workflows   │   │  Durable    │          │
│  │  (Llama 3.3)│   │             │   │  Objects    │          │
│  └─────────────┘   └─────────────┘   └─────────────┘          │
│         │                  │                  │                 │
│         ▼                  ▼                  ▼                 │
│  ┌─────────────────────────────────────────────────┐          │
│  │  Workflow Steps:                                 │          │
│  │  1. extract_syllabus(text) → JSON               │          │
│  │  2. plan_schedule(json, prefs) → 14-day plan    │          │
│  │  3. revise_plan(plan, message) → updated plan   │          │
│  └─────────────────────────────────────────────────┘          │
│                                                                 │
│  ┌─────────────────────────────────────────────────┐          │
│  │  UserMemory Durable Object State:               │          │
│  │  • syllabus_json: parsed syllabus data          │          │
│  │  • last_plan: current study plan                │          │
│  │  • chat_history: conversation messages          │          │
│  └─────────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

## Features

### 📄 Syllabus Processing
- Upload syllabus as text or file
- AI-powered extraction of assignments, readings, and exams
- Structured JSON output with due dates and weights

### 📅 Personalized Study Planning
- 14-day personalized study plan generation
- Considers student availability and goals
- Balanced workload distribution
- Realistic and achievable timelines

### 💬 Interactive Chat
- Conversational plan modifications
- Real-time updates via WebSocket (optional)
- REST API fallback for reliability
- Full chat history context

### 🧠 Persistent Memory
- User state stored in Durable Objects
- Conversation history preserved
- Study plans saved and retrievable
- Unique user identification

### ⚡ Performance
- Edge-deployed for global low latency
- Cloudflare's AI models at the edge
- Durable Objects for consistent state
- No database required

## Project Structure

```
cf_ai_syllabus_agent/
├── src/
│   ├── worker.ts                    # Main Worker entry point with routes
│   ├── ai.ts                        # Workers AI integration (runLLM)
│   ├── durable-objects/
│   │   └── UserMemory.ts            # Durable Object for user state
│   ├── workflows/
│   │   └── workflow.ts              # Workflow orchestration (3 steps)
│   └── types/
│       └── index.ts                 # Shared TypeScript types
├── public/
│   ├── index.html                   # Frontend UI
│   ├── style.css                    # Styles
│   ├── script.js                    # Frontend logic with WebSocket
│   └── app.js                       # Alternative frontend (deprecated)
├── wrangler.toml                    # Cloudflare configuration
├── package.json                     # Dependencies
├── tsconfig.json                    # TypeScript config
├── README.md                        # This file
├── prd.md                           # Product requirements
├── PROMPTS.md                       # LLM prompts (3 prompts)
└── .cursorrules                     # Project coding standards
```

## How to Run Locally

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** or **yarn**
- **Cloudflare account** ([Sign up free](https://dash.cloudflare.com/sign-up))
- **Wrangler CLI** (installed via npm)

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/cf_ai_syllabus_agent.git
   cd cf_ai_syllabus_agent
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Login to Cloudflare**
   ```bash
   npx wrangler login
   ```
   This will open a browser window for authentication.

4. **Run the development server**
   ```bash
   npx wrangler dev
   ```
   
5. **Open in browser**
   ```
   http://localhost:8787
   ```

### Development Tips

- **Hot reload**: Wrangler automatically reloads on file changes
- **View logs**: All `console.log()` statements appear in terminal
- **Test API**: Use curl, Postman, or the frontend UI
- **Debug**: Use Chrome DevTools for frontend debugging

### Configuration

The `wrangler.toml` file contains:
- **AI binding**: Workers AI (Llama 3.3)
- **Durable Object**: UserMemory class
- **Workflow**: SyllabusWorkflow class

No additional configuration needed for local development!

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/upload-syllabus` | Upload and extract syllabus text |
| `POST` | `/prefs` | Save preferences and generate study plan |
| `POST` | `/chat` | Send chat message to revise plan |
| `GET`  | `/ws` | WebSocket endpoint for real-time chat |

### Example API Usage

**Upload Syllabus:**
```bash
curl -X POST http://localhost:8787/upload-syllabus \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_123",
    "syllabusText": "Course: CS 101\nAssignment 1: Due 2024-01-15..."
  }'
```

**Generate Plan:**
```bash
curl -X POST http://localhost:8787/prefs \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_123",
    "preferences": {
      "weeklyAvailability": "Weekdays 2-5pm",
      "goals": "Steady pace"
    }
  }'
```

**Chat:**
```bash
curl -X POST http://localhost:8787/chat \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_123",
    "message": "Move the reading to Thursday"
  }'
```

## How to Deploy

### Deploy to Cloudflare Workers

1. **Ensure you're logged in**
   ```bash
   npx wrangler login
   ```

2. **Deploy the Worker**
   ```bash
   npx wrangler deploy
   ```

3. **Get your deployment URL**
   After deployment, Wrangler will output your worker URL:
   ```
   https://cf-ai-syllabus-agent.your-subdomain.workers.dev
   ```

4. **Test the deployment**
   Visit the URL in your browser to test the application.

### Deploy to Custom Domain (Optional)

1. Add a route in `wrangler.toml`:
   ```toml
   routes = [
     { pattern = "syllabus.yourdomain.com/*", zone_name = "yourdomain.com" }
   ]
   ```

2. Deploy again:
   ```bash
   npx wrangler deploy
   ```

3. Configure DNS in Cloudflare Dashboard to point to your Worker.

### Environment Variables (Optional)

If you need environment variables (API keys, etc.):

```bash
# Set a secret
npx wrangler secret put SECRET_NAME

# In your code
env.SECRET_NAME
```

## 🌐 Live Deployment

**Production URL:** [https://cf-ai-syllabus-agent.your-subdomain.workers.dev](https://cf-ai-syllabus-agent.your-subdomain.workers.dev)

*Replace with your actual deployment URL after running `npx wrangler deploy`*

## License

MIT

## Resources

- [Cloudflare Workers AI Documentation](https://developers.cloudflare.com/workers-ai/)
- [Durable Objects Guide](https://developers.cloudflare.com/durable-objects/)
- [Cloudflare Workflows](https://developers.cloudflare.com/workflows/)

