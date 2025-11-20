import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import stripe from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "userId requerido" }, { status: 400 });
    }

    // Buscar usuario con su suscripción
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true }
    });

    if (!user || !user.subscription) {
      return NextResponse.json(
        { error: "No se encontró una suscripción activa" },
        { status: 404 }
      );
    }

    const subscription = user.subscription;

    // Verificar que sea Stripe
    if (subscription.platform !== "STRIPE") {
      return NextResponse.json(
        {
          error: `Cancelación desde ${subscription.platform} no está disponible desde aquí. Por favor usa la tienda de ${subscription.platform}.`
        },
        { status: 400 }
      );
    }

    if (!subscription.stripeSubscriptionId) {
      return NextResponse.json(
        { error: "No se encontró stripeSubscriptionId" },
        { status: 400 }
      );
    }

    // Ya está marcada para cancelar
    if (subscription.cancelAtPeriodEnd) {
      return NextResponse.json(
        {
          error: "La suscripción ya está programada para cancelarse",
          subscription: {
            willCancel: true,
            endsAt: subscription.currentPeriodEnd
          }
        },
        { status: 400 }
      );
    }

    // Cancelar en Stripe al final del período
    // Esto mantiene activo el trial/período actual pero NO cobra después
    const updatedSubscription = await stripe.subscriptions.update(
      subscription.stripeSubscriptionId,
      {
        cancel_at_period_end: true
      }
    );

    console.log("Suscripción marcada para cancelar:", updatedSubscription.id);

    // Actualizar en base de datos
    await prisma.subscription.update({
      where: { userId: user.id },
      data: {
        cancelAtPeriodEnd: true
      }
    });

    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionCancelAtPeriodEnd: true
      }
    });

    // Registrar transacción (opcional)
    try {
      await prisma.paymentTransaction.create({
        data: {
          userId: user.id,
          platform: "STRIPE",
          transactionId: subscription.stripeSubscriptionId,
          type: "SUBSCRIPTION_CANCEL",
          status: "succeeded",
          metadata: {
            cancelAtPeriodEnd: true,
            canceledBy: "user",
            reason: "user_requested"
          }
        }
      });
    } catch (error) {
      console.log("error: ", error);
      console.log("PaymentTransaction no registrado (modelo puede no existir)");
    }

    return NextResponse.json({
      success: true,
      message:
        subscription.status === "TRIALING"
          ? "Tu trial continuará hasta el final del período. No se te cobrará."
          : "Tu suscripción continuará hasta el final del período actual.",
      subscription: {
        willCancel: true,
        endsAt: subscription.currentPeriodEnd,
        daysLeft: Math.ceil(
          (new Date(subscription.currentPeriodEnd).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24)
        )
      }
    });
  } catch (error: any) {
    console.error("Error cancelando suscripción:", error);
    return NextResponse.json(
      {
        error: error.message || "Error al cancelar suscripción"
      },
      { status: 500 }
    );
  }
}
