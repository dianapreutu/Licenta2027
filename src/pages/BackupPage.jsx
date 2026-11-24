// BackupPage.jsx
// Ecranul „Backup”: exportul datelor într-un fișier criptat și importul lor pe alt dispozitiv.

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { exportData, importData } from '../services/backup.js';
import { toDateInputValue } from '../services/format.js';

const MIN_PASSWORD = 8;

export default function BackupPage() {
  return (
    <section>
      <p className="muted backup-intro">
        Datele tale sunt păstrate doar pe acest dispozitiv. Ca să le muți pe alt telefon sau
        laptop, exportă-le într-un fișier protejat cu parolă, apoi importă fișierul acolo.
      </p>
      <ExportSection />
      <ImportSection />
    </section>
  );
}

// ---------- Export ----------

function ExportSection() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState(null); // { type: 'ok' | 'error' | 'busy', text }

  async function handleExport(event) {
    event.preventDefault();
    if (password.length < MIN_PASSWORD) {
      setStatus({ type: 'error', text: `Parola trebuie să aibă cel puțin ${MIN_PASSWORD} caractere.` });
      return;
    }
    if (password !== confirm) {
      setStatus({ type: 'error', text: 'Cele două parole nu coincid.' });
      return;
    }

    setStatus({ type: 'busy', text: 'Se criptează datele…' });
    try {
      const file = await exportData(password);
      downloadFile(file, `scar-monitor-backup-${toDateInputValue(new Date())}.json`);
      setPassword('');
      setConfirm('');
      setStatus({ type: 'ok', text: 'Backup-ul a fost salvat. Păstrează parola: fără ea, fișierul nu poate fi deschis.' });
    } catch {
      setStatus({ type: 'error', text: 'Exportul nu a reușit. Încearcă din nou.' });
    }
  }

  return (
    <form className="form-card" onSubmit={handleExport}>
      <h3>Exportă datele</h3>
      <p className="hint">Pozele, îngrijirile și simptomele, într-un singur fișier criptat.</p>
      <label className="field">
        Parolă (minim {MIN_PASSWORD} caractere)
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="new-password" required />
      </label>
      <label className="field">
        Confirmă parola
        <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} autoComplete="new-password" required />
      </label>
      <button className="btn btn-primary btn-full" type="submit" disabled={status?.type === 'busy'}>
        Exportă datele
      </button>
      <StatusMessage status={status} />
    </form>
  );
}

// ---------- Import ----------

function ImportSection() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('add'); // „add” = adaugă, „replace” = înlocuiește
  const [status, setStatus] = useState(null);

  async function handleImport(event) {
    event.preventDefault();
    if (mode === 'replace' && !window.confirm('Datele existente pe acest dispozitiv vor fi șterse și înlocuite. Continui?')) {
      return;
    }

    setStatus({ type: 'busy', text: 'Se decriptează datele…' });
    try {
      const counts = await importData(file, password, mode === 'replace');
      setPassword('');
      setStatus({
        type: 'ok',
        text: `Am importat ${plural(counts.photos, 'poză', 'poze')}, ${plural(counts.care, 'îngrijire', 'îngrijiri')} ` +
          `și ${plural(counts.symptoms, 'înregistrare', 'înregistrări')} de simptome.`
      });
    } catch (error) {
      setStatus({ type: 'error', text: error.message });
    }
  }

  return (
    <form className="form-card backup-import" onSubmit={handleImport}>
      <h3>Importă un backup</h3>
      <label className="field">
        Fișierul de backup
        <input type="file" accept=".json,application/json" onChange={e => setFile(e.target.files[0] ?? null)} required />
      </label>
      <label className="field">
        Parola fișierului
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" required />
      </label>

      <fieldset className="choice">
        <legend>Ce se întâmplă cu datele de pe acest dispozitiv?</legend>
        <label>
          <input type="radio" name="mode" checked={mode === 'add'} onChange={() => setMode('add')} />
          Le păstrez și adaug datele din fișier
        </label>
        <label>
          <input type="radio" name="mode" checked={mode === 'replace'} onChange={() => setMode('replace')} />
          Le înlocuiesc cu datele din fișier
        </label>
      </fieldset>

      <button className="btn btn-primary btn-full" type="submit" disabled={!file || status?.type === 'busy'}>
        Importă datele
      </button>
      <StatusMessage status={status} />
      {status?.type === 'ok' && (
        <button className="btn btn-full" type="button" onClick={() => navigate('/istoric')}>Vezi istoricul</button>
      )}
    </form>
  );
}

// ---------- Ajutătoare ----------

// „1 poză”, „2 poze”, „20 de poze” (în română, de la 20 în sus se adaugă „de”)
function plural(count, one, many) {
  if (count === 1) return `1 ${one}`;
  const rest = count % 100;
  return count >= 20 && (rest === 0 || rest >= 20) ? `${count} de ${many}` : `${count} ${many}`;
}

function StatusMessage({ status }) {
  if (!status) return null;
  return <p className={`status status-${status.type}`} role="status">{status.text}</p>;
}

// Descarcă un fișier pe dispozitiv (pe telefon ajunge în „Descărcări” / „Fișiere”)
function downloadFile(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
