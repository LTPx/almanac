import { NextResponse } from "next/server";
import Stripe from "stripe";
import prisma from "@/lib/prisma";
import stripe from "@/lib/stripe";

const webhookSecret = process.env.STRIPE_SUBSCRIPTION_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature")!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      );
    }

    // Manejar diferentes eventos
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.mode !== "subscription") {
          console.log(
            "⏭️ Ignorar checkout.session.completed (no es suscripción)"
          );
          break;
        }

        console.log("Checkout completado:", session.id);

        const userId = session.metadata?.userId;
        if (!userId) {
          console.error("No userId en metadata");
          break;
        }

        await prisma.user.update({
          where: { id: userId },
          data: {
            subscriptionStatus: "TRIALING"
          }
        });

        console.log(`Usuario ${userId} inició trial`);
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log("Suscripción actualizada:", subscription.id);

        // Buscar usuario por stripeCustomerId
        const user = await prisma.user.findFirst({
          where: {
            subscription: {
              stripeCustomerId: subscription.customer as string
            }
          }
        });

        // Si no existe por stripeCustomerId, buscar por metadata
        let finalUser = user;
        if (!user && subscription.metadata?.userId) {
          finalUser = await prisma.user.findUnique({
            where: { id: subscription.metadata.userId }
          });
        }

        if (!finalUser) {
          console.error(
            "Usuario no encontrado para customer:",
            subscription.customer
          );
          break;
        }

        // Mapear status de Stripe a nuestro enum
        const statusMap: Record<string, any> = {
          trialing: "TRIALING",
          active: "ACTIVE",
          past_due: "PAST_DUE",
          canceled: "CANCELED",
          unpaid: "UNPAID",
          incomplete: "INCOMPLETE",
          incomplete_expired: "INCOMPLETE_EXPIRED",
          paused: "PAUSED"
        };

        const mappedStatus = statusMap[subscription.status] || "FREE";

        console.log("🔍 Iniciando upsert de suscripción...");
        console.log("🔍 userId:", finalUser.id);
        console.log("🔍 subscriptionId:", subscription.id);

        // ⭐ IMPORTANTE: En API 2025-03-31+, current_period está en items, no en subscription
        const subscriptionItem = subscription.items.data[0];
        const currentPeriodStart = subscriptionItem.current_period_start
          ? new Date(subscriptionItem.current_period_start * 1000)
          : new Date(subscription.start_date * 1000);
        const currentPeriodEnd = subscriptionItem.current_period_end
          ? new Date(subscriptionItem.current_period_end * 1000)
          : new Date();

        console.log("🔍 currentPeriodStart:", currentPeriodStart);
        console.log("🔍 currentPeriodEnd:", currentPeriodEnd);

        // Actualizar o crear suscripción CON PLATFORM
        await prisma.subscription.upsert({
          where: { userId: finalUser.id },
          update: {
            platform: "STRIPE", // ⭐ IMPORTANTE: Especificar plataforma
            status: mappedStatus,
            currentPeriodStart,
            currentPeriodEnd,
            trialStart: subscription.trial_start
              ? new Date(subscription.trial_start * 1000)
              : null,
            trialEnd: subscription.trial_end
              ? new Date(subscription.trial_end * 1000)
              : null,
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            canceledAt: subscription.canceled_at
              ? new Date(subscription.canceled_at * 1000)
              : null,
            endedAt: subscription.ended_at
              ? new Date(subscription.ended_at * 1000)
              : null,
            // Stripe specific fields
            stripeSubscriptionId: subscription.id,
            stripeCustomerId: subscription.customer as string,
            stripePriceId: subscription.items.data[0].price.id,
            stripeProductId: subscription.items.data[0].price.product as string,
            // Limpiar campos de otras plataformas (por si acaso)
            googlePlaySubscriptionId: null,
            googlePlayProductId: null,
            googlePlayOrderId: null,
            googlePlayPackageName: null,
            appleTransactionId: null,
            appleOriginalTransactionId: null,
            appleProductId: null
          },
          create: {
            userId: finalUser.id,
            platform: "STRIPE", // ⭐ IMPORTANTE: Especificar plataforma
            stripeSubscriptionId: subscription.id,
            stripeCustomerId: subscription.customer as string,
            stripePriceId: subscription.items.data[0].price.id,
            stripeProductId: subscription.items.data[0].price.product as string,
            status: mappedStatus,
            currentPeriodStart,
            currentPeriodEnd,
            trialStart: subscription.trial_start
              ? new Date(subscription.trial_start * 1000)
              : null,
            trialEnd: subscription.trial_end
              ? new Date(subscription.trial_end * 1000)
              : null,
            cancelAtPeriodEnd: subscription.cancel_at_period_end
          }
        });

        // Actualizar campos en User también
        await prisma.user.update({
          where: { id: finalUser.id },
          data: {
            subscriptionStatus: mappedStatus,
            subscriptionCurrentPeriodEnd: currentPeriodEnd,
            subscriptionTrialEnd: subscription.trial_end
              ? new Date(subscription.trial_end * 1000)
              : null,
            subscriptionCancelAtPeriodEnd: subscription.cancel_at_period_end
          }
        });

        // ⭐ OPCIONAL: Registrar transacción para historial
        if (event.type === "customer.subscription.created") {
          await prisma.paymentTransaction.create({
            data: {
              userId: finalUser.id,
              platform: "STRIPE",
              transactionId: subscription.id,
              type: subscription.trial_end
                ? "SUBSCRIPTION_START"
                : "TRIAL_CONVERSION",
              amount: subscription.items.data[0].price.unit_amount,
              currency:
                subscription.items.data[0].price.currency?.toUpperCase(),
              status: "succeeded",
              metadata: {
                stripeSubscriptionId: subscription.id,
                stripePriceId: subscription.items.data[0].price.id
              }
            }
          });
        }

        console.log(
          `Suscripción actualizada para usuario ${finalUser.id} - Status: ${mappedStatus}`
        );
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log("Suscripción cancelada:", subscription.id);

        const user = await prisma.user.findFirst({
          where: {
            subscription: {
              stripeCustomerId: subscription.customer as string
            }
          }
        });

        if (!user) {
          console.error("Usuario no encontrado");
          break;
        }

        // Marcar como cancelada
        await prisma.subscription.update({
          where: { userId: user.id },
          data: {
            status: "CANCELED",
            endedAt: new Date(),
            canceledAt: new Date()
          }
        });

        await prisma.user.update({
          where: { id: user.id },
          data: {
            subscriptionStatus: "FREE",
            subscriptionCancelAtPeriodEnd: false
          }
        });

        // ⭐ OPCIONAL: Registrar cancelación
        await prisma.paymentTransaction.create({
          data: {
            userId: user.id,
            platform: "STRIPE",
            transactionId: subscription.id,
            type: "SUBSCRIPTION_CANCEL",
            status: "succeeded",
            metadata: {
              reason:
                subscription.cancellation_details?.reason || "user_requested"
            }
          }
        });

        console.log(`Suscripción cancelada para usuario ${user.id}`);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log("Pago exitoso:", invoice.id);

        // Esto se dispara después del trial cuando se cobra por primera vez
        if (invoice.billing_reason === "subscription_cycle") {
          const user = await prisma.user.findFirst({
            where: {
              subscription: {
                stripeCustomerId: invoice.customer as string
              }
            }
          });

          if (user) {
            await prisma.user.update({
              where: { id: user.id },
              data: {
                subscriptionStatus: "ACTIVE"
              }
            });

            // ⭐ OPCIONAL: Registrar renovación
            await prisma.paymentTransaction.create({
              data: {
                userId: user.id,
                platform: "STRIPE",
                transactionId: invoice.id,
                type:
                  // @ts-expect-error overlap type
                  invoice.billing_reason === "subscription_create"
                    ? "TRIAL_CONVERSION"
                    : "SUBSCRIPTION_RENEWAL",
                amount: invoice.amount_paid,
                currency: invoice.currency?.toUpperCase(),
                status: "succeeded",
                metadata: {
                  invoiceId: invoice.id
                  // subscriptionId: invoice.subscription as string
                }
              }
            });

            console.log("Primer pago después del trial - usuario activo");
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log("Pago fallido:", invoice.id);

        const user = await prisma.user.findFirst({
          where: {
            subscription: {
              stripeCustomerId: invoice.customer as string
            }
          }
        });

        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              subscriptionStatus: "PAST_DUE"
            }
          });

          // ⭐ OPCIONAL: Registrar fallo de pago
          await prisma.paymentTransaction.create({
            data: {
              userId: user.id,
              platform: "STRIPE",
              transactionId: invoice.id,
              type: "SUBSCRIPTION_RENEWAL",
              amount: invoice.amount_due,
              currency: invoice.currency?.toUpperCase(),
              status: "failed",
              metadata: {
                invoiceId: invoice.id,
                failureReason: invoice.last_finalization_error?.message
              }
            }
          });

          console.log(`Pago fallido para usuario ${user.id}`);
          // TODO: Enviar email de notificación
        }
        break;
      }

      default:
        console.log(`Evento no manejado: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Webhook error:", err);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
