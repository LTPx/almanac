import { betterAuth } from "better-auth";
import { createAuthMiddleware } from "better-auth/api";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { createWalletForUser } from "./wallet-service";
import prisma from "./prisma";

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
      }
    }
  },
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      // Tu lógica existente de mensajes
      if (ctx.path.startsWith("/sign-in")) {
        const newSession = ctx.context.newSession;
        if (newSession) {
          try {
            // Verificar si ya tiene wallet
            const user = await prisma.user.findUnique({
              where: { id: newSession.user.id },
              select: { walletAddress: true }
            });

            if (!user?.walletAddress) {
              console.log("🎉 Google user needs wallet, generating...");
              await createWalletForUser(newSession.user.id);
            }
          } catch (error) {
            console.error("Failed to create wallet for Google user:", error);
          }
        }
      }

      // También manejar usuarios de Google
      if (ctx.path.includes("/callback/google")) {
        const newSession = ctx.context.newSession;
        if (newSession) {
          try {
            // Verificar si ya tiene wallet
            const user = await prisma.user.findUnique({
              where: { id: newSession.user.id },
              select: { walletAddress: true }
            });

            if (!user?.walletAddress) {
              console.log("🎉 Google user needs wallet, generating...");
              await createWalletForUser(newSession.user.id);
            }
          } catch (error) {
            console.error("Failed to create wallet for Google user:", error);
          }
        }
      }
    })
  }
});
