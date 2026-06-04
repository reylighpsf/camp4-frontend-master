export const authMembershipPlans = [
  {
    id: "student",
    name: "Vocational Student Plan",
    price: "Rp 100.000",
    period: "month",
    description: "Best for students who train regularly after class.",
    benefits: [
      "1-month gym access",
      "Personal member QR Code",
      "Workout tracking dashboard",
      "Trainer booking access",
      "Live gym capacity information",
    ],
  },
  {
    id: "daily",
    name: "Daily Pass",
    price: "Rp 15.000",
    period: "day",
    description: "Quick access for one gym visit with check-in support.",
    benefits: [
      "One-day gym access",
      "Cardio and strength equipment",
      "Same-day QR check-in",
      "Locker access during visit",
    ],
  },
  {
    id: "premium",
    name: "Premium Membership",
    price: "Rp 497.000",
    period: "month",
    description: "Full membership for consistent training and coaching.",
    benefits: [
      "Unlimited gym facilities",
      "Secure locker access",
      "Personal workout guidance",
      "Monthly fitness tracking",
      "Member event discounts",
    ],
  },
];

export const getAuthMembershipPlan = (planId) =>
  authMembershipPlans.find((plan) => plan.id === planId) ||
  authMembershipPlans[0];
