// storage.js
// Salvează datele local, în browserul telefonului, folosind IndexedDB.
// Datele nu pleacă pe internet: rămân doar pe dispozitivul utilizatorului.
//
// Baza de date are trei „tabele” (object stores):
// - photos:   pozele cicatricii;
// - care:     îngrijirile (de ex. „gel cu silicon”, cu data de început și de sfârșit);
// - symptoms: simptomele notate de utilizator (mâncărime, durere, tensiune, 1–10).

const DB_NAME = 'scar-monitor';
const DB_VERSION = 2; // versiunea 2 a adăugat tabelele pentru îngrijiri și simptome

export const STORE_PHOTOS = 'photos';
export const STORE_CARE = 'care';
export const STORE_SYMPTOMS = 'symptoms';

// Deschide baza de date. La prima rulare (sau la o versiune nouă), creează tabelele lipsă.
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      // Fiecare înregistrare primește automat un id unic (1, 2, 3, ...)
      for (const name of [STORE_PHOTOS, STORE_CARE, STORE_SYMPTOMS]) {
        if (!db.objectStoreNames.contains(name)) {
          db.createObjectStore(name, { keyPath: 'id', autoIncrement: true });
        }
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// ---------- Funcții generale, folosite de toate tabelele ----------

// Rulează o singură operație pe un tabel și întoarce rezultatul.
async function run(storeName, mode, operation) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, mode);
    const request = operation(transaction.objectStore(storeName));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Întoarce toate înregistrările dintr-un tabel, ordonate descrescător după un câmp de tip dată.
async function getAllSorted(storeName, dateField) {
  const items = await run(storeName, 'readonly', store => store.getAll());
  return items.sort((a, b) => b[dateField].localeCompare(a[dateField]));
}

function remove(storeName, id) {
  return run(storeName, 'readwrite', store => store.delete(id));
}

// ---------- Poze ----------

// Salvează o poză nouă.
// - blob: imaginea propriu-zisă;
// - takenAt: data la care a fost făcută poza (implicit: acum);
// - source: „camera” (făcută cu ghidaj în aplicație) sau „galerie” (încărcată).
export function savePhoto(blob, { takenAt, source = 'camera' } = {}) {
  const photo = {
    blob: blob,
    createdAt: takenAt ?? new Date().toISOString(),
    source: source,
    // Câmpuri pe care le vom completa în săptămânile următoare:
    contour: null,  // punctele conturului desenat de utilizator
    area: null,     // suprafața în pixeli pătrați
    quality: null   // claritate, luminozitate, scor de comparabilitate
  };
  return run(STORE_PHOTOS, 'readwrite', store => store.add(photo)); // întoarce id-ul nou
}

// Toate pozele, cele mai noi primele.
export function getAllPhotos() {
  return getAllSorted(STORE_PHOTOS, 'createdAt');
}

// O singură poză, după id.
export function getPhoto(id) {
  return run(STORE_PHOTOS, 'readonly', store => store.get(id));
}

export function deletePhoto(id) {
  return remove(STORE_PHOTOS, id);
}

// ---------- Îngrijiri ----------

// care = { name: 'Gel cu silicon', startDate: '2026-10-10', endDate: null, notes: '' }
export function addCare(care) {
  return run(STORE_CARE, 'readwrite', store => store.add(care));
}

export function getAllCare() {
  return getAllSorted(STORE_CARE, 'startDate');
}

export function deleteCare(id) {
  return remove(STORE_CARE, id);
}

// ---------- Simptome ----------

// symptom = { date: '2026-11-04', itch: 3, pain: 1, tightness: 2, notes: '' }
export function addSymptom(symptom) {
  return run(STORE_SYMPTOMS, 'readwrite', store => store.add(symptom));
}

export function getAllSymptoms() {
  return getAllSorted(STORE_SYMPTOMS, 'date');
}

export function deleteSymptom(id) {
  return remove(STORE_SYMPTOMS, id);
}
