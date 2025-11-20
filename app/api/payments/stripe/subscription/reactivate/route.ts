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
        { error: "No se encontró una suscripción" },
        { status: 404 }
      );
    }

    const subscription = user.subscription;

    // Verificar que sea Stripe
    if (subscription.platform !== "STRIPE") {
      return NextResponse.json(
        {
          error: `Reactivación desde ${subscription.platform} no está disponible desde aquí.`
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

    // Verificar que esté marcada para cancelar
    if (!subscription.cancelAtPeriodEnd) {
      return NextResponse.json(
        {
          error: "La suscripción no está programada para cancelarse",
          subscription: {
            willCancel: false
          }
        },
        { status: 400 }
      );
    }

    // Reactivar suscripción en Stripe
    const updatedSubscription = await stripe.subscriptions.update(
      subscription.stripeSubscriptionId,
      {
        cancel_at_period_end: false
      }
    );

    console.log("Suscripción reactivada:", updatedSubscription.id);

    // Actualizar en base de datos
    await prisma.subscription.update({
      where: { userId: user.id },
      data: {
        cancelAtPeriodEnd: false
      }
    });

    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionCancelAtPeriodEnd: false
      }
    });

    return NextResponse.json({
      success: true,
      message:
        subscription.status === "TRIALING"
          ? "Tu trial continuará y se renovará automáticamente al finalizar."
          : "Tu suscripción se renovará automáticamente.",
      subscription: {
        willCancel: false,
        renewsAt: subscription.currentPeriodEnd,
        daysUntilRenewal: Math.ceil(
          (new Date(subscription.currentPeriodEnd).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24)
        )
      }
    });
  } catch (error: any) {
    console.error("Error reactivando suscripción:", error);
    return NextResponse.json(
      {
        error: error.message || "Error al reactivar suscripción"
      },
      { status: 500 }
    );
  }
}
