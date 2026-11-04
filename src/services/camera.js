// camera.js
// Pornește camera telefonului în browser și face poze.

// Pornește camera și afișează imaginea live în elementul <video>.
// Întoarce fluxul video ("stream"), ca să poată fi oprit mai târziu.
export async function startCamera(videoElement) {
  // "environment" = camera din spate a telefonului
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: 'environment' },
    audio: false
  });
  if (videoElement) {
    videoElement.srcObject = stream;
  }
  return stream;
}

// Oprește camera (ca să nu rămână pornită în fundal).
export function stopCamera(stream) {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }
}

// Face o poză: copiază imaginea curentă din <video> pe un canvas
// și o transformă într-un fișier imagine (Blob, format JPEG).
export function capturePhoto(videoElement) {
  const canvas = document.createElement('canvas');
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;

  const context = canvas.getContext('2d');
  context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

  return new Promise(resolve => {
    canvas.toBlob(blob => resolve(blob), 'image/jpeg', 0.9);
  });
}
