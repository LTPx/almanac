import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import stripe from "@/lib/stripe";

const SUBSCRIPTION_TRIAL_ID = process.env.STRIPE_PRICE_ID_TRIAL_SUBSCRIPTION!;
const SUBSCRIPTION_PREMIUM_ID =
  process.env.STRIPE_PRICE_ID_PREMIUM_SUBSCRIPTION!;

export async function POST(req: Request) {
  try {
    const { userId, testAttemptId } = await req.json();

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

    // Determinar si el usuario ya usó el trial
    const hasUsedTrial =
      user.subscriptionTrialEnd !== null ||
      ["CANCELED", "EXPIRED", "PAST_DUE", "UNPAID", "PAUSED"].includes(
        user.subscriptionStatus
      );

    // Calcular días restantes del trial interno (si aplica y no ha usado trial)
    let trialDays: number | undefined;
    if (
      !hasUsedTrial &&
      user.subscriptionStatus === "TRIALING" &&
      user.subscriptionTrialEnd
    ) {
      const now = new Date();
      const trialEnd = new Date(user.subscriptionTrialEnd);
      const diffTime = trialEnd.getTime() - now.getTime();
      const remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      trialDays = remainingDays > 0 ? remainingDays : undefined;
    }

    // Usar precio premium si ya usó trial, sino usar trial
    const priceId = hasUsedTrial
      ? SUBSCRIPTION_PREMIUM_ID
      : SUBSCRIPTION_TRIAL_ID;

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
    const testParam = testAttemptId ? `&testAttemptId=${testAttemptId}` : "";
    const cancelTestParam = testAttemptId
      ? `?testAttemptId=${testAttemptId}`
      : "";

    // Crear sesión de checkout
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      customer_email: !customerId ? user.email : undefined,
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      subscription_data: {
        // Solo incluir trial si no ha usado trial antes
        ...(hasUsedTrial ? {} : { trial_period_days: trialDays }),
        metadata: {
          userId: userId
        }
      },
      metadata: {
        userId: userId
      },
      success_url: `${baseUrl}/payments/success?session_id={CHECKOUT_SESSION_ID}${testParam}`,
      cancel_url: `${baseUrl}/store${cancelTestParam}`,
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
