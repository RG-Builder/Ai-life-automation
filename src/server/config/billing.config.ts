export type BillingPlan = {
  amount: number;
  currency: string;
  billingPeriod: "monthly" | "yearly";
};

export const BILLING_PLANS: Record<string, BillingPlan> = {
  monthly_premium: {
    amount: 199,
    currency: "INR",
    billingPeriod: "monthly",
  },
};
