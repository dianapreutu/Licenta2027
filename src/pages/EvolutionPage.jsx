// EvolutionPage.jsx
// Ecranul de evoluție. Graficul suprafeței apare după ce pozele au contur desenat;
// până atunci, ecranul arată ce date există deja și ce urmează.

import { useEffect, useState } from 'react';
import { getAllCare, getAllPhotos, getAllSymptoms } from '../services/storage.js';

export default function EvolutionPage() {
  const [counts, setCounts] = useState({ photos: 0, measured: 0, care: 0, symptoms: 0 });

  useEffect(() => {
    Promise.all([getAllPhotos(), getAllCare(), getAllSymptoms()]).then(([photos, care, symptoms]) =>
      setCounts({
        photos: photos.length,
        measured: photos.filter(photo => photo.area).length,
        care: care.length,
        symptoms: symptoms.length
      })
    );
  }, []);

  return (
    <section>
      <div className="empty-state">
        <svg className="empty-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 19V5 M4 19h16 M7 15l4-5 3 3 5-6" />
        </svg>
        <p className="empty-title">Graficul evoluției apare aici</p>
        <p className="muted">
          După ce desenezi conturul cicatricii pe poze, aplicația calculează suprafața fiecăreia
          și o afișează în timp, cu îngrijirile marcate pe grafic.
        </p>
      </div>

      <div className="detail-card">
        <div className="detail-row">
          <span className="muted">Poze salvate</span>
          <span>{counts.photos}</span>
        </div>
        <div className="detail-row">
          <span className="muted">Poze cu contur desenat</span>
          <span>{counts.measured}</span>
        </div>
        <div className="detail-row">
          <span className="muted">Îngrijiri notate</span>
          <span>{counts.care}</span>
        </div>
        <div className="detail-row">
          <span className="muted">Zile cu simptome notate</span>
          <span>{counts.symptoms}</span>
        </div>
      </div>
    </section>
  );
}
