export type PromptMode = 'improve' | 'idea' | 'expert';

const SYSTEM_INSTRUCTION = `You are a professional AI Prompt Architect. 
Your job is to transform vague or weak user instructions into powerful, structured, high-performance prompts.

You must:
- Add missing details intelligently.
- Never ask clarification questions before generating.
- Assume reasonable defaults.
- Structure prompts professionally.
- Add sections like:
   ROLE
   OBJECTIVE
   CONTEXT
   REQUIREMENTS
   OUTPUT FORMAT
   CONSTRAINTS
- End every response with:
   'If this is not aligned, tell me what to adjust and I will refine it.'

Output only the final improved prompt.
Do not explain your reasoning.`;

export async function generatePrompt(input: string, mode: PromptMode): Promise<string> {
  let prompt = input;

  switch (mode) {
    case 'improve':
      prompt = `Rewrite this prompt to be clear, specific, include role definition, add constraints, add expected output format, and remove ambiguity:\n\n${input}`;
      break;
    case 'idea':
      prompt = `Generate a full, detailed prompt from this vague idea. Assume reasonable defaults, define target audience, features, edge cases, tech stack (if relevant), and output format. Do not ask questions first.\n\nIdea: ${input}`;
      break;
    case 'expert':
      prompt = `Transform this input into a highly advanced, expert-level prompt. Include Role (Act as a senior ...), Context, Constraints, Structured output format, Examples (if useful), and Step-by-step reasoning requirement.\n\nInput: ${input}`;
      break;
  }

  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        systemInstruction: SYSTEM_INSTRUCTION,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Server error: ${response.status}`);
    }

    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error("Error generating prompt:", error);
    throw new Error("Failed to generate prompt. Please try again.");
  }
}
