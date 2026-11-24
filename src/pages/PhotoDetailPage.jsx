// PhotoDetailPage.jsx
// Ecranul unei poze: poza mare cu conturul desenat, data, sursa, măsurătorile și ștergerea.

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { deletePhoto, getPhoto } from '../services/storage.js';
import { useObjectUrl } from '../services/useObjectUrl.js';
import { formatDate } from '../services/format.js';

export default function PhotoDetailPage() {
  const { id } = useParams(); // id-ul pozei, din adresa /poza/:id
  const navigate = useNavigate();
  const [photo, setPhoto] = useState(undefined); // undefined = se încarcă; null = nu există
  const imageUrl = useObjectUrl(photo?.blob);

  useEffect(() => {
    getPhoto(Number(id)).then(found => setPhoto(found ?? null));
  }, [id]);

  async function handleDelete() {
    if (window.confirm('Ștergi definitiv această poză?')) {
      await deletePhoto(photo.id);
      navigate('/istoric');
    }
  }

  if (photo === undefined) return null;
  if (photo === null) {
    return (
      <section className="empty-state">
        <p className="empty-title">Poza nu mai există</p>
        <button className="btn" onClick={() => navigate('/istoric')}>Înapoi la istoric</button>
      </section>
    );
  }

  return (
    <section>
      <button className="link-back" onClick={() => navigate('/istoric')}>‹ Istoric</button>

      {imageUrl && (
        <div className="contour-wrapper">
          <img src={imageUrl} alt="Poza cicatricii" />
          {/* Conturul salvat, desenat peste poză. viewBox = mărimea pozei originale,
              deci punctele se potrivesc indiferent de mărimea ecranului. */}
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
      )}

      <div className="detail-card">
        <div className="detail-row">
          <span className="muted">Data</span>
          <span>{formatDate(photo.createdAt)}</span>
        </div>
        <div className="detail-row">
          <span className="muted">Sursa</span>
          <span>{photo.source === 'galerie' ? 'Încărcată din galerie' : 'Cameră, cu ghidaj'}</span>
        </div>
        <div className="detail-row">
          <span className="muted">Suprafață relativă</span>
          <span>{photo.area ? `${formatNumber(photo.area)} px²` : 'Conturul nu este desenat încă'}</span>
        </div>
        {photo.length ? (
          <div className="detail-row">
            <span className="muted">Lungime relativă</span>
            <span>{formatNumber(photo.length)} px</span>
          </div>
        ) : null}
      </div>

      {photo.area ? (
        <p className="hint">
          Valorile sunt relative, în pixeli: pot fi comparate doar între poze făcute
          de la o distanță și dintr-un unghi asemănătoare.
        </p>
      ) : null}

      <div className="actions">
        <button className="btn btn-danger" onClick={handleDelete}>Șterge poza</button>
        <button className="btn btn-primary" onClick={() => navigate(`/poza/${photo.id}/contur`)}>
          {photo.contour ? 'Modifică conturul' : 'Desenează conturul'}
        </button>
      </div>
    </section>
  );
}

// 12345.6 → „12.346” (cu separatorul de mii din română)
function formatNumber(value) {
  return Math.round(value).toLocaleString('ro-RO');
}
