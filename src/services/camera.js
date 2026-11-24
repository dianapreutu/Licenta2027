// camera.js
// Pornește camera telefonului în browser și face poze.

// Pornește camera și afișează imaginea live în elementul <video>.
// Întoarce fluxul video ("stream"), ca să poată fi oprit mai târziu.
export async function startCamera(videoElement) {
  // Browserul dă acces la cameră doar paginilor sigure: https sau localhost.
  // Pe o adresă http obișnuită (de ex. http://192.168.x.x), navigator.mediaDevices lipsește.
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    const error = new Error('Camera este disponibilă doar prin https sau pe localhost.');
    error.name = 'InsecureContext';
    throw error;
  }

  const stream = await navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: 'environment', // camera din spate a telefonului
      // Fără aceste valori, browserul alege de obicei o rezoluție mică (640 × 480),
      // iar poza iese neclară. Cerem Full HD; telefonul dă cea mai apropiată rezoluție posibilă.
      width: { ideal: 1920 },
      height: { ideal: 1080 }
    },
    audio: false
  });

  await enableAutofocus(stream);

  if (videoElement) {
    videoElement.srcObject = stream;
  }
  return stream;
}

// Activează focalizarea automată continuă, dacă telefonul o permite
// (de obicei pe Android; pe iPhone focalizarea automată e pornită oricum).
async function enableAutofocus(stream) {
  const track = stream.getVideoTracks()[0];
  if (!track || !track.getCapabilities) return;

  const capabilities = track.getCapabilities();
  if (capabilities.focusMode && capabilities.focusMode.includes('continuous')) {
    try {
      await track.applyConstraints({ advanced: [{ focusMode: 'continuous' }] });
    } catch {
      // telefonul nu acceptă setarea; rămâne focalizarea implicită
    }
  }
}

// Oprește camera (ca să nu rămână pornită în fundal).
export function stopCamera(stream) {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }
}

// Face o poză și o întoarce ca fișier imagine (Blob).
// - Dacă browserul are ImageCapture (Chrome pe Android), folosim fotografierea camerei:
//   poza are rezoluția completă a camerei și e făcută după focalizare.
// - Altfel, copiem imaginea curentă din <video> pe un canvas.
export async function capturePhoto(videoElement) {
  const stream = videoElement.srcObject;
  const track = stream && stream.getVideoTracks()[0];

  if (track && 'ImageCapture' in window) {
    try {
      return await new window.ImageCapture(track).takePhoto();
    } catch {
      // dacă nu merge, folosim varianta cu canvas
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;
  canvas.getContext('2d').drawImage(videoElement, 0, 0, canvas.width, canvas.height);

  return new Promise(resolve => {
    canvas.toBlob(blob => resolve(blob), 'image/jpeg', 0.92);
  });
}
