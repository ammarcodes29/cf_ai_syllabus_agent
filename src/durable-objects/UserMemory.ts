/**
 * UserMemory Durable Object
 * Stores user-specific state: syllabus, plan, chat history
 */

export interface UserState {
  userId: string;
  syllabus_json?: any;
  last_plan?: any;
  chat_history: Array<{ role: string; content: string; timestamp: number }>;
}

export class UserMemory {
  state: DurableObjectState;
  env: any;

  constructor(state: DurableObjectState, env: any) {
    this.state = state;
    this.env = env;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/state') {
      // Get current state
      if (request.method === 'GET') {
        const state = await this.getState();
        return new Response(JSON.stringify(state), {
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Update state
      if (request.method === 'POST') {
        const updates = await request.json();
        await this.updateState(updates);
        return new Response(JSON.stringify({ success: true }), {
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    return new Response('Not Found', { status: 404 });
  }

  async getState(): Promise<UserState> {
    const userId = (await this.state.storage.get<string>('userId')) || '';
    const syllabus_json = await this.state.storage.get<any>('syllabus_json');
    const last_plan = await this.state.storage.get<any>('last_plan');
    const chat_history =
      (await this.state.storage.get<Array<any>>('chat_history')) || [];

    return {
      userId,
      syllabus_json,
      last_plan,
      chat_history,
    };
  }

  async updateState(updates: Partial<UserState>): Promise<void> {
    if (updates.userId) {
      await this.state.storage.put('userId', updates.userId);
    }
    if (updates.syllabus_json) {
      await this.state.storage.put('syllabus_json', updates.syllabus_json);
    }
    if (updates.last_plan) {
      await this.state.storage.put('last_plan', updates.last_plan);
    }
    if (updates.chat_history) {
      await this.state.storage.put('chat_history', updates.chat_history);
    }
  }
}

