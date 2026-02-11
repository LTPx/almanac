import { NextRequest } from "next/server";
import {
  translateCurriculums,
  translateUnits,
  translateLessons,
  translateQuestions
} from "@/lib/bulk-translate";

function sseEvent(data: object): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") as
    | "curriculums" | "units" | "lessons" | "questions"
    | null;
  const onlyMissing = searchParams.get("onlyMissing") !== "false";

  if (!type || !["curriculums", "units", "lessons", "questions"].includes(type)) {
    return new Response("type must be 'curriculums', 'units', 'lessons' or 'questions'", { status: 400 });
  }

  if (!process.env.GEMINI_API_KEY) {
    return new Response("GEMINI_API_KEY no configurado", { status: 500 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(encoder.encode(sseEvent(data)));
      };

      try {
        if (type === "curriculums") await translateCurriculums(send, onlyMissing);
        else if (type === "units")   await translateUnits(send, onlyMissing);
        else if (type === "lessons") await translateLessons(send, onlyMissing);
        else if (type === "questions") await translateQuestions(send, onlyMissing);
      } catch (err: any) {
        send({ type: "fatal", error: err.message });
      } finally {
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive"
    }
  });
}
