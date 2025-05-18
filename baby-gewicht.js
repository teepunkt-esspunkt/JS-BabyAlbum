// baby-gewicht.js
window.addEventListener('DOMContentLoaded', () => {
  const gewichtFormular = document.getElementById('gewicht-formular');
  const gewichtEintraege = document.getElementById('gewicht-eintraege');
  const neuesGewichtBtn = document.getElementById('neues-gewicht');
  const gewichtSpeichernBtn = document.getElementById('gewicht-speichern');
  const gewichtExportierenBtn = document.getElementById('gewicht-exportieren');
  const gewichtImportierenInput = document.getElementById('gewicht-importieren');

  babyApp.gewichtDaten = {};

  function addGewichtEintrag(vorbelegtesDatum = null, istGeburt = false) {
    const container = document.createElement('div');
    container.className = 'gewicht-eintrag';

    container.innerHTML = `
      <label>${istGeburt ? 'Geburt (Datum):' : 'Datum:'}</label>
      <input type="date" value="${vorbelegtesDatum ? new Date(vorbelegtesDatum).toISOString().split('T')[0] : ''}">
      <label> Gewicht (g): </label>
      <input type="number" min="0">
    `;

    gewichtEintraege.appendChild(container);
  }

  babyApp.addGewichtEintrag = addGewichtEintrag;

  neuesGewichtBtn.addEventListener('click', () => {
    addGewichtEintrag();
  });

  gewichtSpeichernBtn.addEventListener('click', () => {
    babyApp.gewichtDaten = {};
    const eintraege = gewichtEintraege.querySelectorAll('.gewicht-eintrag');

    eintraege.forEach(entry => {
      const inputs = entry.querySelectorAll('input');
      const datum = inputs[0].value;
      const gewicht = inputs[1].value;
      if (datum && gewicht) {
        babyApp.gewichtDaten[datum] = parseInt(gewicht);
      }
    });

    gewichtFormular.style.display = 'none';

    if (babyApp.bilderAnzeigen) babyApp.bilderAnzeigen(babyApp.filesWithDate);
    if (babyApp.zeigeTimeline) babyApp.zeigeTimeline();
  });

  gewichtExportierenBtn.addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(babyApp.gewichtDaten, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gewichtsdaten.json';
    a.click();
    URL.revokeObjectURL(url);
  });

  gewichtImportierenInput.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      const daten = JSON.parse(await file.text());
      babyApp.gewichtDaten = daten;
      gewichtEintraege.innerHTML = '';

      Object.entries(daten).forEach(([datum, gewicht]) => {
        const container = document.createElement('div');
        container.className = 'gewicht-eintrag';
        container.innerHTML = `
          <label>Datum:</label>
          <input type="date" value="${datum}">
          <label> Gewicht (g): </label>
          <input type="number" min="0" value="${gewicht}">
        `;
        gewichtEintraege.appendChild(container);
      });

      if (babyApp.bilderAnzeigen) babyApp.bilderAnzeigen(babyApp.filesWithDate);
      if (babyApp.zeigeTimeline) babyApp.zeigeTimeline();
    } catch (e) {
      alert('Fehler beim Laden der Datei.');
      console.error(e);
    }
  });

  babyApp.zeigeTimeline = function () {
    const timeline = document.getElementById('timeline');
    if (!timeline) return;
    timeline.innerHTML = '';

    const daten = Object.entries(babyApp.gewichtDaten)
      .sort((a, b) => new Date(a[0]) - new Date(b[0]));

    daten.forEach(([datum, gewicht], index) => {
      const eintrag = document.createElement('div');
      eintrag.textContent = `${babyApp.formatDatum(new Date(datum))} — ${gewicht} g${index === 0 ? ' — Geburt' : ''}`;
      timeline.appendChild(eintrag);
    });

    // Diagramm aktualisieren
    const canvas = document.getElementById('gewicht-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const labels = daten.map(([datum]) => babyApp.formatDatum(new Date(datum)));
    const werte = daten.map(([, g]) => g);

    if (babyApp.gewichtChart) babyApp.gewichtChart.destroy();

    babyApp.gewichtChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Gewicht (g)',
          data: werte,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.3,
          pointRadius: 5
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function (ctx) {
  const dateKey = babyApp.gewichtChart.data.labels[ctx.dataIndex];
  const gewicht = ctx.parsed.y;

  const imageContainer = document.getElementById('hover-image-preview');
  if (imageContainer) {
    imageContainer.innerHTML = ''; // Clear previous image

const bilderAmTag = (babyApp.filesWithDate || []).filter(f => {
	const d = f.date;
	return d && babyApp.formatDatum(d) === dateKey;
});

const matchingImage = bilderAmTag.length > 0
  ? bilderAmTag[Math.floor(Math.random() * bilderAmTag.length)]
  : null;


    if (matchingImage) {
      const img = document.createElement('img');
      img.src = URL.createObjectURL(matchingImage.file);
      img.style.maxWidth = '150px';
      img.style.border = '1px solid #ccc';
      img.style.borderRadius = '5px';
      img.style.marginTop = '0.5em';
      imageContainer.appendChild(img);
    }
  }

  return `${gewicht} g`;
}

            }
          }
        },
        scales: {
          y: { title: { display: true, text: 'Gramm' } },
          x: { title: { display: true, text: 'Datum' } }
        }
      }
    });
  };
});
