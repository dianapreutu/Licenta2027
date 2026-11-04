// WelcomePage.jsx
// Pagina de început: apare la prima deschidere a aplicației.
// Poate fi redeschisă oricând, apăsând pe sigla din antet.

import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo.jsx';
import { markWelcomeSeen } from '../services/welcome.js';

const FEATURES = [
  {
    title: 'Poze făcute la fel de fiecare dată',
    text: 'Te aliniezi după poza anterioară, afișată transparent peste cameră.',
    icon: <path d="M4 7h3l2-2h6l2 2h3v12H4z M12 10a3.5 3.5 0 1 0 0 7a3.5 3.5 0 1 0 0-7" />
  },
  {
    title: 'Schimbări pe care te poți baza',
    text: 'Aplicația îți arată când o diferență este mai mare decât variația normală dintre poze.',
    icon: <path d="M4 19V5 M4 19h16 M7 15l4-5 3 3 5-6" />
  },
  {
    title: 'Doar pe telefonul tău',
    text: 'Pozele, îngrijirile și simptomele nu sunt trimise nicăieri.',
    icon: <path d="M8 3h8a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z M11 18h2" />
  }
];

export default function WelcomePage() {
  const navigate = useNavigate();

  function handleStart() {
    markWelcomeSeen();
    navigate('/');
  }

  return (
    <div className="welcome">
      <div className="welcome-inner">
        <Logo size={112} animated className="welcome-logo" />

        <p className="welcome-name">Scar Monitor</p>
        <h1 className="welcome-title">Vezi cum se vindecă cicatricea, poză cu poză.</h1>
        <p className="welcome-lead">
          Fotografiază cicatricea periodic, notează îngrijirile și simptomele,
          iar aplicația îți arată evoluția în timp.
        </p>

        <ul className="welcome-features">
          {FEATURES.map(feature => (
            <li key={feature.title}>
              <svg viewBox="0 0 24 24" aria-hidden="true">{feature.icon}</svg>
              <div>
                <strong>{feature.title}</strong>
                <span>{feature.text}</span>
              </div>
            </li>
          ))}
        </ul>

        <button className="btn btn-primary btn-full welcome-start" onClick={handleStart}>
          Începe
        </button>
        <p className="welcome-note">
          Aplicația nu pune diagnostice și nu înlocuiește controlul medical.
        </p>
      </div>
    </div>
  );
}
