import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { verifyAdminSession } from "@/lib/admin-auth";
import OpenAI from "openai";

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// The Master Prompt Template
const generatePrompt = (
  track: string,
  phase: string,
  unit: string,
  topic: string
) => `
ROLE: You are the "Almanac Content Creator."
TASK: Generate one single Unit JSON file for the course "The Causal Web."

CONTEXT:
- Track: ${track}
- Phase: ${phase}
- Unit Name: ${unit}
- Concept Focus: ${topic}

VOICE RULES:
- Tone: "Malcolm Gladwell meets Richard Feynman." Conversational, storytelling, clear metaphors.
- No Jargon: Explain complex ideas using simple, physical analogies.
- The "Hook": Every lesson must start with a concrete image or story, not a definition.
- Tying Thread: Briefly reference that this is part of the "Source Code" of reality.

JSON FORMAT RULES (Strict):
- Return ONLY valid JSON as an array with ONE unit object.
- Structure: Root is an array containing ONE unit object. Each unit contains 'name', 'description', 'order', 'experiencePoints', 'lessons' (array), and 'questions' (array).
- Each lesson must have: 'name', 'description', 'position' (number).
- Questions Types allowed: MULTIPLE_CHOICE, FILL_IN_BLANK, TRUE_FALSE, ORDER_WORDS (max 8 words).
- Each question must have: 'type', 'title', 'order' (number), 'content' (object with correctAnswer and optional explanation), 'answers' (array with 'text', 'isCorrect', 'order').
- Quantity: 3 Lessons, 6-8 Questions.

EXAMPLE STRUCTURE:
[
  {
    "name": "${unit}",
    "description": "Brief description of the unit",
    "order": 1,
    "experiencePoints": 25,
    "lessons": [
      {
        "name": "Lesson 1 Name",
        "description": "Lesson 1 description with a hook",
        "position": 1
      },
      {
        "name": "Lesson 2 Name",
        "description": "Lesson 2 description",
        "position": 2
      },
      {
        "name": "Lesson 3 Name",
        "description": "Lesson 3 description",
        "position": 3
      }
    ],
    "questions": [
      {
        "type": "MULTIPLE_CHOICE",
        "title": "Question text here?",
        "order": 1,
        "content": {
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswer": "Option B",
          "explanation": "Explanation of why this is correct"
        },
        "answers": [
          { "text": "Option A", "isCorrect": false, "order": 1 },
          { "text": "Option B", "isCorrect": true, "order": 2 },
          { "text": "Option C", "isCorrect": false, "order": 3 },
          { "text": "Option D", "isCorrect": false, "order": 4 }
        ]
      }
    ]
  }
]

EXECUTE: Generate the JSON array with one unit for: ${unit}.
`;

export async function POST(req: NextRequest) {
  try {
    // Verify admin session
    const session = await auth.api.getSession({
      headers: await headers()
    });

    const adminCheck = verifyAdminSession(session);
    if (adminCheck) return adminCheck;

    // Parse request body
    const body = await req.json();
    const { track, phase, unit, topic, model = "gpt-4o" } = body;

    // Validate required fields
    if (!track || !phase || !unit || !topic) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          details: "track, phase, unit, and topic are required"
        },
        { status: 400 }
      );
    }

    // Generate prompt
    const prompt = generatePrompt(track, phase, unit, topic);

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: model,
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0].message.content;

    if (!content) {
      return NextResponse.json(
        {
          error: "No content generated",
          details: "OpenAI returned empty content"
        },
        { status: 500 }
      );
    }

    // Parse the JSON to validate it
    let parsedContent;
    try {
      parsedContent = JSON.parse(content);
    } catch (parseError) {
      return NextResponse.json(
        {
          error: "Invalid JSON from AI",
          details: "The AI generated invalid JSON"
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      content: parsedContent,
      metadata: {
        track,
        phase,
        unit,
        topic,
        model,
        tokensUsed: completion.usage?.total_tokens || 0
      }
    });
  } catch (error: any) {
    console.error("Error generating content:", error);

    // Handle OpenAI specific errors
    if (error.status === 401) {
      return NextResponse.json(
        {
          error: "OpenAI API key invalid",
          details: "Please check your OPENAI_API_KEY environment variable"
        },
        { status: 500 }
      );
    }

    // Handle quota exceeded error
    if (error.status === 429 || error.code === 'insufficient_quota') {
      return NextResponse.json(
        {
          error: "Cuota de OpenAI excedida",
          details: "Tu cuenta de OpenAI no tiene créditos suficientes. Ve a https://platform.openai.com/account/billing para agregar créditos o método de pago."
        },
        { status: 429 }
      );
    }

    // Handle rate limit errors
    if (error.status === 429) {
      return NextResponse.json(
        {
          error: "Rate limit alcanzado",
          details: "Has excedido el límite de solicitudes. Espera unos momentos e intenta nuevamente."
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to generate content",
        details: error.message
      },
      { status: 500 }
    );
  }
}
