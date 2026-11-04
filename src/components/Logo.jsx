// Logo.jsx
// Sigla aplicației: o cicatrice stilizată (linie curbă) cu firele de sutură.
// - size: mărimea în pixeli;
// - animated: linia se „desenează” singură (folosit pe pagina de început).

export default function Logo({ size = 40, animated = false, className = '' }) {
  return (
    <svg
      className={`logo ${animated ? 'logo-animated' : ''} ${className}`}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      role="img"
      aria-label="Scar Monitor"
    >
      <rect className="logo-bg" x="0" y="0" width="48" height="48" rx="15" />
      {/* Cicatricea */}
      <path className="logo-line" d="M12 34 Q22 28.5 36 14" pathLength="100" />
      {/* Firele de sutură, care traversează cicatricea */}
      <path className="logo-stitches" d="M14.03 28.29 L18.29 34.59 M18.29 25.17 L22.99 31.15 M22.93 21.31 L27.95 27.01 M27.93 16.70 L33.19 22.18" />
    </svg>
  );
}
