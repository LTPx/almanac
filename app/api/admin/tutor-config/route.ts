import { NextRequest, NextResponse } from "next/server";
import {
  getTutorConfig,
  updateTutorConfig,
  resetTutorConfig,
} from "@/lib/tutor-config-service";

// GET: Obtener la configuración actual del tutor
export async function GET() {
  try {
    const config = await getTutorConfig();
    return NextResponse.json(config);
  } catch (error) {
    console.error("Error fetching tutor config:", error);
    return NextResponse.json(
      { error: "Failed to fetch configuration" },
      { status: 500 }
    );
  }
}

// PUT: Actualizar la configuración del tutor
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { routerInstructions, tutorInstructions, reset } = body;

    // Si se solicita reset, restaurar valores por defecto
    if (reset === true) {
      const config = await resetTutorConfig();
      return NextResponse.json({
        success: true,
        config,
        message: "Configuration reset to defaults",
      });
    }

    // Validación básica
    if (!routerInstructions && !tutorInstructions) {
      return NextResponse.json(
        { error: "At least one instruction field is required" },
        { status: 400 }
      );
    }

    const config = await updateTutorConfig({
      routerInstructions,
      tutorInstructions,
    });

    return NextResponse.json({
      success: true,
      config,
      message: "Configuration updated successfully",
    });
  } catch (error) {
    console.error("Error updating tutor config:", error);
    return NextResponse.json(
      { error: "Failed to update configuration" },
      { status: 500 }
    );
  }
}
