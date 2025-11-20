import { NextResponse } from "next/server";
import Stripe from "stripe";
import prisma from "@/lib/prisma";

export const config = {
  api: {
    bodyParser: false
  }
};

// Helper para el raw body
async function buffer(readable: ReadableStream<Uint8Array>) {
  const reader = readable.getReader();
  const chunks: Buffer[] = [];

  let done = false;
  while (!done) {
    const { value, done: doneReading } = await reader.read();
    if (value) chunks.push(Buffer.from(value));
    done = doneReading;
  }

  return Buffer.concat(chunks);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-10-29.clover"
});

const TOKENS_BY_PRICE_ID: Record<string, number> = {
  zaps_1000: 1000,
  zaps_3000: 3000,
  zaps_7500: 7500
};

export async function POST(req: Request) {
  const rawBody = await buffer(req.body!);
  const signature = req.headers.get("stripe-signature")!;
  const webhookSecret = process.env.STRIPE_ZAPS_WEBHOOK_SECRET!;

  let event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: any) {
    console.error("❌ Error verificando firma de Stripe:", err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // -----------------------------
  // Evento cuando el pago se completa
  // -----------------------------
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    console.log("session:", session);
    const customerEmail = session.customer_details?.email;
    const priceId = session.metadata?.packageId;
    //@ts-expect-error stripe error
    const effectivePriceId = priceId || session?.line_items?.[0]?.price?.id;

    console.log("💳 Pago completado para:", customerEmail);
    console.log("Price ID:", effectivePriceId);

    if (!customerEmail) {
      console.error("❌ No hay email del cliente en la sesión.");
      return NextResponse.json({ received: true });
    }

    // ¿Cuántos tokens corresponden?
    const tokens = TOKENS_BY_PRICE_ID[effectivePriceId!];
    if (!tokens) {
      console.error("❌ Price ID no reconocido:", effectivePriceId);
      return NextResponse.json({ received: true });
    }

    // ------------------------------------
    // Buscar al usuario en tu base de datos
    // ------------------------------------
    const user = await prisma.user.findUnique({
      where: { email: customerEmail }
    });

    if (!user) {
      console.error("❌ No se encontró usuario con email:", customerEmail);
      return NextResponse.json({ received: true });
    }

    await prisma.$transaction(async (tx) => {
      await tx.zapTransaction.create({
        data: {
          userId: user.id,
          type: "ADMIN_ADJUSTMENT",
          amount: tokens,
          reason: `Compra de ${tokens} zap tokens`
        }
      });

      await tx.user.update({
        where: { id: user.id },
        data: {
          zapTokens: { increment: tokens }
        }
      });
    });

    console.log(`✅ ${tokens} tokens asignados a`, customerEmail);
  }

  return NextResponse.json({ received: true });
}
