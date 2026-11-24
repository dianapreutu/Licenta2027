// CameraPage.jsx
// Ecranul pentru o poză nouă, în doi pași:
// 1. camera live, cu poza anterioară suprapusă semitransparent pentru aliniere;
// 2. previzualizarea pozei făcute, cu „Salvează” sau „Refă poza”.

import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { startCamera, stopCamera, capturePhoto } from '../services/camera.js';
import { getAllPhotos, savePhoto } from '../services/storage.js';
import { useObjectUrl } from '../services/useObjectUrl.js';
import { toDateTimeInputValue } from '../services/format.js';

export default function CameraPage() {
  const videoRef = useRef(null);          // elementul <video> cu imaginea live
  const [lastPhoto, setLastPhoto] = useState(null);  // ultima poză salvată
  const location = useLocation();
  // Poza făcută acum, nesalvată. Dacă am venit cu o poză aleasă din galerie,
  // pornim direct cu ea, la previzualizare.
  const fromGallery = Boolean(location.state?.file);
  const [captured, setCaptured] = useState(location.state?.file ?? null);
  // Data pozei, afișată în previzualizare și modificabilă de utilizator.
  // Pentru o poză din galerie pornim de la data fișierului, nu de la data de azi.
  const [takenAt, setTakenAt] = useState(() =>
    toDateTimeInputValue(fromGallery ? new Date(location.state.file.lastModified) : new Date())
  );
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const overlayUrl = useObjectUrl(lastPhoto?.blob);
  const previewUrl = useObjectUrl(captured);

  // Citește ultima poză, ca s-o afișăm peste cameră
  useEffect(() => {
    getAllPhotos().then(photos => setLastPhoto(photos[0] ?? null));
  }, []);

  // Pornește camera cât timp suntem în pasul 1 și o oprește când ieșim din el
  useEffect(() => {
    if (captured) return;

    let stream = null;
    let closed = false; // devine true când ieșim din ecran

    // Pornește camera; dacă e ocupată pentru moment, mai încearcă de câteva ori
    async function open(attemptsLeft) {
      try {
        const newStream = await startCamera(videoRef.current);
        if (closed) stopCamera(newStream); // am ieșit între timp din ecran
        else stream = newStream;
      } catch (err) {
        if (closed) return;
        // Pe o adresă nesigură camera nu va porni oricât am încerca
        if (err.name === 'InsecureContext') {
          setError(
            'Camera nu poate porni pe această adresă. Deschide aplicația prin https ' +
            '(site-ul de pe GitHub Pages) sau, pe laptop, la http://localhost.'
          );
          return;
        }
        if (attemptsLeft > 0) {
          setTimeout(() => open(attemptsLeft - 1), 500);
        } else {
          setError(
            'Nu am putut porni camera (' + err.name + '). Verifică permisiunea, ' +
            'dacă altă aplicație folosește camera și dacă pagina este deschisă prin https.'
          );
        }
      }
    }

    setError('');
    open(3);

    return () => {
      closed = true;
      stopCamera(stream);
    };
  }, [captured]);

  async function handleCapture() {
    const blob = await capturePhoto(videoRef.current);
    setTakenAt(toDateTimeInputValue(new Date())); // poza făcută acum are data de acum
    setCaptured(blob);
  }

  async function handleSave() {
    await savePhoto(captured, {
      takenAt: new Date(takenAt).toISOString(),
      source: fromGallery ? 'galerie' : 'camera'
    });
    navigate('/istoric');
  }

  // ---------- Pasul 2: previzualizare ----------
  if (captured) {
    return (
      <section>
        {previewUrl && <img className="preview-image" src={previewUrl} alt="Poza făcută" />}

        <label className="field">
          Data pozei
          <input
            type="datetime-local"
            value={takenAt}
            max={toDateTimeInputValue(new Date())}
            onChange={event => setTakenAt(event.target.value)}
          />
        </label>

        {fromGallery && (
          <p className="hint">
            Poza din galerie nu a fost făcută cu ghidaj, așa că poate fi mai puțin comparabilă
            cu celelalte. Verifică dacă data este corectă.
          </p>
        )}

        <div className="actions">
          {fromGallery ? (
            <button className="btn" onClick={() => navigate('/istoric')}>Renunță</button>
          ) : (
            <button className="btn" onClick={() => setCaptured(null)}>Refă poza</button>
          )}
          <button className="btn btn-primary" onClick={handleSave}>Salvează</button>
        </div>
      </section>
    );
  }

  // ---------- Pasul 1: camera ----------
  return (
    <section>
      <div className="camera-wrapper">
        <video ref={videoRef} autoPlay playsInline muted />
        {overlayUrl && <img className="camera-overlay" src={overlayUrl} alt="" />}
      </div>

      {error ? (
        <p className="error">{error}</p>
      ) : (
        <ul className="tips">
          <li>Cicatricea trebuie să fie complet vizibilă în cadru.</li>
          <li>Ține telefonul perpendicular pe piele, la aceeași distanță ca data trecută.</li>
          <li>Fotografiază în aceeași lumină, de preferat lumină naturală, fără bliț.</li>
          {overlayUrl && <li>Aliniază-te după poza anterioară, afișată transparent peste cameră.</li>}
        </ul>
      )}

      <div className="actions">
        <button className="btn" onClick={() => navigate('/istoric')}>Înapoi</button>
        <button className="btn btn-primary" onClick={handleCapture} disabled={Boolean(error)}>
          Fă poza
        </button>
      </div>
    </section>
  );
}
