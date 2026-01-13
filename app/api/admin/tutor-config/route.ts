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
    const {
      routerInstructions,
      tutorInstructions,
      masterCatalog,
      routerModel,
      routerTemperature,
      reset,
    } = body;

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
    if (
      !routerInstructions &&
      !tutorInstructions &&
      !masterCatalog &&
      !routerModel &&
      routerTemperature === undefined
    ) {
      return NextResponse.json(
        { error: "At least one field is required" },
        { status: 400 }
      );
    }

    // Validar masterCatalog si se proporciona
    if (masterCatalog) {
      if (!Array.isArray(masterCatalog)) {
        return NextResponse.json(
          { error: "masterCatalog must be an array" },
          { status: 400 }
        );
      }

      // Validar estructura de cada track
      const isValid = masterCatalog.every(
        (track: any) =>
          track.id &&
          typeof track.id === "string" &&
          track.title &&
          typeof track.title === "string" &&
          track.desc &&
          typeof track.desc === "string"
      );

      if (!isValid) {
        return NextResponse.json(
          {
            error:
              "Each track must have 'id', 'title', and 'desc' string fields",
          },
          { status: 400 }
        );
      }
    }

    // Validar routerTemperature si se proporciona
    if (
      routerTemperature !== undefined &&
      (typeof routerTemperature !== "number" ||
        routerTemperature < 0 ||
        routerTemperature > 1)
    ) {
      return NextResponse.json(
        { error: "routerTemperature must be a number between 0 and 1" },
        { status: 400 }
      );
    }

    const config = await updateTutorConfig({
      routerInstructions,
      tutorInstructions,
      masterCatalog,
      routerModel,
      routerTemperature,
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
