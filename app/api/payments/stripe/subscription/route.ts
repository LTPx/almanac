import { NextResponse } from "next/server";
import Stripe from "stripe";
import prisma from "@/lib/prisma";

const SUBSCRIPTION_ID = process.env.STRIPE_PRICE_ID_SUBSCRIPTION!;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
  apiVersion: "2025-10-29.clover"
});

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    const existingCustomers = await stripe.customers.list({
      email: user.email,
      limit: 1
    });

    let customerId;

    if (existingCustomers.data.length > 0) {
      customerId = existingCustomers.data[0].id;

      // Verificar si ya tiene suscripciones activas
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: "active",
        limit: 1
      });

      if (subscriptions.data.length > 0) {
        return NextResponse.json(
          { error: "Ya tienes una suscripción activa" },
          { status: 400 }
        );
      }
    }

    // Crear sesión de checkout con trial de 7 días
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      customer_email: !customerId ? user.email : undefined,
      line_items: [
        {
          price: SUBSCRIPTION_ID,
          quantity: 1
        }
      ],
      subscription_data: {
        trial_period_days: 7, // 7 días gratis
        metadata: {
          userId: userId
        }
      },
      metadata: {
        userId: userId
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payments/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/store`,
      allow_promotion_codes: true,
      billing_address_collection: "auto"
    });

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (err: any) {
    console.error("Stripe Subscription Error:", err);
    return NextResponse.json(
      { error: err.message || "Error al crear suscripción" },
      { status: 500 }
    );
  }
}

// Endpoint para verificar el estado de la suscripción
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID requerido" },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    return NextResponse.json({
      status: session.status,
      customer_email: session.customer_email,
      subscription: session.subscription
    });
  } catch (err: any) {
    console.error("Error al verificar sesión:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
