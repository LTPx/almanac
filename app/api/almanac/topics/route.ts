import { NextResponse } from "next/server";
import {
  getAvailableTopics,
  getTopicsStats,
  searchTopics,
} from "@/lib/almanac-db-service";

// GET /api/almanac/topics
// Obtiene todos los topics disponibles
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    // Si hay query, hacer búsqueda
    if (query) {
      const results = await searchTopics(query);
      return NextResponse.json({
        topics: results,
        count: results.length,
      });
    }

    // Si no hay query, devolver todos los topics
    const topicsMap = await getAvailableTopics();
    const topics = Array.from(topicsMap.values());

    // Obtener estadísticas
    const stats = await getTopicsStats();

    return NextResponse.json({
      topics,
      count: topics.length,
      stats,
    });
  } catch (error) {
    console.error("Error fetching topics:", error);
    return NextResponse.json(
      { error: "Failed to fetch topics" },
      { status: 500 }
    );
  }
}
