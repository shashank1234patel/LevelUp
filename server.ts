import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const VALID_SUBJECTS = [
  'Science',
  'Mathematics',
  'Computer Science',
  'History',
  'Literature',
  'Economics',
  'General',
] as const;

const VALID_DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'] as const;

// Ordered model fallback chain to handle temporary 503 high-demand spikes
const TEXT_MODELS = [
  'gemini-flash-latest',
  'gemini-3.1-flash-lite',
  'gemini-3.8-flash',
] as const;

function getAiClient() {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isTransientModelError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return (
    msg.includes('503') ||
    msg.includes('UNAVAILABLE') ||
    msg.includes('high demand') ||
    msg.includes('overloaded') ||
    msg.includes('429') ||
    msg.includes('RESOURCE_EXHAUSTED') ||
    msg.includes('fetch failed') ||
    msg.includes('DEADLINE_EXCEEDED')
  );
}

function formatCleanErrorMessage(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err);
  if (raw.includes('503') || raw.includes('UNAVAILABLE') || raw.includes('high demand')) {
    return 'The AI service is experiencing high demand right now. Please wait a few seconds and try again.';
  }
  if (raw.includes('429') || raw.includes('RESOURCE_EXHAUSTED')) {
    return 'Rate limit reached. Please wait a moment and try again.';
  }
  try {
    const parsed = JSON.parse(raw);
    if (parsed?.error?.message) {
      return parsed.error.message;
    }
  } catch {
    // Not raw JSON
  }
  return raw || 'Request failed. Please try again.';
}

async function generateWithFallback(
  buildRequest: (model: string) => Parameters<GoogleGenAI['models']['generateContent']>[0]
) {
  const ai = getAiClient();
  let lastError: unknown = null;

  for (const model of TEXT_MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const reqParams = buildRequest(model);
        return await ai.models.generateContent(reqParams);
      } catch (err) {
        lastError = err;
        console.warn(
          `[Gemini] Model ${model} (attempt ${attempt + 1}) failed:`,
          err instanceof Error ? err.message : err
        );
        if (!isTransientModelError(err)) {
          break;
        }
        await sleep(500 * (attempt + 1));
      }
    }
  }

  throw lastError || new Error('AI models are temporarily unavailable.');
}

function extractJsonObject(rawText: string): Record<string, any> {
  const cleaned = rawText
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
    }
    throw new Error('Could not parse JSON response from model');
  }
}

function clampString(val: unknown, fallback: string, maxLen: number): string {
  const str = typeof val === 'string' && val.trim().length > 0 ? val.trim() : fallback;
  return str.slice(0, maxLen);
}

function clampInt(val: unknown, fallback: number, min: number, max: number): number {
  const num = typeof val === 'number' && !Number.isNaN(val) ? Math.round(val) : fallback;
  return Math.max(min, Math.min(max, num));
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '15mb' }));

  // Generate 5-Stage AI Learning Blueprint from uploaded document or study material
  app.post('/api/blueprint/generate', async (req, res) => {
    const { title, subject, difficulty, content, fileBase64, mimeType } = req.body || {};

    if (!content && !fileBase64 && !title) {
      res.status(400).json({ error: 'Please provide study material, a file, or a topic title.' });
      return;
    }

    try {
      const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [];

      if (
        fileBase64 &&
        mimeType &&
        (mimeType === 'application/pdf' ||
          mimeType.startsWith('image/') ||
          mimeType.startsWith('text/'))
      ) {
        parts.push({
          inlineData: {
            mimeType,
            data: fileBase64,
          },
        });
      }

      const promptText = `You are the AI Curriculum Architect for LevelUp, a personal learning platform.
Analyze the provided educational material and create a 5-Stage Learning Blueprint strictly grounded in the user's provided material. Do NOT invent unverified statistics or external facts not supported by the topic.

Requested Title (if any): ${title || 'Infer from content'}
Requested Subject: ${subject || 'General'}
Requested Difficulty: ${difficulty || 'Intermediate'}

Educational Material / Topic Context:
${content || 'Analyze the attached file or topic title thoroughly and extract all key concepts, examples, definitions, and assessment questions.'}

Return a JSON object with this exact structure:
{
  "title": "Clear chapter title",
  "subject": "Science | Mathematics | Computer Science | History | Literature | Economics | General",
  "difficulty": "Beginner | Intermediate | Advanced",
  "estimatedMinutes": 25,
  "sourceSummary": "2-3 sentence summary of the chapter",
  "topics": [
    {
      "id": "topic_1",
      "title": "Topic title",
      "summary": "Clear summary",
      "estimatedMinutes": 5,
      "subtopics": ["Subtopic 1", "Subtopic 2", "Subtopic 3"]
    }
  ],
  "explanations": [
    {
      "topicId": "topic_1",
      "title": "Topic title",
      "simpleExplanation": "Crystal-clear explanation",
      "realWorldExample": "Concrete real-world example",
      "keyConcept": "Key formula or rule",
      "visualAnalogy": "Memorable visual analogy"
    }
  ],
  "revisionNotes": ["High-yield bullet note 1", "High-yield bullet note 2"],
  "flashcards": [
    {
      "id": "fc_1",
      "term": "Key term",
      "definition": "Clear definition",
      "category": "Core Concept"
    }
  ],
  "mindMap": {
    "rootLabel": "Central chapter concept",
    "branches": [
      {
        "id": "branch_1",
        "label": "Branch title",
        "color": "#6546F5",
        "nodes": [
          { "id": "node_1_1", "label": "Sub-concept", "detail": "Short explanation" }
        ]
      }
    ]
  },
  "quizQuestions": [
    {
      "id": "q_1",
      "type": "mcq",
      "question": "Question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Why the answer is correct",
      "topicTag": "Topic title"
    }
  ]
}

Generate:
- 4 to 5 topics (with 3 subtopics each)
- 4 to 5 explanations matching the topics
- 6 revisionNotes and 6 flashcards
- mindMap with 4 branches (2 nodes each)
- 5 quizQuestions (4 options each, correctIndex 0-3).`;

      parts.push({ text: promptText });

      const response = await generateWithFallback((model) => ({
        model,
        contents: { parts },
        config: {
          systemInstruction:
            'You are an expert personal AI tutor. Return ONLY valid JSON matching the requested structure, strictly grounded in the user input.',
          responseMimeType: 'application/json',
        },
      }));

      const rawJson = extractJsonObject(response.text ?? '{}');

      const safeSubject = VALID_SUBJECTS.includes(subject)
        ? subject
        : VALID_SUBJECTS.includes(rawJson.subject)
          ? rawJson.subject
          : 'General';

      const safeDifficulty = VALID_DIFFICULTIES.includes(difficulty)
        ? difficulty
        : VALID_DIFFICULTIES.includes(rawJson.difficulty)
          ? rawJson.difficulty
          : 'Intermediate';

      const safeTopics = Array.isArray(rawJson.topics)
        ? rawJson.topics.slice(0, 10).map((t: Record<string, unknown>, idx: number) => ({
            id: `topic_${idx + 1}`,
            title: clampString(t.title, `Topic ${idx + 1}`, 120),
            summary: clampString(t.summary, '', 400),
            estimatedMinutes: clampInt(t.estimatedMinutes, 5, 1, 60),
            subtopics: Array.isArray(t.subtopics)
              ? t.subtopics.slice(0, 6).map((s: unknown) => clampString(s, '', 120)).filter(Boolean)
              : [],
          }))
        : [];

      const safeExplanations = Array.isArray(rawJson.explanations)
        ? rawJson.explanations.slice(0, 10).map((e: Record<string, unknown>, idx: number) => ({
            topicId: safeTopics[idx]?.id || `topic_${idx + 1}`,
            title: clampString(e.title, safeTopics[idx]?.title || `Topic ${idx + 1}`, 120),
            simpleExplanation: clampString(e.simpleExplanation, '', 900),
            realWorldExample: clampString(e.realWorldExample, '', 500),
            keyConcept: clampString(e.keyConcept, '', 350),
            visualAnalogy: clampString(e.visualAnalogy, '', 400),
          }))
        : [];

      const safeRevisionNotes = Array.isArray(rawJson.revisionNotes)
        ? rawJson.revisionNotes
            .slice(0, 15)
            .map((n: unknown) => clampString(n, '', 800))
            .filter(Boolean)
        : [];

      const safeFlashcards = Array.isArray(rawJson.flashcards)
        ? rawJson.flashcards.slice(0, 15).map((f: Record<string, unknown>, idx: number) => ({
            id: `fc_${idx + 1}`,
            term: clampString(f.term, '', 150),
            definition: clampString(f.definition, '', 500),
            category: clampString(f.category, safeSubject, 60),
          }))
        : [];

      const paletteColors = ['#6546F5', '#398BFF', '#48D4DC', '#F36FA5', '#10B981'];
      const rawBranches = rawJson.mindMap?.branches;
      const safeBranches = Array.isArray(rawBranches)
        ? rawBranches.slice(0, 8).map((b: Record<string, unknown>, idx: number) => ({
            id: `branch_${idx + 1}`,
            label: clampString(b.label, safeTopics[idx]?.title || `Branch ${idx + 1}`, 80),
            color: paletteColors[idx % paletteColors.length],
            nodes: Array.isArray(b.nodes)
              ? b.nodes.slice(0, 5).map((n: Record<string, unknown>, nIdx: number) => ({
                  id: `node_${idx + 1}_${nIdx + 1}`,
                  label: clampString(n.label, '', 80),
                  detail: clampString(n.detail, '', 240),
                }))
              : [],
          }))
        : [];

      const safeQuizQuestions = Array.isArray(rawJson.quizQuestions)
        ? rawJson.quizQuestions.slice(0, 10).map((q: Record<string, unknown>, idx: number) => {
            const opts =
              Array.isArray(q.options) && q.options.length >= 2
                ? q.options.slice(0, 4).map((o: unknown) => clampString(o, '', 240))
                : [];
            return {
              id: `q_${idx + 1}`,
              type: clampString(q.type, 'mcq', 30),
              question: clampString(q.question, '', 400),
              options: opts,
              correctIndex: clampInt(q.correctIndex, 0, 0, Math.max(0, opts.length - 1)),
              explanation: clampString(q.explanation, '', 500),
              topicTag: clampString(q.topicTag, safeTopics[0]?.title || safeSubject, 80),
            };
          })
        : [];

      const blueprintPayload = {
        title: clampString(title || rawJson.title, 'Study Chapter', 150),
        subject: safeSubject,
        difficulty: safeDifficulty,
        estimatedMinutes: clampInt(rawJson.estimatedMinutes, 20, 5, 300),
        sourceSummary: clampString(rawJson.sourceSummary, '', 4500),
        topics: safeTopics,
        explanations: safeExplanations,
        revisionNotes: safeRevisionNotes,
        flashcards: safeFlashcards,
        mindMap: {
          rootLabel: clampString(
            rawJson.mindMap?.rootLabel || title || rawJson.title,
            'Concept Map',
            150
          ),
          branches: safeBranches,
        },
        quizQuestions: safeQuizQuestions,
      };

      res.json(blueprintPayload);
    } catch (error) {
      console.error('Error generating learning blueprint:', error);
      res.status(503).json({
        error: formatCleanErrorMessage(error),
      });
    }
  });

  // AI Tutor Interactive Q&A Endpoint
  app.post('/api/tutor/ask', async (req, res) => {
    const { chapterTitle, subject, sourceSummary, question, history } = req.body || {};
    if (!question || typeof question !== 'string') {
      res.status(400).json({ error: 'Question is required.' });
      return;
    }

    try {
      const historyContext = Array.isArray(history)
        ? history
            .slice(-6)
            .map(
              (m: { role?: string; text?: string }) =>
                `${m.role === 'user' ? 'Student' : 'Tutor'}: ${m.text}`
            )
            .join('\n')
        : '';

      const response = await generateWithFallback((model) => ({
        model,
        contents: `Active Chapter: ${chapterTitle || 'General Study'} (${subject || 'General'})
Chapter Context: ${sourceSummary || ''}
Recent Conversation:
${historyContext}

Student's Question: ${question}`,
        config: {
          systemInstruction:
            'You are the personal AI Tutor inside LevelUp. Explain concepts simply with a relatable analogy and a concrete example. Do not invent unverified facts. Return structured JSON.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              answer: {
                type: Type.STRING,
                description: 'Clear, friendly, well-structured explanation in 2-3 short paragraphs.',
              },
              keyTakeaway: {
                type: Type.STRING,
                description: 'One-sentence takeaway to remember.',
              },
              followUpPrompts: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '2 suggested follow-up questions the student can click next.',
              },
            },
            required: ['answer', 'keyTakeaway', 'followUpPrompts'],
          },
        },
      }));

      const parsed = extractJsonObject(response.text ?? '{}');
      res.json({
        answer: parsed.answer || '',
        keyTakeaway: parsed.keyTakeaway || '',
        followUpPrompts: Array.isArray(parsed.followUpPrompts)
          ? parsed.followUpPrompts.slice(0, 3)
          : [],
      });
    } catch (error) {
      console.error('Error in AI Tutor:', error);
      res.status(503).json({
        error: formatCleanErrorMessage(error),
      });
    }
  });

  // AI Test Diagnostic & Weak Area Coach Endpoint
  app.post('/api/quiz/evaluate', async (req, res) => {
    const { chapterTitle, score, wrongQuestions } = req.body || {};
    try {
      const response = await generateWithFallback((model) => ({
        model,
        contents: `Chapter: ${chapterTitle || 'Study Unit'}
Final Test Score: ${score}%
Missed Questions / Concepts:
${JSON.stringify(wrongQuestions || [])}

Provide a personalized diagnostic coach report identifying weak areas (or mastery strengths if 100%) and 3 concrete revision actions.`,
        config: {
          systemInstruction:
            'You are an educational coach in LevelUp. Analyze the student quiz performance and provide constructive, specific revision recommendations.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              coachHeadline: { type: Type.STRING },
              weakAreasSummary: { type: Type.STRING },
              recommendedRevisionSteps: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ['coachHeadline', 'weakAreasSummary', 'recommendedRevisionSteps'],
          },
        },
      }));

      const parsed = extractJsonObject(response.text ?? '{}');
      res.json(parsed);
    } catch (error) {
      console.error('Error evaluating quiz:', error);
      res.status(503).json({
        error: formatCleanErrorMessage(error),
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LevelUp server running on http://localhost:${PORT}`);
  });
}

startServer();
