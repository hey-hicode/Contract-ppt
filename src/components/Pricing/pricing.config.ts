export type BillingPlan = "free" | "monthly" | "yearly" | "enterprise";

export const PRICING = {
  free: {
    plan: "free" as BillingPlan,
  },
  monthly: {
    plan: "monthly" as BillingPlan,
    priceId: process.env.STRIPE_PRICE_PREMIUM_MONTHLY!,
  },

  yearly: {
    plan: "yearly" as BillingPlan,
    priceId: process.env.STRIPE_PRICE_PREMIUM_YEARLY!,
  },
  enterprise: {
    plan: "enterprise" as BillingPlan,
  },
};
