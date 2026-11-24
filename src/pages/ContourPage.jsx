// ContourPage.jsx
// Ecranul în care utilizatorul desenează cu degetul conturul cicatricii peste poză.
// La salvare, aplicația calculează suprafața și lungimea relative și le păstrează la poză.

import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getPhoto, updatePhoto } from '../services/storage.js';
import { useObjectUrl } from '../services/useObjectUrl.js';
import {
  calculateArea, calculateLength, simplifyPoints, isValidContour
} from '../services/contour.js';

export default function ContourPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [photo, setPhoto] = useState(undefined);
  const imageUrl = useObjectUrl(photo?.blob);

  const imageRef = useRef(null);   // poza afișată
  const canvasRef = useRef(null);  // stratul transparent peste poză, pe care se desenează
  const drawing = useRef(false);   // true cât timp degetul e pe ecran

  // Punctele conturului, în pixelii pozei originale
  const [points, setPoints] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    getPhoto(Number(id)).then(found => {
      setPhoto(found ?? null);
      if (found?.contour) setPoints(found.contour); // un contur existent poate fi refăcut
    });
  }, [id]);

  // Redesenează conturul pe canvas de fiecare dată când se schimbă punctele
  useEffect(() => {
    drawContour(canvasRef.current, imageRef.current, points, drawing.current);
  }, [points]);

  // Când se schimbă mărimea ecranului (de ex. rotirea telefonului), canvasul se redesenează
  useEffect(() => {
    const redraw = () => drawContour(canvasRef.current, imageRef.current, points, false);
    window.addEventListener('resize', redraw);
    return () => window.removeEventListener('resize', redraw);
  }, [points]);

  // Transformă poziția degetului de pe ecran în coordonate din poza originală
  function toImagePoint(event) {
    const image = imageRef.current;
    const box = image.getBoundingClientRect();
    const scale = image.naturalWidth / box.width;
    return {
      x: Math.round((event.clientX - box.left) * scale),
      y: Math.round((event.clientY - box.top) * scale)
    };
  }

  function handlePointerDown(event) {
    event.currentTarget.setPointerCapture(event.pointerId); // urmărim degetul chiar dacă iese din poză
    drawing.current = true;
    setMessage('');
    setPoints([toImagePoint(event)]); // un contur nou începe de la zero
  }

  function handlePointerMove(event) {
    if (!drawing.current) return;
    const point = toImagePoint(event);
    setPoints(previous => [...previous, point]);
  }

  function handlePointerUp() {
    if (!drawing.current) return;
    drawing.current = false;
    // Simplificăm punctele: păstrăm unul la fiecare ~0,5% din lățimea pozei
    const minDistance = Math.max(2, imageRef.current.naturalWidth * 0.005);
    setPoints(previous => simplifyPoints(previous, minDistance));
  }

  async function handleSave() {
    const image = imageRef.current;
    if (!isValidContour(points, image.naturalWidth, image.naturalHeight)) {
      setMessage('Conturul este prea mic sau incomplet. Desenează de jur împrejurul cicatricii.');
      return;
    }
    await updatePhoto(photo.id, {
      contour: points,
      area: calculateArea(points),
      length: calculateLength(points),
      imageWidth: image.naturalWidth,   // păstrăm mărimea pozei, ca măsurătorile să poată fi comparate
      imageHeight: image.naturalHeight,
      measuredAt: new Date().toISOString()
    });
    navigate(`/poza/${photo.id}`);
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

  const canSave = points.length > 0 && !drawing.current;

  return (
    <section>
      <button className="link-back" onClick={() => navigate(`/poza/${photo.id}`)}>‹ Înapoi la poză</button>

      <p className="hint contour-hint">
        Trasează cu degetul conturul cicatricii, de jur împrejur, fără să ridici degetul.
        Conturul se închide singur când ridici degetul.
      </p>

      <div className="contour-wrapper">
        {imageUrl && (
          <img
            ref={imageRef}
            src={imageUrl}
            alt="Poza cicatricii"
            onLoad={() => drawContour(canvasRef.current, imageRef.current, points, false)}
            draggable={false}
          />
        )}
        <canvas
          ref={canvasRef}
          className="contour-canvas"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        />
      </div>

      {message && <p className="status status-error">{message}</p>}

      <div className="actions">
        <button className="btn" onClick={() => { setPoints([]); setMessage(''); }} disabled={points.length === 0}>
          Șterge
        </button>
        <button className="btn btn-primary" onClick={handleSave} disabled={!canSave}>
          Salvează
        </button>
      </div>
    </section>
  );
}

// Desenează conturul pe canvas, la mărimea la care e afișată poza.
// - în timpul desenării: o linie deschisă;
// - după ridicarea degetului: poligonul închis, cu interiorul colorat transparent.
function drawContour(canvas, image, points, isDrawing) {
  if (!canvas || !image || !image.naturalWidth) return;

  const box = image.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1; // ecranele de telefon au mai mulți pixeli reali
  canvas.width = Math.round(box.width * ratio);
  canvas.height = Math.round(box.height * ratio);
  canvas.style.width = `${box.width}px`;
  canvas.style.height = `${box.height}px`;

  const context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);
  if (points.length < 2) return;

  // din pixelii pozei originale în pixelii canvasului
  const scale = (box.width * ratio) / image.naturalWidth;

  context.beginPath();
  context.moveTo(points[0].x * scale, points[0].y * scale);
  for (const p of points.slice(1)) context.lineTo(p.x * scale, p.y * scale);
  if (!isDrawing) {
    context.closePath();
    context.fillStyle = 'rgba(255, 255, 255, 0.22)';
    context.fill();
  }
  context.lineWidth = 3 * ratio;
  context.lineJoin = 'round';
  context.lineCap = 'round';
  context.strokeStyle = '#ffffff';
  context.shadowColor = 'rgba(0, 0, 0, 0.55)';
  context.shadowBlur = 4 * ratio;
  context.stroke();
}
