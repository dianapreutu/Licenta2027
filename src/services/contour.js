// contour.js
// Calculele pe conturul cicatricii, desenat de utilizator pe poză.
// Conturul este o listă de puncte {x, y}, în pixelii pozei originale
// (nu ai ecranului), ca măsurătorile să nu depindă de mărimea ecranului.

// Suprafața relativă: aria poligonului format de puncte, în pixeli pătrați.
// Formula lui Gauss („shoelace”): A = 1/2 · |Σ (x_i · y_(i+1) − x_(i+1) · y_i)|
// Exemplu: calculateArea([{x:0,y:0}, {x:10,y:0}, {x:10,y:10}, {x:0,y:10}]) => 100
export function calculateArea(points) {
  let sum = 0;
  for (let i = 0; i < points.length; i++) {
    const current = points[i];
    const next = points[(i + 1) % points.length];
    sum += current.x * next.y - next.x * current.y;
  }
  return Math.abs(sum) / 2;
}

// Lungimea relativă: latura lungă a dreptunghiului de arie minimă care încadrează conturul,
// rotit după orientarea cicatricii. Așa lungimea nu depinde de unghiul în care e ținut telefonul.
// Metoda: dreptunghiul de arie minimă are mereu o latură pe o latură a „învelitoarei convexe”
// (cel mai mic poligon convex care cuprinde toate punctele), deci încercăm fiecare latură a ei.
export function calculateLength(points) {
  const hull = convexHull(points);
  if (hull.length < 3) return 0;

  let best = { area: Infinity, length: 0 };
  for (let i = 0; i < hull.length; i++) {
    const a = hull[i];
    const b = hull[(i + 1) % hull.length];
    const edge = Math.hypot(b.x - a.x, b.y - a.y);
    if (edge === 0) continue;

    // Axele dreptunghiului: una de-a lungul laturii, cealaltă perpendiculară pe ea
    const ux = (b.x - a.x) / edge;
    const uy = (b.y - a.y) / edge;

    let minU = Infinity, maxU = -Infinity, minV = Infinity, maxV = -Infinity;
    for (const p of hull) {
      const u = p.x * ux + p.y * uy;   // proiecția pe latură
      const v = -p.x * uy + p.y * ux;  // proiecția pe perpendiculară
      minU = Math.min(minU, u); maxU = Math.max(maxU, u);
      minV = Math.min(minV, v); maxV = Math.max(maxV, v);
    }

    const width = maxU - minU;
    const height = maxV - minV;
    if (width * height < best.area) {
      best = { area: width * height, length: Math.max(width, height) };
    }
  }
  return best.length;
}

// Învelitoarea convexă, cu algoritmul „monotone chain” (Andrew).
function convexHull(points) {
  const sorted = [...points].sort((p, q) => p.x - q.x || p.y - q.y);
  if (sorted.length < 3) return sorted;

  const cross = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  const lower = [];
  for (const p of sorted) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
    lower.push(p);
  }
  const upper = [];
  for (let i = sorted.length - 1; i >= 0; i--) {
    const p = sorted[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
    upper.push(p);
  }
  return lower.slice(0, -1).concat(upper.slice(0, -1));
}

// Desenul cu degetul dă sute de puncte foarte apropiate. Păstrăm doar punctele
// aflate la cel puțin „minDistance” pixeli de precedentul, ca să salvăm mai puține date.
export function simplifyPoints(points, minDistance) {
  if (points.length === 0) return [];
  const result = [points[0]];
  for (const p of points.slice(1)) {
    const last = result[result.length - 1];
    if (Math.hypot(p.x - last.x, p.y - last.y) >= minDistance) result.push(p);
  }
  return result;
}

// Un contur e valid dacă are destule puncte și închide o suprafață reală,
// nu e doar o linie trasă dus-întors.
export const MIN_POINTS = 8;

export function isValidContour(points, imageWidth, imageHeight) {
  if (points.length < MIN_POINTS) return false;

  const area = calculateArea(points);
  // 1. suprafața trebuie să fie cel puțin 0,01% din poză
  if (area < imageWidth * imageHeight * 0.0001) return false;

  // 2. lățimea medie (suprafața împărțită la lungime) trebuie să fie cel puțin 0,5% din
  //    lățimea pozei; o linie trasă dus-întors are o lățime de doar câțiva pixeli
  const length = calculateLength(points);
  return length > 0 && area / length >= imageWidth * 0.005;
}
