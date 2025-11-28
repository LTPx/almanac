import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
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
      },
      subscriptionStatus: {
        type: "string",
        required: false,
        defaultValue: "FREE"
      },
      walletAddress: {
        type: "string",
        required: false,
        defaultValue: null
      }
    }
  }
});
