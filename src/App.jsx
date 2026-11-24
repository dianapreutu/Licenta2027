// App.jsx
// Componenta principală: antetul, ecranele (rutele) și bara de navigare de jos.

import { useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import HistoryPage from './pages/HistoryPage.jsx';
import CameraPage from './pages/CameraPage.jsx';
import PhotoDetailPage from './pages/PhotoDetailPage.jsx';
import EvolutionPage from './pages/EvolutionPage.jsx';
import JournalPage from './pages/JournalPage.jsx';
import WelcomePage from './pages/WelcomePage.jsx';
import BackupPage from './pages/BackupPage.jsx';
import ContourPage from './pages/ContourPage.jsx';
import BottomNav from './components/BottomNav.jsx';
import Logo from './components/Logo.jsx';
import { hasSeenWelcome } from './services/welcome.js';

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const onWelcome = location.pathname === '/bun-venit';

  // La prima deschidere, utilizatorul vede pagina de început
  useEffect(() => {
    if (!hasSeenWelcome() && !onWelcome) {
      navigate('/bun-venit');
    }
  }, []);

  // Pagina de început ocupă tot ecranul, fără antet și fără bară de jos
  if (onWelcome) {
    return <WelcomePage />;
  }

  // Pe ecranul camerei ascundem bara de jos, ca să rămână tot spațiul pentru poză
  const showNav = location.pathname !== '/camera';

  return (
    <div className={showNav ? 'app with-nav' : 'app'}>
      <header className="app-header">
        <Link to="/bun-venit" className="brand" aria-label="Despre aplicație">
          <Logo size={34} />
          <span>Scar Monitor</span>
        </Link>
        {/* Butonul de backup (export / import), în dreapta antetului */}
        <Link to="/backup" className="header-action" aria-label="Backup: exportă sau importă datele">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7 18a4.5 4.5 0 0 1-.6-8.96A6 6 0 0 1 18 8.5a4 4 0 0 1-.5 7.97 M12 11v8 M9 16l3 3 3-3" />
          </svg>
          <span>Backup</span>
        </Link>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/istoric" element={<HistoryPage />} />
          <Route path="/camera" element={<CameraPage />} />
          <Route path="/poza/:id" element={<PhotoDetailPage />} />
          <Route path="/poza/:id/contur" element={<ContourPage />} />
          <Route path="/evolutie" element={<EvolutionPage />} />
          <Route path="/jurnal" element={<JournalPage />} />
          <Route path="/backup" element={<BackupPage />} />
        </Routes>
      </main>

      {showNav && <BottomNav />}
    </div>
  );
}
