// PhotoDetailPage.jsx
// Ecranul unei poze: poza mare, data, sursa, măsurătorile (vin mai târziu) și ștergerea.

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
      navigate('/');
    }
  }

  if (photo === undefined) return null;
  if (photo === null) {
    return (
      <section className="empty-state">
        <p className="empty-title">Poza nu mai există</p>
        <button className="btn" onClick={() => navigate('/')}>Înapoi la istoric</button>
      </section>
    );
  }

  return (
    <section>
      <button className="link-back" onClick={() => navigate('/')}>‹ Istoric</button>

      {imageUrl && <img className="preview-image" src={imageUrl} alt="Poza cicatricii" />}

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
          <span>{photo.area ? `${Math.round(photo.area)} px²` : 'Conturul nu este desenat încă'}</span>
        </div>
      </div>

      <div className="actions">
        <button className="btn btn-danger" onClick={handleDelete}>Șterge poza</button>
      </div>
    </section>
  );
}
