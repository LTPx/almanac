import type { SubscriptionStatus } from "@prisma/client";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

interface StatusConfig {
  label: string;
  variant: BadgeVariant;
}

export const subscriptionStatusConfig: Record<SubscriptionStatus, StatusConfig> = {
  FREE: { label: "Free", variant: "secondary" },
  TRIALING: { label: "Trial", variant: "outline" },
  ACTIVE: { label: "Active", variant: "default" },
  PAST_DUE: { label: "Past Due", variant: "destructive" },
  CANCELED: { label: "Canceled", variant: "destructive" },
  UNPAID: { label: "Unpaid", variant: "destructive" },
  INCOMPLETE: { label: "Incomplete", variant: "outline" },
  INCOMPLETE_EXPIRED: { label: "Expired", variant: "destructive" },
  PAUSED: { label: "Paused", variant: "outline" },
  PENDING: { label: "Pending", variant: "outline" },
  ON_HOLD: { label: "On Hold", variant: "outline" },
  EXPIRED: { label: "Expired", variant: "destructive" }
};

export function getSubscriptionStatusConfig(status: SubscriptionStatus): StatusConfig {
  return subscriptionStatusConfig[status];
}
