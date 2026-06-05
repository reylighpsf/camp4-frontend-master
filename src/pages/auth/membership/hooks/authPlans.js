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

export const formatCatalogPrice = (value) =>
  `Rp ${Number(value || 0).toLocaleString("id-ID", { maximumFractionDigits: 0 })}`;

export const getCatalogPrice = (catalog) => {
  const prices = Array.isArray(catalog?.prices) ? catalog.prices : [];
  const vocationalPrice =
    prices.find((price) => price.tier_code === "MAHASISWA_VOKASI") ||
    prices.find((price) => price.tier_code === "UMUM") ||
    prices[0];

  return vocationalPrice?.price || 0;
};

export const getPlanIdFromCatalogCode = (code) => {
  const normalizedCode = String(code || "").toUpperCase();
  if (normalizedCode === "MEMBERSHIP_DAILY") return "daily";
  if (normalizedCode === "MEMBERSHIP_MONTHLY") return "premium";
  return normalizedCode.toLowerCase();
};

export const getTransactionTypeFromPlanId = (planId) => {
  if (planId === "daily") return "MEMBERSHIP_DAILY";
  if (planId === "student" || planId === "premium") return "MEMBERSHIP_MONTHLY";
  return String(planId || "").toUpperCase();
};

export const mapCatalogToMembershipPlan = (catalog) => ({
  benefits: [
    catalog.duration_days ? `${catalog.duration_days} hari gym access` : "Gym access sesuai katalog",
    catalog.session_count ? `${catalog.session_count} sesi` : "Personal member QR Code",
    catalog.group_size ? `Untuk ${catalog.group_size} peserta` : "Workout tracking dashboard",
    "Live gym capacity information",
  ],
  catalogCode: catalog.code,
  description: catalog.description || "Membership plan dari katalog backend.",
  id: getPlanIdFromCatalogCode(catalog.code),
  name: catalog.name,
  period: catalog.duration_days === 1 ? "day" : "month",
  price: formatCatalogPrice(getCatalogPrice(catalog)),
  prices: Array.isArray(catalog.prices)
    ? catalog.prices.map((price) => ({
        price: formatCatalogPrice(price.price),
        tierCode: price.tier_code,
        tierName: price.tier_name || String(price.tier_code || "").replaceAll("_", " "),
      }))
    : [],
});

export const mapCatalogsToMembershipPlans = (catalogs = []) => {
  const plans = catalogs
    .filter((catalog) => catalog.family === "MEMBERSHIP" && catalog.is_active !== false)
    .map(mapCatalogToMembershipPlan);

  return plans.length > 0 ? plans : authMembershipPlans;
};
