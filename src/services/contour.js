// contour.js
// DE FĂCUT (săptămânile următoare):
// - utilizatorul desenează cu degetul conturul cicatricii peste poză (pe un <canvas>);
// - conturul se salvează ca listă de puncte {x, y};
// - suprafața relativă se calculează în pixeli pătrați.

// Calculează aria unui poligon din punctele conturului (formula lui Gauss / „shoelace”).
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
