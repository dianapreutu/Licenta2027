// HistoryPage.jsx
// Ecranul cu istoricul pozelor: un rezumat sus, apoi pozele grupate pe luni.

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllPhotos } from '../services/storage.js';
import { daysBetween, formatMonth } from '../services/format.js';
import PhotoCard from '../components/PhotoCard.jsx';

export default function HistoryPage() {
  // "photos" = lista de poze; când se schimbă, React redesenează singur ecranul
  const [photos, setPhotos] = useState([]);
  const navigate = useNavigate();
  const fileInputRef = useRef(null); // câmpul ascuns pentru alegerea unei poze

  // Se rulează o singură dată, când se deschide ecranul: citește pozele salvate
  useEffect(() => {
    getAllPhotos().then(setPhotos);
  }, []);

  // Când utilizatorul alege o poză din galerie, o trimitem la ecranul de previzualizare
  function handleFileChosen(event) {
    const file = event.target.files[0];
    if (file) {
      navigate('/camera', { state: { file } });
    }
  }

  return (
    <section>
      <Summary photos={photos} />

      {photos.length === 0 ? (
        <div className="empty-state">
          <p className="empty-title">Încă nu ai nicio poză</p>
          <p className="muted">
            Fă prima poză a cicatricii sau încarcă una din galerie.
            Pozele rămân doar pe telefonul tău.
          </p>
        </div>
      ) : (
        groupByMonth(photos).map(group => (
          <div key={group.month} className="month-group">
            <h3 className="month-title">{group.month}</h3>
            <ul className="photo-list">
              {group.photos.map(photo => (
                <PhotoCard key={photo.id} photo={photo} />
              ))}
            </ul>
          </div>
        ))
      )}

      <div className="actions">
        <button className="btn" onClick={() => fileInputRef.current.click()}>
          Încarcă din galerie
        </button>
        <button className="btn btn-primary" onClick={() => navigate('/camera')}>
          Fă o poză
        </button>
      </div>

      {/* Câmp ascuns: se deschide la apăsarea butonului „Încarcă din galerie” */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleFileChosen}
      />
    </section>
  );
}

// Cardul de rezumat: de câte zile monitorizezi, câte poze ai, când a fost ultima poză.
function Summary({ photos }) {
  if (photos.length === 0) return null;

  const newest = photos[0].createdAt;
  const oldest = photos[photos.length - 1].createdAt;
  const now = new Date().toISOString();
  const sinceLast = daysBetween(newest, now);

  return (
    <div className="summary-card">
      <div className="summary-item">
        <span className="summary-value">{daysBetween(oldest, now) + 1}</span>
        <span className="summary-label">zile de monitorizare</span>
      </div>
      <div className="summary-item">
        <span className="summary-value">{photos.length}</span>
        <span className="summary-label">{photos.length === 1 ? 'poză' : 'poze'}</span>
      </div>
      <div className="summary-item">
        <span className="summary-value">{sinceLast === 0 ? 'azi' : sinceLast}</span>
        <span className="summary-label">
          {sinceLast === 0 ? 'ultima poză' : sinceLast === 1 ? 'zi de la ultima poză' : 'zile de la ultima poză'}
        </span>
      </div>
    </div>
  );
}

// Împarte pozele (deja ordonate, cele mai noi primele) pe luni.
function groupByMonth(photos) {
  const groups = [];
  for (const photo of photos) {
    const month = formatMonth(photo.createdAt);
    const last = groups[groups.length - 1];
    if (last && last.month === month) last.photos.push(photo);
    else groups.push({ month, photos: [photo] });
  }
  return groups;
}
