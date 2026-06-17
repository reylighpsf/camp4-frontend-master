import { Link, useNavigate } from "react-router";

const membershipPlans = [
  {
    name: "Daily",
    price: "Rp 15.000",
    period: "1 day",
    highlight: false,
    features: ["Gym access for 1 day", "Cardio and strength area", "QR check-in access"],
  },
  {
    name: "Monthly",
    price: "Rp 100.000",
    period: "30 days",
    highlight: true,
    features: ["Gym access for 30 days", "Workout dashboard", "Member support"],
  },
  {
    name: "Trainer Plus",
    price: "Rp 250.000",
    period: "30 days",
    highlight: false,
    features: ["Monthly membership", "Trainer booking", "Workout tracking"],
  },
];

export default function MembershipPlanCards({ compact = false, plans = membershipPlans }) {
  const navigate = useNavigate();
  const normalizedPlans = plans.map((plan) => ({
    features: plan.features || plan.benefits || [],
    highlight: plan.highlight || plan.id === "premium",
    id: plan.id,
    name: plan.name,
    period: plan.period,
    price: plan.price,
    prices: plan.prices || [{ tierCode: "DEFAULT", tierName: "Harga", price: plan.price }],
  }));

  const cards = normalizedPlans.map((plan) => (
    <article
      className={`membership-plan ${plan.highlight ? "is-featured" : ""}`}
      key={plan.id || plan.name}
      onClick={() => navigate("/sign-up")}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          navigate("/sign-up");
        }
      }}
      role="button"
      tabIndex={0}
    >
      <p className="plan-kicker">{plan.name}</p>
      <h2>{plan.price}</h2>
      <span>{plan.period}</span>
      <div className="membership-price-list" aria-label={`Harga ${plan.name}`}>
        {plan.prices.map((price) => (
          <div className="membership-price-row" key={`${plan.id || plan.name}-${price.tierCode}`}>
            <span>{price.tierName}</span>
            <b>{price.price}</b>
          </div>
        ))}
      </div>
      <ul>
        {plan.features.map((feature) => (
          <li key={feature}>{feature}</li>
        ))}
      </ul>
      <Link to="/sign-up" onClick={(event) => event.stopPropagation()}>
        Choose This Plan
      </Link>
    </article>
  ));

  if (!compact) {
    return (
      <div className="membership-plans" aria-label="Membership plans">
        {cards}
      </div>
    );
  }

  return (
    <section className="landing-plan-preview" aria-label="Membership plans">
      <div className="plan-preview-header">
        <h2>Choose Your Membership Plan</h2>
        <p>Find the best option based on your needs.</p>
      </div>
      <div className="membership-plans">{cards}</div>
    </section>
  );
}
