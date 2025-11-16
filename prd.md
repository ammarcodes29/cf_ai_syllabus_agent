# cf_ai_syllabus_agent – Product Requirements Document (PRD)

## Overview
cf_ai_syllabus_agent is an AI-powered Cloudflare application that converts 
uploaded class syllabi into personalized study plans. It uses:
- Workers AI (Llama 3.3) for LLM inference
- Cloudflare Workflows for orchestration
- Durable Objects for memory + user state
- Cloudflare Pages + Realtime API for UI chat

The goal is to demonstrate a complete AI agent built on Cloudflare, with memory, 
workflow coordination, and user interaction.

---

## User Flow
1. User uploads a syllabus (PDF or text)
2. Agent extracts assignments, readings, exams → JSON format
3. UI asks user preferences:
   - weekly availability
   - goals (pace, workload)
4. Agent generates a 14-day study plan
5. User chats to modify the plan (“move reading to Thursday”)
6. Memory (Durable Object) persists:
   - syllabus_json
   - last_plan
   - chat history

---

## Key Components

### 1. Workers AI (LLM Calls)
- Prompt 1: Syllabus → structured JSON
- Prompt 2: JSON + prefs → plan
- Prompt 3: Conversation updates

### 2. Durable Object: UserMemory
Stores:
{
userId,
syllabus_json,
last_plan,
chat_history
}

### 3. Workflow Orchestration
Steps:
- extract_syllabus
- plan_schedule
- revise_plan

### 4. UI
- Cloudflare Pages
- Chat interface
- Syllabus upload component
- Uses Realtime websocket-like API for messages

---

## Non-Functional Requirements
- Deployment must be fully on Cloudflare
- Repo must include: README.md, PROMPTS.md, PRD.md, .cursorrules
- MIT license
- Production deploy URL included in README

---

## Stretch Goals (Optional)
- Calendar export (ICS file)
- Multi-syllabus support
- Save weekly schedule templates