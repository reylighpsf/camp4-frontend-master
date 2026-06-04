import { Link, useNavigate } from "react-router";
import { useEffect } from "react";
import { authMembershipPlans, getAuthMembershipPlan } from "./membership/hooks/authPlans";

const steps = [
  "Choose Plan",
  "Create Account",
  "Verify Email",
  "Payment",
];

const checkMark = "\u2713";

export function Toast({ message, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="auth-toast">
      <span>{message}</span>
      <button onClick={onClose} className="auth-toast-close" aria-label="Tutup">
        x
      </button>
    </div>
  );
}

export function MembershipSummary({ actionLabel = "Change Plan", planId = "student" }) {
  const selectedPlan = getAuthMembershipPlan(planId);

  return (
    <aside className="auth-summary" aria-label="Selected membership">
      <h2>Selected Membership</h2>
      <strong>{selectedPlan.name}</strong>
      <p className="auth-price">
        {selectedPlan.price} / {selectedPlan.period}
      </p>

      <div className="auth-divider" />

      <p className="auth-benefit-title">Included Benefits:</p>
      <ul className="auth-benefits">
        {selectedPlan.benefits.map((benefit) => (
          <li key={benefit}>
            <span aria-hidden="true">{checkMark}</span>
            {benefit}
          </li>
        ))}
      </ul>

      <Link to="/choose-plan" className="auth-summary-btn">
        {actionLabel}
      </Link>
    </aside>
  );
}

export function MembershipPlanCards() {
  return (
    <div className="auth-plan-grid">
      {authMembershipPlans.map((plan, index) => (
        <article
          className={`auth-plan-card${index === 0 ? " is-featured" : ""}`}
          key={plan.id}
        >
          {index === 0 && <span className="auth-plan-badge">Recommended</span>}
          <h2>{plan.name}</h2>
          <p className="auth-plan-description">{plan.description}</p>
          <p className="auth-plan-price">
            {plan.price}
            <span> / {plan.period}</span>
          </p>
          <ul className="auth-benefits auth-plan-benefits">
            {plan.benefits.slice(0, 4).map((benefit) => (
              <li key={benefit}>
                <span aria-hidden="true">{checkMark}</span>
                {benefit}
              </li>
            ))}
          </ul>
          <Link to={`/sign-up?plan=${plan.id}`} className="auth-primary-btn">
            Choose Plan
          </Link>
        </article>
      ))}
    </div>
  );
}

export function AuthFrame({
  children,
  currentStep = 2,
  aside = <MembershipSummary />,
  contentClassName = "",
  showSteps = true,
}) {
  const navigate = useNavigate();

  return (
    <>
      <style>{authStyles}</style>
      <main className="auth-checkout-page">
        {showSteps && (
          <header className="auth-stepbar" aria-label="Registration progress">
            <button
              type="button"
              className="auth-back"
              onClick={() => navigate(-1)}
              aria-label="Kembali"
            >
              &larr;
            </button>
            <ol className="auth-steps">
              {steps.map((step, index) => {
                const stepNumber = index + 1;
                const isDone = stepNumber < currentStep;
                const isActive = stepNumber === currentStep;

                return (
                  <li
                    key={step}
                    className={`auth-step${isDone ? " is-done" : ""}${
                      isActive ? " is-active" : ""
                    }`}
                  >
                    <span className="auth-step-dot">
                      {isDone ? checkMark : stepNumber}
                    </span>
                    <span>{step}</span>
                  </li>
                );
              })}
            </ol>
          </header>
        )}

        <div className={`auth-checkout-shell ${contentClassName}`}>
          <section className="auth-card">{children}</section>
          {aside}
        </div>
      </main>
    </>
  );
}

const authStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; }

  body { margin: 0; }

  .auth-checkout-page {
    min-height: 100vh;
    background: #cfd1e4;
    color: #171267;
    font-family: 'DM Sans', sans-serif;
  }

  .auth-stepbar {
    min-height: 64px;
    background: #fff;
    display: grid;
    grid-template-columns: 44px minmax(0, 1fr);
    align-items: center;
    gap: 18px;
    padding: 0 38px;
    box-shadow: 0 1px 0 rgba(23, 18, 103, 0.08);
  }

  .auth-back {
    width: 28px;
    height: 28px;
    border: 0;
    background: transparent;
    color: #111;
    cursor: pointer;
    font-size: 25px;
    line-height: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .auth-steps {
    list-style: none;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 34px;
    margin: 0;
    padding: 0;
  }

  .auth-step {
    min-width: 112px;
    position: relative;
    display: flex;
    align-items: center;
    gap: 10px;
    color: #9aa1b7;
    font-size: 13px;
    font-weight: 700;
    white-space: nowrap;
  }

  .auth-step:not(:last-child)::after {
    content: "";
    position: absolute;
    left: calc(100% + 8px);
    top: 50%;
    width: 48px;
    height: 2px;
    background: #ffb394;
    transform: translateY(-50%);
  }

  .auth-step.is-done { color: #24c870; }
  .auth-step.is-active { color: #ff6b20; }

  .auth-step-dot {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: #e7eaf2;
    color: #9aa1b7;
    font-size: 12px;
    font-weight: 800;
    flex: 0 0 auto;
  }

  .auth-step.is-done .auth-step-dot {
    background: #ecfff5;
    color: #24c870;
    border: 2px solid #24c870;
  }

  .auth-step.is-active .auth-step-dot {
    background: #ff6b20;
    color: #fff;
  }

  .auth-checkout-shell {
    width: min(100%, 1180px);
    margin: 0 auto;
    padding: 44px 34px;
    display: grid;
    grid-template-columns: minmax(0, 710px) 330px;
    gap: 24px;
    align-items: start;
  }

  .auth-checkout-shell.auth-centered {
    grid-template-columns: minmax(0, 610px) 330px;
    justify-content: center;
  }

  .auth-checkout-shell.auth-plan-page {
    grid-template-columns: minmax(0, 1080px);
    justify-content: center;
  }

  .auth-checkout-shell.auth-signin-page {
    min-height: 100vh;
    grid-template-columns: minmax(0, 460px);
    justify-content: center;
    align-items: center;
  }

  .auth-card,
  .auth-summary {
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 1px 0 rgba(23, 18, 103, 0.04);
  }

  .auth-card {
    padding: 30px 40px 34px;
  }

  .auth-card h1 {
    margin: 0 0 8px;
    color: #171267;
    font-size: 24px;
    line-height: 1.15;
    font-weight: 800;
    letter-spacing: 0;
  }

  .auth-subtitle {
    margin: 0 0 25px;
    max-width: 560px;
    color: #384076;
    font-size: 13px;
    line-height: 1.35;
    font-weight: 700;
  }

  .auth-form-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 13px 16px;
  }

  .auth-field {
    min-width: 0;
  }

  .auth-field.full {
    grid-column: 1 / -1;
  }

  .auth-field label,
  .auth-check {
    color: #171267;
    font-size: 12px;
    font-weight: 800;
  }

  .auth-field label {
    display: block;
    margin-bottom: 6px;
  }

  .auth-field input {
    width: 100%;
    height: 38px;
    border: 1px solid transparent;
    border-radius: 7px;
    background: #f3f4f8;
    color: #171267;
    font: inherit;
    font-size: 12px;
    font-weight: 700;
    outline: none;
    padding: 0 13px;
    transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
  }

  .auth-field input::placeholder {
    color: #5f67a6;
    opacity: 0.85;
  }

  .auth-field input:focus {
    background: #fff;
    border-color: #171267;
    box-shadow: 0 0 0 3px rgba(23, 18, 103, 0.1);
  }

  .auth-field input.has-error {
    border-color: #ff6b20;
    box-shadow: 0 0 0 3px rgba(255, 107, 32, 0.12);
  }

  .auth-error {
    min-height: 16px;
    margin: 4px 0 0;
    color: #d84b17;
    font-size: 11px;
    line-height: 1.25;
    font-weight: 700;
  }

  .auth-upload {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 18px;
  }

  .auth-upload input { display: none; }

  .auth-avatar {
    width: 39px;
    height: 39px;
    border-radius: 4px;
    background: #f3f4f8;
    overflow: hidden;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: #171267;
    font-size: 18px;
    font-weight: 800;
  }

  .auth-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .auth-upload-link {
    color: #171267;
    cursor: pointer;
    font-size: 13px;
    font-weight: 800;
    text-decoration: underline;
  }

  .auth-check {
    grid-column: 1 / -1;
    display: flex;
    align-items: center;
    gap: 9px;
    min-height: 22px;
    margin-top: 3px;
  }

  .auth-check input {
    width: 13px;
    height: 13px;
    accent-color: #171267;
  }

  .auth-check a {
    color: #ff5f18;
    text-decoration: none;
  }

  .auth-primary-btn,
  .auth-secondary-btn,
  .auth-summary-btn {
    min-height: 39px;
    border: 0;
    border-radius: 7px;
    background: #ff6b20;
    color: #fff;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    font: inherit;
    font-size: 12px;
    font-weight: 800;
    transition: transform 0.15s, box-shadow 0.2s, opacity 0.2s;
  }

  .auth-primary-btn {
    width: 100%;
    margin-top: 19px;
  }

  .auth-primary-btn:hover:not(:disabled),
  .auth-secondary-btn:hover,
  .auth-summary-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 18px rgba(255, 107, 32, 0.22);
  }

  .auth-primary-btn:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }

  .auth-secondary-btn {
    width: min(100%, 260px);
    background: #171267;
  }

  .auth-outline-btn {
    width: min(100%, 260px);
    min-height: 39px;
    border: 1px solid #171267;
    border-radius: 7px;
    background: #fff;
    color: #171267;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    font-size: 12px;
    font-weight: 800;
  }

  .auth-footer {
    margin: 16px 0 0;
    text-align: center;
    color: #171267;
    font-size: 12px;
    font-weight: 800;
  }

  .auth-footer a,
  .auth-link {
    color: #ff5f18;
    text-decoration: none;
  }

  .auth-link {
    display: inline-flex;
    margin-top: 8px;
    font-size: 12px;
    font-weight: 800;
  }

  .auth-summary {
    padding: 30px 28px;
  }

  .auth-summary h2 {
    margin: 0 0 14px;
    color: #171267;
    font-size: 17px;
    font-weight: 800;
  }

  .auth-summary strong {
    display: block;
    color: #171267;
    font-size: 14px;
    line-height: 1.25;
    font-weight: 800;
  }

  .auth-price {
    margin: 2px 0 0;
    color: #171267;
    font-size: 16px;
    font-weight: 800;
  }

  .auth-divider {
    height: 1px;
    background: #e6e8f1;
    margin: 15px 0;
  }

  .auth-benefit-title {
    margin: 0 0 10px;
    color: #384076;
    font-size: 12px;
    font-weight: 800;
  }

  .auth-benefits {
    list-style: none;
    display: grid;
    gap: 10px;
    margin: 0 0 22px;
    padding: 0;
  }

  .auth-benefits li {
    display: flex;
    align-items: center;
    gap: 9px;
    color: #384076;
    font-size: 11px;
    font-weight: 700;
  }

  .auth-benefits span {
    width: 17px;
    height: 17px;
    border-radius: 50%;
    border: 2px solid #24c870;
    color: #24c870;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: 900;
    flex: 0 0 auto;
  }

  .auth-summary-btn {
    width: 100%;
  }

  .auth-status {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin: 0 0 15px;
    padding: 7px 12px;
    border-radius: 999px;
    background: #f3f4f8;
    color: #171267;
    font-size: 12px;
    font-weight: 800;
  }

  .auth-status.success {
    background: #ecfff5;
    color: #0f9b55;
  }

  .auth-status.error {
    background: #fff0e9;
    color: #d84b17;
  }

  .auth-plan-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
  }

  .auth-plan-card {
    min-width: 0;
    min-height: 390px;
    position: relative;
    border: 1px solid #e6e8f1;
    border-radius: 8px;
    background: #fff;
    padding: 22px 18px 18px;
    display: flex;
    flex-direction: column;
  }

  .auth-plan-card.is-featured {
    border-color: #ff6b20;
    box-shadow: 0 12px 28px rgba(255, 107, 32, 0.12);
  }

  .auth-plan-badge {
    width: fit-content;
    min-height: 24px;
    display: inline-flex;
    align-items: center;
    border-radius: 999px;
    background: #fff0e9;
    color: #ff5f18;
    padding: 0 10px;
    font-size: 11px;
    font-weight: 800;
    margin-bottom: 14px;
  }

  .auth-plan-card h2 {
    margin: 0 0 8px;
    color: #171267;
    font-size: 17px;
    line-height: 1.2;
    font-weight: 800;
  }

  .auth-plan-description {
    min-height: 48px;
    margin: 0 0 16px;
    color: #384076;
    font-size: 12px;
    line-height: 1.35;
    font-weight: 700;
  }

  .auth-plan-price {
    margin: 0 0 15px;
    color: #171267;
    font-size: 22px;
    line-height: 1.1;
    font-weight: 800;
  }

  .auth-plan-price span {
    color: #66709d;
    font-size: 12px;
    font-weight: 800;
  }

  .auth-plan-benefits {
    margin-bottom: 20px;
    flex: 1;
  }

  .auth-plan-card .auth-primary-btn {
    margin-top: auto;
  }

  .auth-actions {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 11px;
    margin-top: 22px;
  }

  .auth-toast {
    position: fixed;
    right: 24px;
    top: 84px;
    z-index: 9999;
    max-width: 360px;
    display: flex;
    align-items: center;
    gap: 12px;
    background: #171267;
    color: #fff;
    border-radius: 8px;
    padding: 13px 15px;
    font: 700 13px 'DM Sans', sans-serif;
    box-shadow: 0 12px 30px rgba(23, 18, 103, 0.25);
  }

  .auth-toast-close {
    border: 0;
    background: transparent;
    color: #fff;
    cursor: pointer;
    font: inherit;
  }

  .spinner {
    width: 15px;
    height: 15px;
    border: 2px solid rgba(255, 255, 255, 0.45);
    border-top-color: #fff;
    border-radius: 50%;
    animation: auth-spin 0.7s linear infinite;
  }

  @keyframes auth-spin { to { transform: rotate(360deg); } }

  @media (max-width: 940px) {
    .auth-stepbar {
      grid-template-columns: 34px minmax(0, 1fr);
      padding: 12px 18px;
    }

    .auth-steps {
      justify-content: flex-start;
      gap: 18px;
      overflow-x: auto;
      padding-bottom: 4px;
    }

    .auth-step {
      min-width: auto;
    }

    .auth-step:not(:last-child)::after {
      display: none;
    }

    .auth-checkout-shell,
    .auth-checkout-shell.auth-centered {
      grid-template-columns: 1fr;
      padding: 24px 18px;
    }

    .auth-summary {
      order: -1;
    }

    .auth-plan-grid {
      grid-template-columns: 1fr;
    }

    .auth-plan-card {
      min-height: auto;
    }
  }

  @media (max-width: 560px) {
    .auth-card,
    .auth-summary {
      padding: 24px 20px;
    }

    .auth-form-grid {
      grid-template-columns: 1fr;
    }

    .auth-card h1 {
      font-size: 22px;
    }
  }
`;
