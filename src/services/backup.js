// backup.js
// Exportul și importul datelor într-un fișier criptat cu parolă.
//
// Cum funcționează criptarea (folosind Web Crypto, inclus în browser):
// 1. Din parolă se obține o cheie de 256 de biți cu PBKDF2 (SHA-256, 250.000 de iterații).
//    Iterațiile multe fac ghicirea parolei prin încercări repetate foarte lentă.
//    „salt”-ul (16 octeți aleatori) face ca aceeași parolă să dea chei diferite la fiecare export.
// 2. Datele (pozele, îngrijirile, simptomele) sunt criptate cu AES-GCM, folosind cheia de mai sus
//    și un „iv” (12 octeți aleatori). AES-GCM detectează și orice modificare a fișierului.
// 3. Fișierul conține salt-ul, iv-ul și datele criptate. Fără parolă, datele nu pot fi citite.

import { getEverything, writeEverything } from './storage.js';

const FORMAT = 'scar-monitor-backup';
const VERSION = 1;
const ITERATIONS = 250000;

// ---------- Export ----------

// Întoarce un fișier (Blob) cu toate datele, criptate cu parola dată.
export async function exportData(password) {
  const { photos, care, symptoms } = await getEverything();

  // Imaginile (Blob) se transformă în text (base64), ca să încapă într-un fișier JSON
  const photosAsText = await Promise.all(
    photos.map(async photo => ({
      ...photo,
      blob: undefined,
      image: await blobToBase64(photo.blob),
      imageType: photo.blob.type || 'image/jpeg'
    }))
  );

  const plain = new TextEncoder().encode(
    JSON.stringify({ exportedAt: new Date().toISOString(), photos: photosAsText, care, symptoms })
  );

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plain);

  const file = {
    format: FORMAT,
    version: VERSION,
    salt: bytesToBase64(salt),
    iv: bytesToBase64(iv),
    data: bytesToBase64(new Uint8Array(encrypted))
  };
  return new Blob([JSON.stringify(file)], { type: 'application/json' });
}

// ---------- Import ----------

// Citește un fișier de backup, îl decriptează și scrie datele în aplicație.
// Întoarce câte înregistrări au fost importate.
export async function importData(file, password, replace) {
  let parsed;
  try {
    parsed = JSON.parse(await file.text());
  } catch {
    throw new Error('Fișierul ales nu este un backup Scar Monitor.');
  }
  if (parsed.format !== FORMAT) {
    throw new Error('Fișierul ales nu este un backup Scar Monitor.');
  }

  let content;
  try {
    const key = await deriveKey(password, base64ToBytes(parsed.salt));
    const plain = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: base64ToBytes(parsed.iv) },
      key,
      base64ToBytes(parsed.data)
    );
    content = JSON.parse(new TextDecoder().decode(plain));
  } catch {
    // AES-GCM refuză decriptarea dacă parola e greșită sau fișierul a fost modificat
    throw new Error('Parola nu este corectă sau fișierul este deteriorat.');
  }

  // Textul base64 se transformă înapoi în imagini (Blob)
  const photos = content.photos.map(({ image, imageType, ...photo }) => ({
    ...photo,
    blob: new Blob([base64ToBytes(image)], { type: imageType })
  }));

  await writeEverything({ photos, care: content.care, symptoms: content.symptoms }, replace);
  return { photos: photos.length, care: content.care.length, symptoms: content.symptoms.length };
}

// ---------- Funcții ajutătoare ----------

// Obține cheia de criptare din parolă (PBKDF2 → cheie AES-GCM de 256 de biți)
async function deriveKey(password, salt) {
  const baseKey = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

async function blobToBase64(blob) {
  return bytesToBase64(new Uint8Array(await blob.arrayBuffer()));
}

// Transformă octeți în text base64, pe bucăți, ca să meargă și pentru imagini mari
function bytesToBase64(bytes) {
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function base64ToBytes(text) {
  const binary = atob(text);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}
