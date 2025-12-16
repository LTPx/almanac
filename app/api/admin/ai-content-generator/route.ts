import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { verifyAdminSession } from "@/lib/admin-auth";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Initialize Google Gemini
const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

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

async function generateWithOpenAI(
  prompt: string,
  model: string
): Promise<{ content: string; tokensUsed: number }> {
  const completion = await openai.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: model,
    response_format: { type: "json_object" }
  });

  const content = completion.choices[0].message.content;

  if (!content) {
    throw new Error("No content generated from OpenAI");
  }

  return {
    content,
    tokensUsed: completion.usage?.total_tokens || 0
  };
}

async function generateWithGemini(
  prompt: string,
  model: string
): Promise<{ content: string; tokensUsed: number }> {
  if (!genAI) {
    throw new Error(
      "Gemini API key not configured. Please set GEMINI_API_KEY in .env"
    );
  }

  // Map model names to ensure compatibility
  const modelMap: Record<string, string> = {
    "gemini-2.5-flash": "gemini-2.5-flash",
    "gemini-1.5-pro": "gemini-1.5-pro-latest",
    "gemini-2.0-flash-exp": "gemini-2.0-flash-exp"
  };

  const mappedModel = modelMap[model] || model;

  console.log(`[Gemini] Using model: ${mappedModel}`);

  const geminiModel = genAI.getGenerativeModel({
    model: mappedModel,
    generationConfig: {
      responseMimeType: "application/json"
    }
  });

  const result = await geminiModel.generateContent(prompt);
  const response = result.response;
  const content = response.text();

  if (!content) {
    throw new Error("No content generated from Gemini");
  }

  // Get token count if available
  const tokensUsed =
    (result.response.usageMetadata?.totalTokenCount as number) || 0;

  return {
    content,
    tokensUsed
  };
}

export async function POST(req: NextRequest) {
  let selectedProvider = "openai"; // Track which provider we're using

  try {
    // Verify admin session
    const session = await auth.api.getSession({
      headers: await headers()
    });

    const adminCheck = verifyAdminSession(session);
    if (adminCheck) return adminCheck;

    // Parse request body
    const body = await req.json();
    const {
      track,
      phase,
      unit,
      topic,
      provider = "openai",
      model = "gpt-4o"
    } = body;

    selectedProvider = provider; // Store for error handling

    console.log(
      `[AI Generator] Request received - Provider: ${provider}, Model: ${model}`
    );

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

    let content: string;
    let tokensUsed: number;
    let actualProvider: string;

    // Generate content based on provider
    if (provider === "gemini") {
      console.log(`[AI Generator] Using Gemini with model: ${model}`);
      const result = await generateWithGemini(prompt, model);
      content = result.content;
      tokensUsed = result.tokensUsed;
      actualProvider = "gemini";
    } else {
      console.log(`[AI Generator] Using OpenAI with model: ${model}`);
      const result = await generateWithOpenAI(prompt, model);
      content = result.content;
      tokensUsed = result.tokensUsed;
      actualProvider = "openai";
    }

    console.log(
      `[AI Generator] Content generated successfully with ${actualProvider}`
    );

    // Parse the JSON to validate it
    let parsedContent;
    try {
      parsedContent = JSON.parse(content);
    } catch (parseError) {
      return NextResponse.json(
        {
          error: "Invalid JSON from AI",
          details: `The AI (${actualProvider}) generated invalid JSON. Please try again or use a different model.`
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
        provider: actualProvider,
        model,
        tokensUsed
      }
    });
  } catch (error: any) {
    console.error(`Error generating content with ${selectedProvider}:`, error);

    // Handle Gemini-specific errors
    if (selectedProvider === "gemini") {
      // Gemini API key not configured
      if (error.message?.includes("GEMINI_API_KEY")) {
        return NextResponse.json(
          {
            error: "Gemini API key no configurada",
            details:
              "Por favor configura GEMINI_API_KEY en tu archivo .env. Obtén una gratis en https://makersuite.google.com/app/apikey"
          },
          { status: 500 }
        );
      }

      // Gemini quota or rate limit errors (429)
      if (
        error.status === 429 ||
        error.statusText === "Too Many Requests" ||
        error.message?.includes("quota") ||
        error.message?.includes("RESOURCE_EXHAUSTED")
      ) {
        // Extract retry delay if available
        const retryMatch = error.message?.match(/retry in ([\d.]+)s/i);
        const retrySeconds = retryMatch
          ? Math.ceil(parseFloat(retryMatch[1]))
          : 10;

        return NextResponse.json(
          {
            error: "Límite de requests de Gemini alcanzado",
            details: `Has alcanzado el límite del plan gratuito de Gemini. Espera ${retrySeconds} segundos y vuelve a intentar, o usa Gemini 1.5 Flash (tiene límites más generosos que el modelo experimental 2.0).`,
            retryAfter: retrySeconds
          },
          { status: 429 }
        );
      }

      // Gemini authentication errors
      if (
        error.status === 401 ||
        error.status === 403 ||
        error.message?.includes("API key")
      ) {
        return NextResponse.json(
          {
            error: "Error de autenticación de Gemini",
            details:
              "Tu API key de Gemini no es válida. Verifica GEMINI_API_KEY en .env o genera una nueva en https://makersuite.google.com/app/apikey"
          },
          { status: 401 }
        );
      }

      // Generic Gemini error
      return NextResponse.json(
        {
          error: "Error al generar con Gemini",
          details:
            error.message ||
            "Error desconocido al usar Gemini. Intenta con OpenAI como alternativa."
        },
        { status: 500 }
      );
    }

    // Handle OpenAI-specific errors
    if (selectedProvider === "openai") {
      // OpenAI authentication errors
      if (error.status === 401) {
        return NextResponse.json(
          {
            error: "OpenAI API key inválida",
            details:
              "Verifica OPENAI_API_KEY en .env. Prueba con Gemini (gratis) como alternativa."
          },
          { status: 401 }
        );
      }

      // OpenAI quota exceeded
      if (error.status === 429 || error.code === "insufficient_quota") {
        return NextResponse.json(
          {
            error: "Cuota de OpenAI excedida",
            details:
              "Tu cuenta de OpenAI no tiene créditos. Cambia a Gemini (gratis) o agrega créditos en https://platform.openai.com/account/billing"
          },
          { status: 429 }
        );
      }

      // OpenAI rate limit
      if (error.status === 429) {
        return NextResponse.json(
          {
            error: "Rate limit de OpenAI alcanzado",
            details:
              "Demasiadas solicitudes. Espera unos minutos o cambia a Gemini."
          },
          { status: 429 }
        );
      }

      // Generic OpenAI error
      return NextResponse.json(
        {
          error: "Error al generar con OpenAI",
          details:
            error.message ||
            "Error desconocido. Prueba con Gemini como alternativa."
        },
        { status: 500 }
      );
    }

    // Generic fallback error
    return NextResponse.json(
      {
        error: "Error al generar contenido",
        details: `Error con ${selectedProvider}: ${error.message}`
      },
      { status: 500 }
    );
  }
}
