// JournalPage.jsx
// Jurnalul: îngrijirile urmate și simptomele notate de utilizator.
// Datele de aici vor apărea mai târziu pe graficul de evoluție, lângă măsurătorile din poze.

import { useEffect, useState } from 'react';
import {
  addCare, getAllCare, deleteCare,
  addSymptom, getAllSymptoms, deleteSymptom
} from '../services/storage.js';
import { formatDay, toDateInputValue } from '../services/format.js';

export default function JournalPage() {
  const [tab, setTab] = useState('care'); // „care” = îngrijiri, „symptoms” = simptome

  return (
    <section>
      <div className="segmented">
        <button className={tab === 'care' ? 'active' : ''} onClick={() => setTab('care')}>
          Îngrijiri
        </button>
        <button className={tab === 'symptoms' ? 'active' : ''} onClick={() => setTab('symptoms')}>
          Simptome
        </button>
      </div>

      {tab === 'care' ? <CareSection /> : <SymptomsSection />}
    </section>
  );
}

// ---------- Îngrijiri ----------

function CareSection() {
  const today = toDateInputValue(new Date());
  const [items, setItems] = useState([]);
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState('');

  const reload = () => getAllCare().then(setItems);
  useEffect(() => { reload(); }, []);

  async function handleAdd(event) {
    event.preventDefault(); // formularul nu reîncarcă pagina
    await addCare({ name: name.trim(), startDate, endDate: endDate || null });
    setName('');
    setEndDate('');
    reload();
  }

  async function handleDelete(id) {
    if (window.confirm('Ștergi această îngrijire?')) {
      await deleteCare(id);
      reload();
    }
  }

  return (
    <>
      <form className="form-card" onSubmit={handleAdd}>
        <h3>Adaugă o îngrijire</h3>
        <label className="field">
          Denumire
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="de ex. gel cu silicon, masaj, plasturi"
            required
          />
        </label>
        <div className="field-row">
          <label className="field">
            Început
            <input type="date" value={startDate} max={today} onChange={e => setStartDate(e.target.value)} required />
          </label>
          <label className="field">
            Sfârșit (opțional)
            <input type="date" value={endDate} min={startDate} onChange={e => setEndDate(e.target.value)} />
          </label>
        </div>
        <button className="btn btn-primary btn-full" type="submit">Adaugă</button>
      </form>

      {items.length === 0 ? (
        <p className="empty">Nu ai adăugat încă nicio îngrijire.</p>
      ) : (
        <ul className="entry-list">
          {items.map(item => (
            <li key={item.id} className="entry">
              <div>
                <div className="entry-title">{item.name}</div>
                <div className="muted">
                  din {formatDay(item.startDate)}
                  {item.endDate ? ` până pe ${formatDay(item.endDate)}` : ' · în curs'}
                </div>
              </div>
              <button className="icon-btn" onClick={() => handleDelete(item.id)} aria-label="Șterge">×</button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

// ---------- Simptome ----------

const SYMPTOMS = [
  { key: 'itch', label: 'Iritație' },
  { key: 'pain', label: 'Durere' },
  { key: 'tightness', label: 'Senzație de tensiune' }
];

function SymptomsSection() {
  const today = toDateInputValue(new Date());
  const [items, setItems] = useState([]);
  const [date, setDate] = useState(today);
  const [values, setValues] = useState({ itch: 1, pain: 1, tightness: 1 });

  const reload = () => getAllSymptoms().then(setItems);
  useEffect(() => { reload(); }, []);

  async function handleAdd(event) {
    event.preventDefault();
    await addSymptom({ date, ...values });
    setValues({ itch: 1, pain: 1, tightness: 1 });
    reload();
  }

  async function handleDelete(id) {
    if (window.confirm('Ștergi această înregistrare?')) {
      await deleteSymptom(id);
      reload();
    }
  }

  return (
    <>
      <form className="form-card" onSubmit={handleAdd}>
        <h3>Cum te simți azi?</h3>
        <label className="field">
          Data
          <input type="date" value={date} max={today} onChange={e => setDate(e.target.value)} required />
        </label>

        {SYMPTOMS.map(symptom => (
          <label key={symptom.key} className="field">
            <span className="slider-label">
              {symptom.label}
              <strong>{values[symptom.key]} / 10</strong>
            </span>
            <input
              type="range"
              min="1"
              max="10"
              value={values[symptom.key]}
              onChange={e => setValues({ ...values, [symptom.key]: Number(e.target.value) })}
            />
          </label>
        ))}
        <p className="hint">1 = deloc, 10 = foarte puternic</p>

        <button className="btn btn-primary btn-full" type="submit">Salvează</button>
      </form>

      {items.length === 0 ? (
        <p className="empty">Nu ai notat încă niciun simptom.</p>
      ) : (
        <ul className="entry-list">
          {items.map(item => (
            <li key={item.id} className="entry">
              <div>
                <div className="entry-title">{formatDay(item.date)}</div>
                <div className="muted">
                  Iritație {item.itch} · Durere {item.pain} · Tensiune {item.tightness}
                </div>
              </div>
              <button className="icon-btn" onClick={() => handleDelete(item.id)} aria-label="Șterge">×</button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
