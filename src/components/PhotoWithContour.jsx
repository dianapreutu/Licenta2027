// PhotoWithContour.jsx
// O poză, cu conturul cicatricii desenat peste ea (dacă a fost desenat).
// Folosită pe ecranul Acasă, pentru ultima poză.

import { useObjectUrl } from '../services/useObjectUrl.js';

export default function PhotoWithContour({ photo, className = '' }) {
  const imageUrl = useObjectUrl(photo.blob);
  if (!imageUrl) return null;

  return (
    <div className={`contour-wrapper ${className}`}>
      <img src={imageUrl} alt="Poza cicatricii" />
      {/* viewBox = mărimea pozei originale, deci punctele se potrivesc la orice mărime a ecranului */}
      {photo.contour && (
        <svg
          className="contour-overlay"
          viewBox={`0 0 ${photo.imageWidth} ${photo.imageHeight}`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <polygon points={photo.contour.map(p => `${p.x},${p.y}`).join(' ')} />
        </svg>
      )}
    </div>
  );
}
