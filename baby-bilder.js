// baby-bilder.js
window.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('fileInput');
  const preview = document.getElementById('preview');

  babyApp.filesWithDate = [];

  const MAX_FILE_SIZE = 10 * 1024 * 1024;
  const MAX_TOTAL_FILES = 500;

  input.addEventListener('change', async (event) => {
    const files = Array.from(event.target.files)
      .filter(f => f.type.startsWith('image/') && f.size <= MAX_FILE_SIZE)
      .slice(0, MAX_TOTAL_FILES);

    if (files.length === 0) {
      alert('Bitte gültige Bilddateien auswählen.');
      return;
    }

    const filesWithDate = await Promise.all(files.map(async file => {
      let date = null;
      try {
        const exifData = await exifr.parse(file);
        date = exifData?.DateTimeOriginal || exifData?.CreateDate || null;
      } catch (e) {
        console.warn('EXIF konnte nicht gelesen werden:', file.name);
      }
      return { file, date: date ? new Date(date) : null };
    }));

    babyApp.filesWithDate = babyApp.sortiereNachDatum(filesWithDate);

    // Initiales Gewicht-Formular anzeigen
    const formular = document.getElementById('gewicht-formular');
    if (formular) {
      formular.style.display = 'block';
      document.getElementById('gewicht-eintraege').innerHTML = '';
      if (typeof babyApp.addGewichtEintrag === 'function') {
        babyApp.addGewichtEintrag(babyApp.filesWithDate[0]?.date, true);
      }
    }
  });

  babyApp.bilderAnzeigen = function (filesWithDate) {
    preview.innerHTML = '';

    filesWithDate.forEach(({ file, date }) => {
      const url = URL.createObjectURL(file);
      const container = document.createElement('div');
      container.className = 'image-container';

      const img = document.createElement('img');
      img.src = url;
      img.title = file.name;

      const caption = document.createElement('small');
      const dateStr = date ? babyApp.formatDatum(date) : 'Kein Datum';
      const gewicht = babyApp.gewichtDaten?.[date?.toISOString().split('T')[0]];
      caption.textContent = gewicht ? `${dateStr} — Gewicht: ${gewicht}g` : dateStr;

      container.appendChild(img);
      container.appendChild(caption);
      preview.appendChild(container);
    });
  };
});
