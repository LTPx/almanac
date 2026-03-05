import { NextRequest, NextResponse } from "next/server";
import { generateBatch } from "@/lib/art-generator";

// POST - Generate batch of NFT images from layers
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { collectionId, count } = body;

    if (!collectionId) {
      return NextResponse.json(
        { message: "collectionId is required" },
        { status: 400 }
      );
    }

    const quantity = parseInt(String(count));
    if (!quantity || quantity < 1 || quantity > 10000) {
      return NextResponse.json(
        { message: "count must be between 1 and 10,000" },
        { status: 400 }
      );
    }

    const result = await generateBatch(collectionId, quantity);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error generating batch:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ message }, { status: 500 });
  }
}
