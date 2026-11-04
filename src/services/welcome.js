// welcome.js
// Ține minte dacă utilizatorul a văzut deja pagina de început.
// Folosește localStorage; dacă browserul nu îl permite (de ex. navigare privată),
// pagina de început apare din nou, fără ca aplicația să se strice.

const KEY = 'scar-monitor-welcome-seen';

export function hasSeenWelcome() {
  try {
    return localStorage.getItem(KEY) === 'yes';
  } catch {
    return false;
  }
}

export function markWelcomeSeen() {
  try {
    localStorage.setItem(KEY, 'yes');
  } catch {
    // nu putem ține minte; nu e o problemă
  }
}
