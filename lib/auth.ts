import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma";

const TRIAL_DAYS = 7;

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql"
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: false
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string
    }
  },
  rateLimit: {
    window: 60, // time window in seconds
    max: 10
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          // Configurar trial automático de 7 días para usuarios nuevos
          const trialEnd = new Date();
          trialEnd.setDate(trialEnd.getDate() + TRIAL_DAYS);
          await prisma.user.update({
            where: { id: user.id },
            data: {
              subscriptionTrialEnd: trialEnd,
              subscriptionCurrentPeriodEnd: trialEnd
            }
          });
        }
      }
    }
  },
  user: {
    additionalFields: {
      hearts: {
        type: "number",
        required: false,
        defaultValue: 5
      },
      zapTokens: {
        type: "number",
        required: false,
        defaultValue: 0
      },
      subscriptionStatus: {
        type: "string",
        required: false,
        defaultValue: "TRIALING"
      },
      walletAddress: {
        type: "string",
        required: false,
        defaultValue: null
      },
      languagePreference: {
        type: "string",
        required: false,
        defaultValue: null
      },
      dateOfBirth: {
        type: "date",
        required: false,
        defaultValue: null
      }
    }
  }
});
