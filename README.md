# cf_ai_syllabus_agent

An AI-powered Cloudflare Workers application that converts class syllabi into personalized study plans.

## Overview

This application demonstrates a complete AI agent built on Cloudflare's platform, featuring:

- **Workers AI** (Llama 3.3) for LLM inference
- **Cloudflare Workflows** for orchestration
- **Durable Objects** for user memory and state persistence
- **Cloudflare Pages** for the user interface
- **Real-time chat** for plan modifications

## Features

- 📄 Upload syllabus (PDF or text)
- 🤖 AI extraction of assignments, readings, and exams
- 📅 Personalized 14-day study plan generation
- 💬 Chat interface to modify your plan
- 🧠 Persistent memory for each user

## Project Structure

```
cf_ai_syllabus_agent/
├── src/
│   ├── worker.ts                    # Main Worker entry point
│   ├── durable-objects/
│   │   └── UserMemory.ts            # Durable Object for user state
│   ├── workflows/
│   │   └── syllabusWorkflow.ts      # Workflow orchestration
│   └── types/
│       └── index.ts                 # Shared TypeScript types
├── public/
│   ├── index.html                   # Frontend UI
│   ├── style.css                    # Styles
│   └── app.js                       # Frontend logic
├── wrangler.toml                    # Cloudflare configuration
├── README.md                        # This file
├── PRD.md                           # Product requirements
├── PROMPTS.md                       # LLM prompts
└── .cursorrules                     # Project coding standards
```

## Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Cloudflare account
- Wrangler CLI

### Installation

```bash
# Install dependencies
npm install

# Login to Cloudflare
npx wrangler login

# Run locally
npx wrangler dev

# Deploy
npx wrangler deploy
```

## Configuration

Edit `wrangler.toml` to configure:
- AI model bindings
- Durable Object namespaces
- Workflow bindings

## Development

### Local Development

```bash
npx wrangler dev
```

Visit http://localhost:8787 to test locally.

### TypeScript

This project uses TypeScript for type safety. All source files are in `src/`.

## API Endpoints

- `POST /api/upload` - Upload syllabus file
- `POST /api/chat` - Send chat message
- `GET /api/state` - Get user state (via Durable Object)

## Deployment

```bash
npx wrangler deploy
```

Production URL: [To be added after deployment]

## License

MIT

## Resources

- [Cloudflare Workers AI Documentation](https://developers.cloudflare.com/workers-ai/)
- [Durable Objects Guide](https://developers.cloudflare.com/durable-objects/)
- [Cloudflare Workflows](https://developers.cloudflare.com/workflows/)

