// baby-utils.js
window.babyApp = window.babyApp || {};

babyApp.formatDatum = function (d) {
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
};

babyApp.sortiereNachDatum = function (arr) {
  return arr.sort((a, b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;
    return a.date - b.date;
  });
};
