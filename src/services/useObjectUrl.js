// useObjectUrl.js
// Hook React care transformă o imagine salvată (Blob) într-o adresă temporară
// pe care un <img> o poate afișa. Adresa este eliberată din memorie automat,
// când componenta dispare sau imaginea se schimbă.

import { useEffect, useState } from 'react';

export function useObjectUrl(blob) {
  const [url, setUrl] = useState(null);

  useEffect(() => {
    if (!blob) {
      setUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(blob);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [blob]);

  return url;
}
