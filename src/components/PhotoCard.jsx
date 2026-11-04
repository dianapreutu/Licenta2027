// PhotoCard.jsx
// Un card din istoric: poza, data și sursa ei. La atingere, deschide ecranul pozei.

import { Link } from 'react-router-dom';
import { useObjectUrl } from '../services/useObjectUrl.js';
import { formatDate } from '../services/format.js';

export default function PhotoCard({ photo }) {
  // Transformă imaginea salvată (Blob) într-o adresă pe care <img> o poate afișa
  const imageUrl = useObjectUrl(photo.blob);

  return (
    <li className="photo-card">
      <Link to={`/poza/${photo.id}`}>
        {imageUrl && <img src={imageUrl} alt={`Poză din ${formatDate(photo.createdAt)}`} />}
        <div className="photo-date">
          {formatDate(photo.createdAt)}
          {/* Pozele încărcate din galerie sunt marcate, pentru că nu au avut ghidaj */}
          {photo.source === 'galerie' && <span className="badge">Galerie</span>}
        </div>
      </Link>
    </li>
  );
}
