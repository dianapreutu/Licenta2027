# Scar Monitor
 
Aplicație web instalabilă pe telefon (PWA) pentru monitorizarea evoluției cicatricilor postoperatorii din fotografii. Toate datele rămân local, în browserul telefonului.
 
## Funcționalități implementate
 
- Istoricul pozelor, în ordine cronologică
- Fotografiere cu camera telefonului, cu poza anterioară suprapusă semitransparent pentru aliniere
- Încărcare din galerie, cu data fișierului (modificabilă) și eticheta „Galerie”
- Previzualizare înainte de salvare, cu opțiunea de a reface poza
- Indicații de fotografiere pe ecranul camerei
- Istoric cu rezumat (zile de monitorizare, număr de poze, ultima poză) și pozele grupate pe luni
- Ecranul unei poze: poza mare, data, sursa, ștergerea pozei
- Jurnal de îngrijiri (denumire, început, sfârșit) și de simptome (mâncărime, durere, tensiune, 1–10)
- Navigare între secțiunile Istoric, Evoluție și Jurnal
- Pagina de început, la prima deschidere (se poate redeschide apăsând pe siglă)
- Salvare locală (IndexedDB)
Planul complet, cu starea fiecărei funcționalități, este în secțiunea [Planul de implementare](#planul-de-implementare).
 
## Structura proiectului
 
```
Licenta2027/
├── .github/
│   └── workflows/
│       └── deploy.yml           publicarea automată pe GitHub Pages
├── public/
│   ├── icons/
│   │   ├── icon-192.png         iconița aplicației (mică)
│   │   └── icon-512.png         iconița aplicației (mare)
│   ├── manifest.json            face aplicația instalabilă pe telefon (PWA)
│   └── service-worker.js        permite folosirea fără internet
├── src/
│   ├── components/              bucăți de interfață refolosite
│   │   ├── BottomNav.jsx        bara de navigare de jos
│   │   ├── Logo.jsx             sigla aplicației
│   │   └── PhotoCard.jsx        un card din istoric
│   ├── pages/                   ecranele aplicației
│   │   ├── CameraPage.jsx       camera, încărcarea din galerie, previzualizarea
│   │   ├── EvolutionPage.jsx    evoluția (graficul vine după desenarea conturului)
│   │   ├── HistoryPage.jsx      istoricul pozelor, cu rezumat și grupare pe luni
│   │   ├── JournalPage.jsx      jurnalul de îngrijiri și simptome
│   │   ├── PhotoDetailPage.jsx  ecranul unei poze
│   │   └── WelcomePage.jsx      pagina de început
│   ├── services/                logica aplicației, separată de interfață
│   │   ├── camera.js            camera telefonului
│   │   ├── contour.js           calculul suprafeței conturului
│   │   ├── format.js            formatarea datelor
│   │   ├── quality.js           verificarea calității pozei
│   │   ├── storage.js           salvarea datelor în IndexedDB
│   │   ├── useObjectUrl.js      afișarea imaginilor salvate
│   │   └── welcome.js           ține minte dacă pagina de început a fost văzută
│   ├── App.jsx                  antetul, ecranele și navigarea
│   ├── main.jsx                 pornirea aplicației React
│   └── styles.css               culorile și aspectul aplicației
├── .gitignore                   fișierele care nu se urcă pe GitHub
├── index.html                   pagina în care se încarcă aplicația
├── package.json                 bibliotecile folosite și comenzile (npm run dev)
├── package-lock.json            versiunile exacte ale bibliotecilor (generat automat)
├── README.md                    descrierea proiectului și planul
└── vite.config.js               configurarea Vite
```
 
## Rulare locală
 
```
npm install
npm run dev
```
 
Aplicația pornește la adresa afișată în terminal (de exemplu `http://localhost:5173/Licenta2027/`).
 
## Publicare
 
La fiecare `git push` pe ramura `main`, aplicația este construită și publicată automat pe GitHub Pages:
https://dianapreutu.github.io/Licenta2027/
 
Pe telefon, camera funcționează doar prin `https`, deci aplicația se testează pe telefon prin adresa de mai sus.
 
## Tehnologii
 
React, Vite, React Router, IndexedDB, Service Worker (PWA).
 
## Planul de implementare
 
Lista completă a funcționalităților din documentul de viziune, cu starea fiecăreia.
Se bifează `[x]` pe măsură ce sunt terminate.
 
### Etapa 1 – funcționalitățile de bază
 
#### 1. Fotografiere ghidată și istoric local
- [x] Istoricul pozelor, în ordine cronologică
- [x] Fotografiere cu camera telefonului
- [x] Poza anterioară suprapusă semitransparent peste cameră, pentru aliniere
- [x] Previzualizare cu „Salvează” / „Refă poza”
- [x] Salvare locală în IndexedDB (fără server)
- [x] Încărcare din galerie, cu data fișierului (modificabilă) și eticheta „Galerie”
- [x] Indicații de fotografiere: cicatricea complet vizibilă, telefon perpendicular, distanță asemănătoare
- [x] Ecranul unei poze: poza mare, data, sursa, ștergerea pozei
- [x] Rezumatul istoricului și gruparea pozelor pe luni
- [x] Bara de navigare: Istoric, Evoluție, Jurnal
- [x] Pagina de început și sigla aplicației
#### 2. Verificări simple de calitate (`src/services/quality.js`)
- [ ] Luminozitate: media pixelilor; avertizare la poze prea întunecate sau supraexpuse
- [ ] Claritate: diferențele dintre pixelii vecini; avertizare la poze mișcate
- [ ] La cameră: „Refă poza”; la galerie: „Alege altă poză” sau salvare marcată ca nesigură
#### 3. Delimitarea cicatricii și suprafața relativă (`src/services/contour.js`)
- [ ] Desenarea conturului cu degetul pe poză (canvas)
- [ ] Corectarea / refacerea conturului
- [x] Calculul suprafeței relative în pixeli pătrați (funcția `calculateArea`)
- [ ] Lungimea relativă: latura lungă a dreptunghiului de arie minimă rotit după orientarea cicatricii
- [ ] Salvarea conturului și a suprafeței la poză
#### 4. Experimentele (partea de cercetare a lucrării)
- [ ] Repetabilitate: aceeași cicatrice, 5–10 poze independente (telefonul repoziționat), coeficientul de variație al suprafeței pentru fiecare cicatrice
- [ ] Acuratețea delimitării: comparație cu un contur de referință (IoU), plus suprafața și lungimea
- [ ] Mai multe cicatrici, nu doar una
- [ ] Opțional: condiții diferite (lumină, alt telefon), poze cu și fără ghidaj
- [ ] Export al măsurătorilor (CSV) pentru analiza experimentelor
#### 5. Scorul de comparabilitate și pragul
- [ ] Scor tehnic între două poze: claritate, iluminare, încadrare, aliniere (poziția și dimensiunea conturului față de poza anterioară)
- [ ] Avertizare „comparație nesigură” când pozele diferă prea mult (inclusiv pozele din galerie)
- [ ] Pragul orientativ, stabilit din experimentul de repetabilitate
- [ ] Evidențierea diferențelor peste prag („schimbare observată”) și în limita pragului („în limita variației de măsurare”)
#### 6. Culoarea relativă
- [ ] Diferența de culoare dintre cicatrice și un inel de piele din jur (orientativ)
#### 7. Îngrijiri, simptome și grafice
- [x] Jurnal de îngrijiri: denumire, data de început, data de sfârșit
- [x] Simptome pe o scală de la 1 la 10: mâncărime, durere, senzație de tensiune
- [ ] Graficul evoluției suprafeței în timp, cu banda variației normale
- [ ] Îngrijirile marcate pe axa timpului; comparația tendințelor dintre perioade (fără concluzii despre tratament)
- [ ] Simptomele pe aceeași axă a timpului
### Etapa 2 – extinderi
- [ ] Contur găsit complet automat
- [ ] Raport PDF pentru consultație (poze, grafice, îngrijiri, simptome)
- [ ] Comparație vizuală înainte/după, cu bară glisantă
- [ ] Notificări pentru poze regulate
- [ ] Exportul și importul datelor (mutarea pe un telefon nou)
### De pregătit pentru demo
- [ ] Set de poze demonstrative (aceeași „cicatrice” fotografiată în zile diferite), ca istoricul și graficele să aibă date
- [ ] Testarea pe telefon, prin GitHub Pages
- [ ] Oglindirea ecranului telefonului pe laptop, pentru prezentare
### Limitări de menționat în lucrare
- Scop informativ și de monitorizare personală; fără diagnostic sau recomandări de tratament
- Măsurători relative, în pixeli, comparabile doar între poze făcute în condiții similare
- Pragul este valabil pentru condițiile testate și nu dovedește singur o schimbare biologică
- Datele sunt doar pe telefon: se pierd dacă telefonul se pierde (de aici, exportul din Etapa 2)
- Culoarea poate fi influențată de lumină, balansul de alb, tonul pielii și telefon