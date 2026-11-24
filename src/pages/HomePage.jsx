// HomePage.jsx
// Ecranul Acasă: ultima poză, îngrijirile în curs, pe scurt despre aplicație
// și, la final, plăcile către celelalte secțiuni.

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllCare, getAllPhotos } from '../services/storage.js';
import { latestChange } from '../services/history.js';
import { daysBetween, formatDay, toDateInputValue } from '../services/format.js';
import PhotoWithContour from '../components/PhotoWithContour.jsx';

export default function HomePage() {
  const [data, setData] = useState(null); // null cât timp se încarcă datele

  // Citește pozele și îngrijirile deodată, la deschiderea ecranului
  useEffect(() => {
    Promise.all([getAllPhotos(), getAllCare()]).then(([photos, care]) =>
      setData({ photos, care })
    );
  }, []);

  if (!data) return null;
  const { photos, care } = data;
  const now = new Date();

  return (
    <section>
      {photos.length > 0 && <LatestPhoto photos={photos} />}
      <OngoingCare care={care} now={now} />
      <About />
      <Explore photoCount={photos.length} />
    </section>
  );
}

// ---------- Ultima poză ----------

function LatestPhoto({ photos }) {
  const latest = photos[0];
  const change = latestChange(photos);
  const ago = daysBetween(latest.createdAt, new Date().toISOString());

  return (
    <Link to={`/poza/${latest.id}`} className="latest-card">
      <PhotoWithContour photo={latest} className="latest-thumb" />
      <div className="latest-info">
        <span className="latest-label">Ultima poză</span>
        <strong>{formatDay(latest.createdAt)}</strong>
        <span className="muted">{ago === 0 ? 'azi' : ago === 1 ? 'ieri' : `acum ${ago} zile`}</span>

        {/* Dacă poza nu are încă contur, cardul te îndeamnă să-l desenezi */}
        {!latest.area && <span className="latest-todo">Desenează conturul ›</span>}

        {/* Diferența apare doar dacă ultima poză măsurată este chiar ultima poză */}
        {change && change.latest.id === latest.id && (
          <span className="muted latest-change">
            {formatPercent(change.percent)} față de {formatDay(change.previous.createdAt)}
          </span>
        )}
      </div>
    </Link>
  );
}

// ---------- Îngrijiri în curs ----------

function OngoingCare({ care, now }) {
  const today = toDateInputValue(now);
  // În curs = fără dată de sfârșit, sau cu sfârșitul azi ori mai târziu
  const ongoing = care.filter(item => !item.endDate || item.endDate >= today);

  // Secțiunea apare doar când există îngrijiri în curs
  if (ongoing.length === 0) return null;

  return (
    <>
      <h3 className="home-section">Îngrijiri în curs</h3>
      <ul className="entry-list home-care">
        {ongoing.map(item => (
          <li key={item.id} className="entry">
            <div>
              <div className="entry-title">{item.name}</div>
              <div className="muted">
                din {formatDay(item.startDate)}, ziua {daysBetween(item.startDate, today) + 1}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

// ---------- Despre aplicație ----------

const STEPS = [
  {
    title: 'Fotografiezi cicatricea',
    text: 'Te aliniezi după poza anterioară, afișată transparent peste cameră, ca pozele să fie comparabile.',
    icon: <path d="M4 7h3l2-2h6l2 2h3v12H4z M12 10a3.5 3.5 0 1 0 0 7a3.5 3.5 0 1 0 0-7" />
  },
  {
    title: 'Desenezi conturul',
    text: 'Cu degetul, pe poză. Aplicația calculează suprafața și lungimea, în pixeli.',
    icon: <path d="M4 20l4-1L19 8l-3-3L5 16z M14 7l3 3" />
  },
  {
    title: 'Urmărești evoluția',
    text: 'Vezi pozele și măsurătorile în timp, alături de îngrijiri și simptome.',
    icon: <path d="M4 19V5 M4 19h16 M7 15l4-5 3 3 5-6" />
  }
];

function About() {
  return (
    <>
      <h3 className="home-section">Despre aplicație</h3>
      <div className="about-card">
        <ol className="about-steps">
          {STEPS.map((step, index) => (
            <li key={step.title}>
              <span className="about-icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">{step.icon}</svg>
                <span className="about-number">{index + 1}</span>
              </span>
              <div>
                <strong>{step.title}</strong>
                <span>{step.text}</span>
              </div>
            </li>
          ))}
        </ol>
        <div className="about-footer">
          <p>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 11h12v9H6z M8.5 11V8a3.5 3.5 0 0 1 7 0v3" /></svg>
            Datele rămân doar pe telefonul tău. Le poți muta pe alt dispozitiv prin backup-ul criptat.
          </p>
          <p className="about-note">Aplicația nu pune diagnostice și nu înlocuiește controlul medical.</p>
        </div>
      </div>
    </>
  );
}

// ---------- Plăcile către celelalte secțiuni ----------

function Explore({ photoCount }) {
  const tiles = [
    {
      to: '/istoric', title: 'Toate pozele', detail: photoCount === 1 ? '1 poză' : `${photoCount} poze`,
      icon: <path d="M4 5h16v14H4z M4 15l4-4 4 4 3-3 5 5" />
    },
    {
      to: '/evolutie', title: 'Evoluția', detail: 'măsurătorile în timp',
      icon: <path d="M4 19V5 M4 19h16 M7 15l4-5 3 3 5-6" />
    },
    {
      to: '/jurnal', title: 'Jurnalul', detail: 'îngrijiri și simptome',
      icon: <path d="M6 3h12v18H6z M9 8h6 M9 12h6 M9 16h4" />
    },
    {
      to: '/backup', title: 'Backup', detail: 'exportă sau importă datele',
      icon: <path d="M7 18a4.5 4.5 0 0 1-.5-9A6 6 0 0 1 18 9.5a4 4 0 0 1-.5 8.5 M12 11v7 M9 15l3 3 3-3" />
    }
  ];

  return (
    <>
      <h3 className="home-section">Explorează</h3>
      <ul className="tile-grid">
        {tiles.map(tile => (
          <li key={tile.to}>
            <Link to={tile.to} className="tile">
              <svg viewBox="0 0 24 24" aria-hidden="true">{tile.icon}</svg>
              <strong>{tile.title}</strong>
              <span>{tile.detail}</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

// ---------- Ajutătoare ----------

function formatPercent(value) {
  const rounded = Math.round(value);
  return `${rounded > 0 ? '+' : ''}${rounded}%`;
}
