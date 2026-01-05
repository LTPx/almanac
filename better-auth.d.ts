declare module "better-auth/types" {
  interface User {
    hearts?: number;
    zapTokens?: number;
    subscriptionStatus?: string;
    walletAddress?: string | null;
    languagePreference?: string | null;
  }
}
