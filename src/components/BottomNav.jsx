// BottomNav.jsx
// Bara de navigare fixată jos, cu cele trei secțiuni ale aplicației.

import { NavLink } from 'react-router-dom';

const ITEMS = [
  { to: '/', label: 'Istoric', icon: <path d="M4 5h16v14H4z M4 15l4-4 4 4 3-3 5 5" /> },
  { to: '/evolutie', label: 'Evoluție', icon: <path d="M4 19V5 M4 19h16 M7 15l4-5 3 3 5-6" /> },
  { to: '/jurnal', label: 'Jurnal', icon: <path d="M6 3h12v18H6z M9 8h6 M9 12h6 M9 16h4" /> }
];

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      {ITEMS.map(item => (
        // NavLink adaugă automat clasa „active” pe secțiunea deschisă
        <NavLink key={item.to} to={item.to} end={item.to === '/'} className="bottom-nav-item">
          <svg viewBox="0 0 24 24" aria-hidden="true">{item.icon}</svg>
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
