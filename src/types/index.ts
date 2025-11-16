/**
 * Shared TypeScript types
 */

export interface SyllabusJSON {
  courseName: string;
  assignments: Array<{
    name: string;
    dueDate: string;
    weight?: number;
  }>;
  readings: Array<{
    title: string;
    dueDate?: string;
  }>;
  exams: Array<{
    name: string;
    date: string;
    weight?: number;
  }>;
}

export interface StudyPlan {
  weeks: Array<{
    weekNumber: number;
    tasks: Array<{
      day: string;
      task: string;
      duration?: string;
    }>;
  }>;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

