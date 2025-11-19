import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
  apiVersion: "2025-10-29.clover"
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

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
        console.log("Checkout completado:", session.id);

        // Aquí actualizas tu base de datos con el inicio del trial
        const userId = session.metadata?.userId;
        if (userId) {
          // TODO: Actualizar tu DB
          // await updateUserSubscription(userId, {
          //   stripeCustomerId: session.customer,
          //   stripeSubscriptionId: session.subscription,
          //   status: 'trialing',
          //   trialEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          // });
          console.log(`Usuario ${userId} inició trial`);
        }
        break;
      }

      case "customer.subscription.created": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log("Suscripción creada:", subscription.id);

        const userId = subscription.metadata?.userId;
        if (userId) {
          // TODO: Actualizar DB
          console.log(`Suscripción creada para usuario ${userId}`);
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log("Suscripción actualizada:", subscription.id);

        const userId = subscription.metadata?.userId;
        if (userId) {
          // TODO: Actualizar DB con el nuevo estado
          // await updateUserSubscription(userId, {
          //   status: subscription.status,
          //   currentPeriodEnd: new Date(subscription.current_period_end * 1000)
          // });
          console.log(`Estado: ${subscription.status} para usuario ${userId}`);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log("Suscripción cancelada:", subscription.id);

        const userId = subscription.metadata?.userId;
        if (userId) {
          // TODO: Marcar suscripción como cancelada en tu DB
          // await updateUserSubscription(userId, {
          //   status: 'canceled'
          // });
          console.log(`Suscripción cancelada para usuario ${userId}`);
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log("Pago exitoso:", invoice.id);

        // Esto se dispara después del trial cuando se cobra por primera vez
        if (invoice.billing_reason === "subscription_cycle") {
          console.log("Primer pago después del trial");
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log("Pago fallido:", invoice.id);

        // TODO: Notificar al usuario sobre el fallo de pago
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

// Importante: Deshabilitar el body parser de Next.js para webhooks
export const config = {
  api: {
    bodyParser: false
  }
};
