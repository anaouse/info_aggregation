import { Link, useLocation } from "react-router-dom";

const navItems = [
  { label: "Home", path: "/" },
  { label: "Tools", path: "/tools" },
  { label: "Predictions", path: "/predictions" },
  { label: "Assets", path: "/assets" },
  { label: "Anime", path: "/anime" },
];

export default function Header() {
  const { pathname } = useLocation();

  return (
    <header className="header">
      <nav className="header-nav">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`header-nav-item${pathname === item.path ? " active" : ""}`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
