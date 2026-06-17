export default function MemberIcon({ name }) {
  const common = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  const paths = {
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </>
    ),
    login: (
      <>
        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
        <path d="M10 17l5-5-5-5" />
        <path d="M15 12H3" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 11h18" />
      </>
    ),
    dumbbell: <path d="M6 7v10M18 7v10M3 9v6M21 9v6M6 12h12" />,
    card: (
      <>
        <rect x="3" y="6" width="18" height="12" rx="2" />
        <path d="M3 10h18M7 15h4" />
      </>
    ),
    profile: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),
    bell: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </>
    ),
    flower: (
      <>
        <path d="M12 12c-2-3-1-6 0-8 1 2 2 5 0 8Z" />
        <path d="M12 12c3-2 6-1 8 0-2 1-5 2-8 0Z" />
        <path d="M12 12c2 3 1 6 0 8-1-2-2-5 0-8Z" />
        <path d="M12 12c-3 2-6 1-8 0 2-1 5-2 8 0Z" />
      </>
    ),
    fire: <path d="M12 22c4 0 7-3 7-7 0-3-2-5-4-7 .5 3-1 5-3 5-1.7 0-3-1.3-3-3 0-1.2.6-2.4 1.4-3.5C7.1 8 5 11 5 15c0 4 3 7 7 7Z" />,
    check: <path d="M20 6 9 17l-5-5" />,
  };

  return <svg {...common}>{paths[name]}</svg>;
}
