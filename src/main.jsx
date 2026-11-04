// main.jsx
// Punctul de pornire: React afișează componenta <App /> în <div id="root">.

import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App.jsx';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* HashRouter: adresele arată ca .../#/camera, ceea ce merge pe GitHub Pages */}
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
);

// Service worker-ul (funcționare fără internet) se activează doar în versiunea publicată,
// ca să nu încurce în timpul dezvoltării.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  navigator.serviceWorker.register(`${import.meta.env.BASE_URL}service-worker.js`);
}
