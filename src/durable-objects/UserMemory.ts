/**
 * UserMemory Durable Object
 * Stores user-specific state: syllabus, plan, chat history
 */

export interface UserState {
  syllabus_json: any | null;
  last_plan: string | null;
  chat_history: Array<{ role: string; content: string }>;
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

    // Get current state
    if (url.pathname === '/state' && request.method === 'GET') {
      const state = await this.getState();
      return new Response(JSON.stringify(state), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Update state
    if (url.pathname === '/state' && request.method === 'POST') {
      const updates = await request.json();
      await this.updateState(updates);
      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Append chat message
    if (url.pathname === '/chat' && request.method === 'POST') {
      const { role, content } = await request.json();
      await this.appendChat(role, content);
      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response('Not Found', { status: 404 });
  }

  /**
   * Get the current state
   */
  async getState(): Promise<UserState> {
    const syllabus_json = (await this.state.storage.get<any>('syllabus_json')) || null;
    const last_plan = (await this.state.storage.get<string>('last_plan')) || null;
    const chat_history = (await this.state.storage.get<Array<{ role: string; content: string }>>('chat_history')) || [];

    return {
      syllabus_json,
      last_plan,
      chat_history,
    };
  }

  /**
   * Update state with partial updates
   */
  async updateState(updates: Partial<UserState>): Promise<void> {
    if (updates.syllabus_json !== undefined) {
      await this.state.storage.put('syllabus_json', updates.syllabus_json);
    }
    if (updates.last_plan !== undefined) {
      await this.state.storage.put('last_plan', updates.last_plan);
    }
    if (updates.chat_history !== undefined) {
      await this.state.storage.put('chat_history', updates.chat_history);
    }
  }

  /**
   * Append a message to chat history
   */
  async appendChat(role: string, content: string): Promise<void> {
    const currentHistory = (await this.state.storage.get<Array<{ role: string; content: string }>>('chat_history')) || [];
    
    currentHistory.push({ role, content });
    
    await this.state.storage.put('chat_history', currentHistory);
  }
}

