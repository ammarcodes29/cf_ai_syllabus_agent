/**
 * Cloudflare Workflow Definition
 * Three-step workflow: extract_syllabus → plan_schedule → revise_plan
 */

import { runLLM } from '../ai';

interface Env {
  AI: Ai;
}

export interface WorkflowParams {
  syllabusText: string;
  preferences?: {
    weeklyAvailability?: string;
    goals?: string;
  };
}

export interface RevisionParams {
  currentPlan: string;
  userMessage: string;
  chatHistory: Array<{ role: string; content: string }>;
}

/**
 * Step 1: Extract Syllabus
 * Converts raw syllabus text into structured JSON
 */
export async function extract_syllabus(text: string, env: Env): Promise<any> {
  console.log('[extract_syllabus] Starting, text length:', text.length);
  
  const systemPrompt = `You are a syllabus analysis assistant. Your task is to extract key information from a course syllabus and return it in a structured JSON format.

Extract the following information:
- Course name
- All assignments (name, due date, weight/points)
- All readings (title, due date if specified)
- All exams (name, date, weight)

Be thorough and accurate. If a field is not specified, omit it or use null.`;

  const userPrompt = `Analyze the following syllabus and extract information in JSON format:

${text}

Return ONLY valid JSON in this format:
{
  "courseName": "string",
  "assignments": [
    {"name": "string", "dueDate": "YYYY-MM-DD", "weight": number}
  ],
  "readings": [
    {"title": "string", "dueDate": "YYYY-MM-DD"}
  ],
  "exams": [
    {"name": "string", "date": "YYYY-MM-DD", "weight": number}
  ]
}`;

  try {
    console.log('[extract_syllabus] Calling runLLM...');
    const response = await runLLM(userPrompt, env, {
      systemPrompt,
      temperature: 0.7,
      maxTokens: 2048,
    });

    console.log('[extract_syllabus] AI response received, length:', response.length);
    console.log('[extract_syllabus] First 500 chars:', response.substring(0, 500));

    // Parse JSON response
    try {
      // Extract JSON from response (in case there's surrounding text)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        console.log('[extract_syllabus] Successfully parsed JSON');
        return parsed;
      }
      return JSON.parse(response);
    } catch (parseError: any) {
      console.error('[extract_syllabus] Failed to parse response:', response.substring(0, 1000));
      console.error('[extract_syllabus] Parse error:', parseError.message);
      throw new Error('Failed to extract syllabus data: ' + parseError.message);
    }
  } catch (error: any) {
    console.error('[extract_syllabus] Error:', error);
    console.error('[extract_syllabus] Error message:', error.message);
    throw error;
  }
}

/**
 * Step 2: Plan Schedule
 * Creates a personalized 14-day study plan
 */
export async function plan_schedule(
  json: any,
  prefs: { weeklyAvailability?: string; goals?: string },
  env: Env
): Promise<string> {
  const systemPrompt = `You are a study planning assistant. Your task is to create a realistic, personalized 14-day study plan that helps students manage their coursework effectively.

Consider:
- Student's weekly availability
- Student's learning goals and pace
- Assignment due dates and priorities
- Balance between readings, assignments, and exam prep
- Breaks and realistic workload

Create a structured plan that is motivating and achievable.`;

  const userPrompt = `Create a 14-day study plan based on:

COURSE DATA:
${JSON.stringify(json, null, 2)}

STUDENT PREFERENCES:
- Availability: ${prefs.weeklyAvailability || 'Not specified'}
- Goals: ${prefs.goals || 'Not specified'}

Return a structured plan in JSON:
{
  "weeks": [
    {
      "weekNumber": 1,
      "tasks": [
        {"day": "Monday", "task": "string", "duration": "string"}
      ]
    }
  ]
}

Make the plan specific, actionable, and realistic.`;

  const response = await runLLM(userPrompt, env, {
    systemPrompt,
    temperature: 0.7,
    maxTokens: 2048,
  });

  // Return the plan as a string (can be JSON or formatted text)
  return response;
}

/**
 * Step 3: Revise Plan
 * Updates the study plan based on user feedback
 */
export async function revise_plan(
  state: { currentPlan: string; chatHistory: Array<{ role: string; content: string }> },
  userMessage: string,
  env: Env
): Promise<string> {
  const systemPrompt = `You are a helpful study planning assistant. The student has a current study plan and wants to make changes to it.

Your job:
1. Understand their request (e.g., "move reading to Thursday", "I need more time for the essay")
2. Modify the existing plan accordingly
3. Return the updated plan in the same JSON format
4. Explain the changes you made in a friendly, conversational way

Be flexible and supportive. Help students maintain a balanced, realistic schedule.`;

  const chatHistoryText = state.chatHistory
    .map((msg) => `${msg.role}: ${msg.content}`)
    .join('\n');

  const userPrompt = `CURRENT PLAN:
${state.currentPlan}

STUDENT REQUEST:
${userMessage}

CHAT HISTORY (for context):
${chatHistoryText}

1. Update the plan based on their request
2. Return updated plan JSON
3. Provide a brief explanation of changes`;

  const response = await runLLM(userPrompt, env, {
    systemPrompt,
    temperature: 0.7,
    maxTokens: 2048,
  });

  return response;
}

/**
 * Complete Workflow: Extract syllabus and generate plan
 * This orchestrates the three-step process
 */
export async function runCompleteWorkflow(
  syllabusText: string,
  preferences: { weeklyAvailability?: string; goals?: string },
  env: Env
): Promise<{ status: string; syllabusJson: any; studyPlan: string }> {
  // Step 1: Extract syllabus
  const syllabusJson = await extract_syllabus(syllabusText, env);

  // Step 2: Generate study plan
  const studyPlan = await plan_schedule(syllabusJson, preferences, env);

  // Return the workflow result
  return {
    status: 'completed',
    syllabusJson,
    studyPlan,
  };
}

