(function() {
  'use strict';

  // --- Utils de normalisation (casse + accents) ---
  function normalize(txt) {
    return txt
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase()
      .trim();
  }

  // --- Fonctions d’extraction par widgetTitle ---
  function extractWidgetText(widgetTitle) {
    const normTitle = normalize(widgetTitle);
    const widget = Array.from(
      document.querySelectorAll('div.widget-med, div.widget')
    ).find(w => {
      const titleEl = w.querySelector('.widget__title--txt');
      return titleEl && normalize(titleEl.textContent) === normTitle;
    });
    if (!widget) return '';

    const blocs = Array.from(
      widget.querySelectorAll(
        '.dossier__fiche__observation, .ficobsresume, .frmresume, .transCibleResume'
      )
    );
    if (blocs.length === 0) {
      return Array.from(
        widget.querySelectorAll('[ng-bind-html*="fiche.observation"]')
      )
      .map(el => el.innerText.trim())
      .join('\n\n');
    }

    return blocs
      .map(el => el.innerText.trim())
      .filter(t => t)
      .join('\n\n');
  }

  // --- Extraction principale ---
  function extractAndDownload() {
    const nomPrenom = document
      .getElementById('BandeauFormBean.PATI_TITLE')
      ?.value.trim() || '';

    const dobEl = document.getElementById('BandeauFormBean.pati_ageDiv');
    const dateNaissance = dobEl
      ? dobEl.innerText.split(' ')[0].trim()
      : '';

    const admEl = document.getElementById('BandeauFormBean.SEJO_DAT_DEB_LONG_2Div');
    const dateAdmission = admEl
      ? admEl.innerText.trim()
      : '';

    const obsEntree     = extractWidgetText('OBSERVATION ENTREE');
    const obsSuivi      = extractWidgetText('OBSERVATION SUIVI');
    const transmissions = extractWidgetText('TRANSMISSIONS CIBLEES');

    const content =
`Nom et prénom       : ${nomPrenom}
Date de naissance   : ${dateNaissance}
Date d’admission     : ${dateAdmission}

Observation d'entrée :
${obsEntree || '[Aucune donnée]'}

Observation de suivi :
${obsSuivi || '[Aucune donnée]'}

Transmissions ciblées :
${transmissions || '[Aucune donnée]'}`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'info_sections_patient.txt';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  // --- Création du bouton d’extraction ---
  const btn = document.createElement('button');
  btn.textContent = 'Extraire dossier patient';
  Object.assign(btn.style, {
    position: 'fixed',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: '10000',
    padding: '10px 15px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'none' // masqué tant que le widget n'est pas prêt
  });
  btn.addEventListener('click', extractAndDownload);
  document.body.appendChild(btn);

  // --- Polling jusqu’à disponibilité du widget "OBSERVATION ENTREE" ---
  let tenter = 0, maxTenter = 20;
  const timer = setInterval(() => {
    tenter++;
    const present = Array.from(
      document.querySelectorAll('.widget__title--txt')
    ).some(el => normalize(el.textContent) === 'OBSERVATION ENTREE');
    if (present || tenter >= maxTenter) {
      clearInterval(timer);
      // Affiche le bouton pour permettre le déclenchement manuel
      btn.style.display = 'block';
    }
  }, 500);

})();
