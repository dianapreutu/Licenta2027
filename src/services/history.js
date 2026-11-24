// history.js
// Calcule pe lista de poze, folosite de ecranul Acasă.
// Pozele primite sunt deja ordonate, cele mai noi primele (vezi getAllPhotos).

// Ultimele două poze cu contur și diferența de suprafață dintre ele, în procente.
// Este o diferență brută: nu ține cont încă de eroarea de măsurare (vine după experiment).
export function latestChange(photos) {
  const measured = photos.filter(photo => photo.area);
  if (measured.length < 2) return null;
  const [latest, previous] = measured;
  return {
    latest,
    previous,
    percent: ((latest.area - previous.area) / previous.area) * 100
  };
}
