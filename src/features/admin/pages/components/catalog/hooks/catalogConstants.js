export const emptyForm = {
  code: "",
  family: "MEMBERSHIP",
  name: "",
  description: "",
  groupSize: "",
  sessionCount: "",
  durationDays: "",
  isActive: true,
  prices: [],
};

export const accountTiers = [
  { code: "UMUM", name: "Umum" },
  { code: "PEGAWAI_KARYAWAN", name: "Pegawai / Karyawan" },
  { code: "MAHASISWA_NON_VOKASI", name: "Mahasiswa Non-Vokasi" },
  { code: "MAHASISWA_VOKASI", name: "Mahasiswa Vokasi" },
];

export const familyLabels = {
  MEMBERSHIP: {
    title: "Membership Catalog",
    subtitle: "Kelola catalog paket membership.",
    heading: "Daftar Membership Catalog",
    createButton: "Tambah Membership",
    modalTitle: "Membership Catalog",
    codePlaceholder: "MEMBERSHIP_MONTHLY",
  },
  PERSONAL_TRAINER: {
    title: "Trainer Catalog",
    subtitle: "Kelola catalog paket personal trainer.",
    heading: "Daftar Trainer Catalog",
    createButton: "Tambah Trainer Package",
    modalTitle: "Trainer Catalog",
    codePlaceholder: "PT_PRIVATE_8",
  },
};

export const catalogListEndpoints = {
  MEMBERSHIP: "/catalogs/membership",
  PERSONAL_TRAINER: "/catalogs/trainer",
};

export const formatCurrency = (value) =>
  new Intl.NumberFormat("id-ID", {
    currency: "IDR",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(Number(value || 0));

export const buildPricesPayload = (prices = []) =>
  prices
    .filter((item) => item.price !== "" && item.price !== null && item.price !== undefined)
    .map((item) => ({
      tierCode: item.tierCode,
      price: Number(item.price),
    }));

export const normalizeCatalogToForm = (item) => ({
  code: item.code || "",
  family: item.family || "MEMBERSHIP",
  name: item.name || "",
  description: item.description || "",
  groupSize: item.group_size ?? "",
  sessionCount: item.session_count ?? "",
  durationDays: item.duration_days ?? "",
  isActive: item.is_active !== false,
  prices: accountTiers.map((tier) => {
    const existingPrice = (item.prices || []).find((price) => price.tier_code === tier.code);
    return {
      tierCode: tier.code,
      tierName: existingPrice?.tier_name || tier.name,
      price: existingPrice?.price ?? "",
    };
  }),
});
