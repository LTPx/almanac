import {
  PrismaClient,
  SubscriptionStatus,
  PaymentPlatform
} from "@prisma/client";
import Stripe from "stripe";

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
  apiVersion: "2025-10-29.clover"
});

export interface SubscriptionCheck {
  isActive: boolean;
  isPremium: boolean;
  isTrialing: boolean;
  status: SubscriptionStatus;
  platform?: PaymentPlatform;
  daysLeft?: number;
  willCancelAtPeriodEnd: boolean;
}

/**
 * Verifica si un usuario tiene una suscripción activa
 * Funciona con Stripe, Google Play y Apple
 */
export async function checkUserSubscription(
  userId: string
): Promise<SubscriptionCheck> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      subscription: true
    }
  });

  if (!user) {
    throw new Error("Usuario no encontrado");
  }

  const status = user.subscriptionStatus;
  const isTrialing = status === "TRIALING";
  const isActive = status === "ACTIVE";
  const isPremium = isTrialing || isActive;
  const willCancelAtPeriodEnd = user.subscriptionCancelAtPeriodEnd;

  let daysLeft: number | undefined;

  if (user.subscriptionCurrentPeriodEnd) {
    const now = new Date();
    const endDate = new Date(user.subscriptionCurrentPeriodEnd);
    const diffTime = endDate.getTime() - now.getTime();
    daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  return {
    isActive,
    isPremium,
    isTrialing,
    status,
    platform: user.subscription?.platform,
    daysLeft,
    willCancelAtPeriodEnd
  };
}

/**
 * Middleware para proteger rutas premium
 */
export async function requirePremium(userId: string): Promise<boolean> {
  const check = await checkUserSubscription(userId);

  if (!check.isPremium) {
    throw new Error("Se requiere suscripción premium");
  }

  return true;
}

/**
 * Obtener información detallada de la suscripción
 * Incluye información específica de la plataforma
 */
export async function getUserSubscriptionInfo(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      subscriptionStatus: true,
      subscriptionCurrentPeriodEnd: true,
      subscriptionTrialEnd: true,
      subscriptionCancelAtPeriodEnd: true,
      subscription: {
        select: {
          platform: true,
          status: true,
          currentPeriodStart: true,
          currentPeriodEnd: true,
          trialStart: true,
          trialEnd: true,
          cancelAtPeriodEnd: true,
          canceledAt: true,
          // Stripe fields
          stripeSubscriptionId: true,
          stripeCustomerId: true,
          stripePriceId: true,
          // Google Play fields
          googlePlaySubscriptionId: true,
          googlePlayProductId: true,
          // Apple fields
          appleTransactionId: true,
          appleProductId: true,
          metadata: true
        }
      }
    }
  });

  if (!user) {
    throw new Error("Usuario no encontrado");
  }

  const check = await checkUserSubscription(userId);

  return {
    ...user,
    ...check
  };
}

/**
 * Cancelar suscripción al final del período
 * Solo funciona con Stripe (Google Play y Apple tienen sus propios métodos)
 */
export async function cancelSubscriptionAtPeriodEnd(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { subscription: true }
  });

  if (!user?.subscription) {
    throw new Error("No hay suscripción activa");
  }

  const platform = user.subscription.platform;

  // Solo Stripe se maneja aquí, otras plataformas necesitan sus propias implementaciones
  if (platform !== "STRIPE") {
    throw new Error(
      `Cancelación desde ${platform} no implementada en esta función. Usar la API nativa de ${platform}.`
    );
  }

  if (!user.subscription.stripeSubscriptionId) {
    throw new Error("No hay stripeSubscriptionId");
  }

  // Cancelar en Stripe
  await stripe.subscriptions.update(user.subscription.stripeSubscriptionId, {
    cancel_at_period_end: true
  });

  // Actualizar en DB
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

  try {
    await prisma.paymentTransaction.create({
      data: {
        userId: user.id,
        platform: "STRIPE",
        transactionId: user.subscription.stripeSubscriptionId,
        type: "SUBSCRIPTION_CANCEL",
        status: "succeeded",
        metadata: {
          cancelAtPeriodEnd: true,
          canceledBy: "user"
        }
      }
    });
  } catch (error) {
    console.log(error);
    // Si no existe el modelo PaymentTransaction, ignorar
    console.log("PaymentTransaction no registrado (modelo no existe)");
  }

  return { success: true };
}

/**
 * Reactivar suscripción cancelada
 * Solo funciona con Stripe
 */
export async function reactivateSubscription(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { subscription: true }
  });

  if (!user?.subscription) {
    throw new Error("No hay suscripción para reactivar");
  }

  const platform = user.subscription.platform;

  if (platform !== "STRIPE") {
    throw new Error(
      `Reactivación desde ${platform} no implementada en esta función.`
    );
  }

  if (!user.subscription.stripeSubscriptionId) {
    throw new Error("No hay stripeSubscriptionId");
  }

  await stripe.subscriptions.update(user.subscription.stripeSubscriptionId, {
    cancel_at_period_end: false
  });

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

  return { success: true };
}

/**
 * Verificar si el usuario tiene beneficios premium específicos
 */
export async function checkPremiumFeature(
  userId: string
  // feature: "unlimited_hearts" | "no_ads" | "advanced_content" | "priority_support"
): Promise<boolean> {
  const check = await checkUserSubscription(userId);

  // Todos los usuarios premium tienen acceso a todas las funciones
  // Puedes personalizar esto si quieres diferentes tiers
  return check.isPremium;
}

/**
 * Obtener estadísticas de la suscripción (útil para analytics)
 */
export async function getSubscriptionStats(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      subscription: true
    }
  });

  if (!user?.subscription) {
    return null;
  }

  const subscription = user.subscription;
  const now = new Date();
  const periodStart = new Date(subscription.currentPeriodStart);
  const periodEnd = new Date(subscription.currentPeriodEnd);

  const totalDays = Math.ceil(
    (periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24)
  );
  const daysUsed = Math.ceil(
    (now.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24)
  );
  const daysLeft = Math.ceil(
    (periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  const percentageUsed = (daysUsed / totalDays) * 100;

  return {
    platform: subscription.platform,
    status: subscription.status,
    totalDays,
    daysUsed,
    daysLeft,
    percentageUsed: Math.min(100, Math.max(0, percentageUsed)),
    currentPeriodStart: subscription.currentPeriodStart,
    currentPeriodEnd: subscription.currentPeriodEnd,
    isTrialing: subscription.status === "TRIALING",
    willCancel: subscription.cancelAtPeriodEnd
  };
}

/**
 * Verificar si el trial ha expirado y actualizar status si es necesario
 */
export async function checkAndUpdateTrialStatus(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { subscription: true }
  });

  if (!user?.subscription) {
    return false;
  }

  const now = new Date();
  const subscription = user.subscription;

  // Si está en trial y el trial expiró
  if (
    subscription.status === "TRIALING" &&
    subscription.trialEnd &&
    now > new Date(subscription.trialEnd)
  ) {
    // Actualizar a FREE (el webhook de Stripe normalmente hace esto, pero por si acaso)
    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionStatus: "FREE"
      }
    });

    await prisma.subscription.update({
      where: { userId: user.id },
      data: {
        status: "FREE"
      }
    });

    return true; // Trial expirado
  }

  return false; // Trial aún activo o no en trial
}
