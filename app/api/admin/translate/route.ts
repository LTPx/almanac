import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

export async function POST(request: NextRequest) {
  try {
    if (!genAI) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY no configurado" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { fields, from, to } = body;

    // fields: { name?: string, description?: string, title?: string }
    // from: "EN" | "ES"
    // to: "EN" | "ES"

    if (!fields || !from || !to || from === to) {
      return NextResponse.json(
        { error: "Parámetros inválidos" },
        { status: 400 }
      );
    }

    const fromLabel = from === "EN" ? "English" : "Spanish";
    const toLabel = to === "EN" ? "English" : "Spanish";

    const fieldsText = Object.entries(fields)
      .filter(([, v]) => v && String(v).trim())
      .map(([k, v]) => `${k}: "${v}"`)
      .join("\n");

    if (!fieldsText) {
      return NextResponse.json(
        { error: "No hay contenido para traducir" },
        { status: 400 }
      );
    }

    const prompt = `Translate the following educational content from ${fromLabel} to ${toLabel}.
Return ONLY a valid JSON object with the same keys and translated values.
Keep technical terms accurate for an educational platform.

Content to translate:
${fieldsText}

Return ONLY JSON, no explanation. Example format: {"name": "translated name", "description": "translated description"}`;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2
      }
    });

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const translated = JSON.parse(responseText);

    return NextResponse.json({ translated });
  } catch (error: any) {
    console.error("Translation error:", error);

    if (error.status === 429) {
      return NextResponse.json(
        { error: "Límite de solicitudes alcanzado. Intenta en un momento." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "Error al traducir el contenido" },
      { status: 500 }
    );
  }
}
