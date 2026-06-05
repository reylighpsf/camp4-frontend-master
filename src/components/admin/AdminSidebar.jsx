import { NavLink, useLocation } from "react-router";
import vocafitLogo from "../../assets/auth/vocafit-logo.png";

const iconProps = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  "aria-hidden": "true",
};

const Icon = ({ children, className = "" }) => (
  <svg className={className} {...iconProps}>
    {children}
  </svg>
);

const icons = {
  dashboard: (
    <Icon>
      <rect x="4" y="4" width="6" height="6" rx="1.3" stroke="currentColor" strokeWidth="1.8" />
      <rect x="14" y="4" width="6" height="6" rx="1.3" stroke="currentColor" strokeWidth="1.8" />
      <rect x="4" y="14" width="6" height="6" rx="1.3" stroke="currentColor" strokeWidth="1.8" />
      <rect x="14" y="14" width="6" height="6" rx="1.3" stroke="currentColor" strokeWidth="1.8" />
    </Icon>
  ),
  news: (
    <Icon>
      <path d="M5 7h11M5 11h8M5 15h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <rect x="3" y="5" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M19 9h2v7a3 3 0 0 1-3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </Icon>
  ),
  payments: (
    <Icon>
      <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3 10h18M7 15h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </Icon>
  ),
  catalog: (
    <Icon>
      <path d="M5 5h14v5H5zM5 14h6v5H5zM15 14h4v5h-4z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </Icon>
  ),
  members: (
    <Icon>
      <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3.5 19a5.5 5.5 0 0 1 11 0M16 7.5a2.8 2.8 0 0 1 0 5.6M18 17.5a4.5 4.5 0 0 0-2.8-4.1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </Icon>
  ),
  trainer: (
    <Icon>
      <circle cx="12" cy="7.5" r="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M5.5 20a6.5 6.5 0 0 1 13 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </Icon>
  ),
  logout: (
    <Icon>
      <path d="M10 17l5-5-5-5M15 12H3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13 4h5a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </Icon>
  ),
  settings: (
    <Icon>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M19.4 15a8.4 8.4 0 0 0 .1-1l2-1.5-2-3.5-2.4 1a7.5 7.5 0 0 0-1.7-1L15 6.5h-4L10.6 9a7.5 7.5 0 0 0-1.7 1l-2.4-1-2 3.5 2 1.5a8.4 8.4 0 0 0 .1 2l-2 1.5 2 3.5 2.4-1a7.5 7.5 0 0 0 1.7 1l.4 2.5h4l.4-2.5a7.5 7.5 0 0 0 1.7-1l2.4 1 2-3.5-2.2-1.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </Icon>
  ),
};

const navItems = [
  { label: "Dashboard", icon: icons.dashboard, to: "/admin" },
  { label: "News Update", icon: icons.news, to: "/admin/news-update" },
  {
    label: "Catalog",
    icon: icons.catalog,
    to: "/admin/catalogs",
    children: [
      { label: "Membership", to: "/admin/catalogs/membership" },
      { label: "Trainer", to: "/admin/catalogs/trainer" },
    ],
  },
  {
    label: "Payments",
    icon: icons.payments,
    to: "/admin/payments",
    children: [
      { label: "Pending", to: "/admin/payments" },
      { label: "Riwayat", to: "/admin/payments/history" },
    ],
  },
  { label: "Active Member", icon: icons.members, to: "/admin/active-member" },
  { label: "Trainer", icon: icons.trainer, to: "/admin/trainer" },
];

function SidebarButton({ item }) {
  if (item.children) {
    return <SidebarDropdown item={item} />;
  }

  return (
    <NavLink
      className={({ isActive }) =>
        `admin-sidebar__button${isActive ? " admin-sidebar__button--active" : ""}`
      }
      end={item.to === "/admin"}
      to={item.to}
    >
      <span className="admin-sidebar__icon">{item.icon}</span>
      <span className="admin-sidebar__label">{item.label}</span>
    </NavLink>
  );
}

function SidebarDropdown({ item }) {
  const location = useLocation();
  const isActive = item.children.some((child) => location.pathname === child.to);

  return (
    <details className="admin-sidebar__group" open={isActive}>
      <summary className={`admin-sidebar__button admin-sidebar__summary${isActive ? " admin-sidebar__button--active" : ""}`}>
        <span className="admin-sidebar__icon">{item.icon}</span>
        <span className="admin-sidebar__label">{item.label}</span>
        <span className="admin-sidebar__chevron" aria-hidden="true">v</span>
      </summary>
      <div className="admin-sidebar__submenu">
        {item.children.map((child) => (
          <NavLink
            className={({ isActive: childActive }) =>
              `admin-sidebar__subbutton${childActive ? " admin-sidebar__subbutton--active" : ""}`
            }
            key={child.label}
            to={child.to}
          >
            {child.label}
          </NavLink>
        ))}
      </div>
    </details>
  );
}

export default function AdminSidebar({ onLogout }) {
  return (
    <>
      <style>{`
        .admin-sidebar {
          background: #080478;
          color: #d9d8ff;
          border-right: 3px solid #0d6cff;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          width: 100%;
        }

        .admin-sidebar__brand {
          min-height: 108px;
          display: flex;
          align-items: center;
          gap: 18px;
          padding: 18px 28px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.18);
        }

        .admin-sidebar__brand img {
          width: 66px;
          height: 72px;
          object-fit: contain;
          flex: 0 0 auto;
        }

        .admin-sidebar__brand span {
          color: #ff7615;
          font-size: 38px;
          font-weight: 800;
          line-height: 1;
        }

        .admin-sidebar__nav {
          padding: 58px 28px 24px;
          display: grid;
          gap: 18px;
        }

        .admin-sidebar__footer {
          margin-top: auto;
          padding: 20px 28px 26px;
          border-top: 1px solid rgba(255, 255, 255, 0.18);
          display: grid;
          gap: 12px;
        }

        .admin-sidebar__button {
          width: 100%;
          min-height: 48px;
          border: 0;
          background: transparent;
          color: inherit;
          display: grid;
          grid-template-columns: 24px minmax(0, 1fr);
          align-items: center;
          gap: 16px;
          padding: 0 16px;
          border-radius: 999px;
          font: inherit;
          font-size: 14px;
          cursor: pointer;
          text-align: left;
          text-decoration: none;
        }

        .admin-sidebar__group {
          display: grid;
          gap: 8px;
        }

        .admin-sidebar__summary {
          grid-template-columns: 24px minmax(0, 1fr) 12px;
          list-style: none;
        }

        .admin-sidebar__summary::-webkit-details-marker {
          display: none;
        }

        .admin-sidebar__chevron {
          color: currentColor;
          font-size: 11px;
          font-weight: 900;
          justify-self: end;
          transition: transform .18s ease;
        }

        .admin-sidebar__group[open] .admin-sidebar__chevron {
          transform: rotate(180deg);
        }

        .admin-sidebar__submenu {
          display: grid;
          gap: 8px;
          padding-left: 40px;
        }

        .admin-sidebar__subbutton {
          border-radius: 999px;
          color: #d9d8ff;
          font-size: 13px;
          font-weight: 600;
          min-height: 36px;
          padding: 9px 14px;
          text-decoration: none;
        }

        .admin-sidebar__subbutton:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
        }

        .admin-sidebar__subbutton--active {
          background: rgba(255, 115, 20, .22);
          color: #fff;
        }

        .admin-sidebar__button--active {
          background: #ff7314;
          color: #fff;
          font-weight: 600;
        }

        .admin-sidebar__button:not(.admin-sidebar__button--active):hover {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
        }

        .admin-sidebar__icon {
          width: 24px;
          height: 24px;
          display: grid;
          place-items: center;
        }

        .admin-sidebar__label {
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        @media (max-width: 1040px) {
          .admin-sidebar__brand {
            justify-content: center;
            padding: 16px;
          }

          .admin-sidebar__brand span,
          .admin-sidebar__label {
            display: none;
          }

          .admin-sidebar__brand img {
            width: 58px;
          }

          .admin-sidebar__nav,
          .admin-sidebar__footer {
            padding-left: 18px;
            padding-right: 18px;
          }

          .admin-sidebar__button {
            grid-template-columns: 1fr;
            justify-items: center;
            padding: 0;
          }

          .admin-sidebar__chevron,
          .admin-sidebar__submenu {
            display: none;
          }
        }

        @media (max-width: 680px) {
          .admin-sidebar {
            min-height: auto;
            border-right: 0;
            border-bottom: 3px solid #0d6cff;
          }

          .admin-sidebar__brand {
            min-height: 82px;
          }

          .admin-sidebar__nav {
            display: flex;
            gap: 10px;
            overflow-x: auto;
            padding: 12px;
          }

          .admin-sidebar__button {
            flex: 0 0 48px;
            min-height: 44px;
          }

          .admin-sidebar__footer {
            display: none;
          }
        }
      `}</style>

      <aside className="admin-sidebar" aria-label="Admin sidebar">
        <div className="admin-sidebar__brand">
          <img src={vocafitLogo} alt="Vocafit" />
          <span>Vocafit</span>
        </div>

        <nav className="admin-sidebar__nav" aria-label="Admin navigation">
          {navItems.map((item) => (
            <SidebarButton key={item.label} item={item} />
          ))}
        </nav>

        <div className="admin-sidebar__footer">
          <button className="admin-sidebar__button" type="button" onClick={onLogout}>
            <span className="admin-sidebar__icon">{icons.logout}</span>
            <span className="admin-sidebar__label">LogOut</span>
          </button>
          <button className="admin-sidebar__button" type="button">
            <span className="admin-sidebar__icon">{icons.settings}</span>
            <span className="admin-sidebar__label">Settings</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export { Icon };
