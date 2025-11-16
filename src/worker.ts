/**
 * cf_ai_syllabus_agent - Main Worker Entry Point
 */

import { UserMemory } from './durable-objects/UserMemory';
import { extract_syllabus, plan_schedule, revise_plan } from './workflows/workflow';

export { UserMemory };

interface Env {
  AI: Ai;
  USER_MEMORY: DurableObjectNamespace;
}

/**
 * CORS headers for API responses
 */
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

/**
 * Get or create Durable Object stub for a user
 */
function getUserStub(userId: string, env: Env): DurableObjectStub {
  const id = env.USER_MEMORY.idFromName(userId);
  return env.USER_MEMORY.get(id);
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Serve static files - handled by assets binding in wrangler.toml
    // Static files (HTML, CSS, JS) are automatically served from public/ directory

    // POST /upload-syllabus
    if (url.pathname === '/upload-syllabus' && request.method === 'POST') {
      try {
        const body = await request.json() as { userId: string; syllabusText: string };
        const { userId, syllabusText } = body;

        console.log('[upload-syllabus] Received request:', { 
          userId, 
          textLength: syllabusText?.length 
        });

        if (!userId || !syllabusText) {
          return new Response(
            JSON.stringify({ 
              success: false,
              error: 'Missing userId or syllabusText' 
            }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (syllabusText.trim().length === 0) {
          return new Response(
            JSON.stringify({ 
              success: false,
              error: 'Syllabus text is empty' 
            }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log('[upload-syllabus] Calling AI to extract syllabus...');
        
        // Extract syllabus using AI
        const syllabusJson = await extract_syllabus(syllabusText, env);

        console.log('[upload-syllabus] AI extraction complete:', syllabusJson);

        // Save to Durable Object
        const stub = getUserStub(userId, env);
        await stub.fetch('https://do/state', {
          method: 'POST',
          body: JSON.stringify({ syllabus_json: syllabusJson }),
          headers: { 'Content-Type': 'application/json' },
        });

        console.log('[upload-syllabus] Saved to Durable Object');

        return new Response(
          JSON.stringify({ 
            success: true, 
            syllabusJson,
            message: 'Syllabus uploaded and processed successfully'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error: any) {
        console.error('[upload-syllabus] Error:', error);
        console.error('[upload-syllabus] Error stack:', error.stack);
        return new Response(
          JSON.stringify({ 
            success: false,
            error: error.message || 'Failed to process syllabus',
            details: error.toString()
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // POST /prefs
    if (url.pathname === '/prefs' && request.method === 'POST') {
      try {
        const body = await request.json() as {
          userId: string;
          preferences: { weeklyAvailability?: string; goals?: string };
        };
        const { userId, preferences } = body;

        if (!userId || !preferences) {
          return new Response(
            JSON.stringify({ error: 'Missing userId or preferences' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Get user's current state
        const stub = getUserStub(userId, env);
        const stateResponse = await stub.fetch('https://do/state');
        const state = await stateResponse.json() as any;

        // Generate study plan using the preferences
        if (state.syllabus_json) {
          const studyPlan = await plan_schedule(state.syllabus_json, preferences, env);

          // Save the plan to Durable Object
          await stub.fetch('https://do/state', {
            method: 'POST',
            body: JSON.stringify({ last_plan: studyPlan }),
            headers: { 'Content-Type': 'application/json' },
          });

          return new Response(
            JSON.stringify({ 
              success: true, 
              studyPlan,
              message: 'Study plan generated successfully'
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } else {
          return new Response(
            JSON.stringify({ error: 'No syllabus found. Please upload a syllabus first.' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } catch (error) {
        console.error('Error in /prefs:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to save preferences and generate plan' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // POST /chat
    if (url.pathname === '/chat' && request.method === 'POST') {
      try {
        const body = await request.json() as { userId: string; message: string };
        const { userId, message } = body;

        if (!userId || !message) {
          return new Response(
            JSON.stringify({ error: 'Missing userId or message' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Get user's current state
        const stub = getUserStub(userId, env);
        const stateResponse = await stub.fetch('https://do/state');
        const state = await stateResponse.json() as any;

        // Append user message to chat history
        await stub.fetch('https://do/chat', {
          method: 'POST',
          body: JSON.stringify({ role: 'user', content: message }),
          headers: { 'Content-Type': 'application/json' },
        });

        // Call revise_plan workflow
        if (state.last_plan) {
          // Include the current user message in chat history for context
          const updatedChatHistory = [...(state.chat_history || []), { role: 'user', content: message }];
          
          const revisedResponse = await revise_plan(
            {
              currentPlan: state.last_plan,
              chatHistory: updatedChatHistory,
            },
            message,
            env
          );

          // Save assistant response to chat history
          await stub.fetch('https://do/chat', {
            method: 'POST',
            body: JSON.stringify({ role: 'assistant', content: revisedResponse }),
            headers: { 'Content-Type': 'application/json' },
          });

          // Update the plan if it was revised
          await stub.fetch('https://do/state', {
            method: 'POST',
            body: JSON.stringify({ last_plan: revisedResponse }),
            headers: { 'Content-Type': 'application/json' },
          });

          return new Response(
            JSON.stringify({ 
              success: true, 
              response: revisedResponse,
              message: 'Chat processed successfully'
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } else {
          // No plan exists, just respond conversationally
          const response = 'Please upload a syllabus and set your preferences first to generate a study plan.';
          
          await stub.fetch('https://do/chat', {
            method: 'POST',
            body: JSON.stringify({ role: 'assistant', content: response }),
            headers: { 'Content-Type': 'application/json' },
          });

          return new Response(
            JSON.stringify({ success: true, response }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } catch (error) {
        console.error('Error in /chat:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to process chat message' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // GET /ws - Real-time WebSocket endpoint
    if (url.pathname === '/ws' && request.method === 'GET') {
      // Cloudflare Realtime API / WebSocket upgrade
      const upgradeHeader = request.headers.get('Upgrade');
      if (upgradeHeader !== 'websocket') {
        return new Response('Expected WebSocket connection', { status: 426 });
      }

      // Create WebSocket pair
      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);

      // Accept the WebSocket connection
      server.accept();

      // Handle WebSocket messages
      server.addEventListener('message', async (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data as string);
          const { userId, type, payload } = data;

          if (type === 'chat') {
            // Handle real-time chat message
            const stub = getUserStub(userId, env);
            
            // Append message
            await stub.fetch('https://do/chat', {
              method: 'POST',
              body: JSON.stringify({ role: 'user', content: payload.message }),
              headers: { 'Content-Type': 'application/json' },
            });

            // Get state and process
            const stateResponse = await stub.fetch('https://do/state');
            const state = await stateResponse.json() as any;

            if (state.last_plan) {
              const response = await revise_plan(
                {
                  currentPlan: state.last_plan,
                  chatHistory: state.chat_history || [],
                },
                payload.message,
                env
              );

              // Save response
              await stub.fetch('https://do/chat', {
                method: 'POST',
                body: JSON.stringify({ role: 'assistant', content: response }),
                headers: { 'Content-Type': 'application/json' },
              });

              await stub.fetch('https://do/state', {
                method: 'POST',
                body: JSON.stringify({ last_plan: response }),
                headers: { 'Content-Type': 'application/json' },
              });

              // Send response back over WebSocket
              server.send(JSON.stringify({ type: 'response', payload: { response } }));
            }
          }
        } catch (error) {
          console.error('WebSocket error:', error);
          server.send(JSON.stringify({ type: 'error', payload: { error: 'Failed to process message' } }));
        }
      });

      server.addEventListener('close', () => {
        console.log('WebSocket closed');
      });

      return new Response(null, {
        status: 101,
        webSocket: client,
      });
    }

    return new Response('Not Found', { status: 404 });
  },
};

