/**
 * cf_ai_syllabus_agent - Main Worker Entry Point
 */

import { UserMemory } from './durable-objects/UserMemory';

export { UserMemory };

interface Env {
  AI: Ai;
  USER_MEMORY: DurableObjectNamespace;
  SYLLABUS_WORKFLOW: Workflow;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Serve static files for UI
    if (url.pathname === '/' || url.pathname === '/index.html') {
      // TODO: Serve public/index.html
      return new Response('Hello from cf_ai_syllabus_agent!', {
        headers: { 'Content-Type': 'text/html' },
      });
    }

    // API routes
    if (url.pathname === '/api/upload') {
      // TODO: Handle syllabus upload
      return new Response(JSON.stringify({ status: 'pending' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (url.pathname === '/api/chat') {
      // TODO: Handle chat messages
      return new Response(JSON.stringify({ status: 'pending' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response('Not Found', { status: 404 });
  },
};

