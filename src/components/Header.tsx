import { Link, useLocation } from "react-router-dom";

const navItems = [
  { label: "Home", path: "/" },
  { label: "Page1", path: "/page1" },
  { label: "Predictions", path: "/predictions" },
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
