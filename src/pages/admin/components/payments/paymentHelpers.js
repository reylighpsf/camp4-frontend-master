export const paymentStyles = `
  .payments-head {
    align-items: center;
    display: flex;
    justify-content: space-between;
    gap: 18px;
    margin-bottom: 22px;
  }

  .payments-head-main {
    display: block;
  }

  .payments-head-main .payments-link {
    margin-top: 12px;
  }

  .payments-head h2 {
    font-size: 20px;
    margin: 0 0 6px;
  }

  .payments-head p,
  .payments-muted {
    color: #6b7280;
    font-size: 13px;
    margin: 0;
  }

  .payments-nav {
    display: flex;
    gap: 10px;
  }

  .payments-refresh,
  .payments-link {
    align-items: center;
    background: #11131d;
    border: 1px solid #11131d;
    border-radius: 8px;
    color: #fff;
    cursor: pointer;
    display: inline-flex;
    font: inherit;
    font-size: 12px;
    font-weight: 800;
    height: 40px;
    justify-content: center;
    padding: 0 16px;
    text-decoration: none;
    text-transform: uppercase;
  }

  .payments-link.secondary {
    background: #fff;
    color: #11131d;
  }

  .payments-refresh:disabled,
  .payments-action:disabled {
    cursor: not-allowed;
    opacity: 0.62;
  }

  .payments-alert {
    border-radius: 8px;
    font-size: 13px;
    margin-bottom: 16px;
    padding: 12px 14px;
  }

  .payments-alert.error {
    background: #fff1f0;
    color: #c73822;
  }

  .payments-alert.success {
    background: #edfdf3;
    color: #16794c;
  }

  .payments-detail {
    background: #f7f8fb;
    border: 1px solid #eceef3;
    border-radius: 8px;
    display: grid;
    gap: 14px;
    margin-bottom: 18px;
    padding: 16px;
  }

  .payments-detail h3 {
    color: #080478;
    font-size: 15px;
    margin: 0 0 4px;
  }

  .payments-detail p {
    color: #6b7280;
    font-size: 12px;
    font-weight: 800;
    margin: 0;
  }

  .payments-detail dl {
    display: grid;
    gap: 10px;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    margin: 0;
  }

  .payments-detail dt {
    color: #6b7280;
    font-size: 10px;
    font-weight: 900;
    text-transform: uppercase;
  }

  .payments-detail dd {
    color: #11131d;
    font-size: 12px;
    font-weight: 900;
    margin: 4px 0 0;
  }

  .payments-table-wrap {
    overflow-x: auto;
  }

  .payments-table {
    border-collapse: collapse;
    min-width: 980px;
    width: 100%;
  }

  .payments-table th {
    background: #f0f1f5;
    color: #30333d;
    font-size: 11px;
    padding: 14px;
    text-align: left;
    text-transform: uppercase;
  }

  .payments-table td {
    border-bottom: 1px solid #eceef3;
    font-size: 13px;
    padding: 14px;
    vertical-align: middle;
  }

  .payments-member strong {
    display: block;
    margin-bottom: 4px;
  }

  .payments-badge {
    border-radius: 999px;
    display: inline-flex;
    font-size: 11px;
    font-weight: 800;
    padding: 6px 10px;
    text-transform: uppercase;
  }

  .payments-badge.pending {
    background: #fff4d8;
    color: #9a5a00;
  }

  .payments-badge.success {
    background: #edfdf3;
    color: #16794c;
  }

  .payments-badge.failed {
    background: #fff1f0;
    color: #c73822;
  }

  .payments-method {
    background: #eef2ff;
    color: #080478;
  }

  .payments-proof {
    color: #16794c;
    font-size: 12px;
    font-weight: 800;
  }

  .payments-actions {
    display: flex;
    gap: 8px;
  }

  .payments-action {
    border-radius: 8px;
    cursor: pointer;
    font: inherit;
    font-size: 12px;
    font-weight: 800;
    height: 34px;
    padding: 0 12px;
    text-transform: uppercase;
  }

  .payments-action.accept {
    background: #16794c;
    border: 1px solid #16794c;
    color: #fff;
  }

  .payments-action.reject {
    background: #fff;
    border: 1px solid #c73822;
    color: #c73822;
  }

  .payments-table-status,
  .payments-empty {
    color: #6b7280;
    padding: 28px;
    text-align: center;
  }

  .payments-table-status.error {
    color: #c73822;
  }

  @media (max-width: 680px) {
    .payments-head {
      align-items: stretch;
      flex-direction: column;
    }

    .payments-nav,
    .payments-refresh,
    .payments-link {
      width: 100%;
    }

    .payments-nav {
      flex-direction: column;
    }

    .payments-detail dl {
      grid-template-columns: 1fr;
    }
  }
`;

export const formatCurrency = (value) =>
  new Intl.NumberFormat("id-ID", {
    currency: "IDR",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(Number(value || 0));

export const formatDateTime = (value) => {
  if (!value) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
};

export const formatTransactionType = (value) =>
  String(value || "-")
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
