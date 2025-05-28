(() => {
  'use strict';

  const POLL_INTERVAL = 500;
  const MAX_ATTEMPTS  = 20;
  const WIDGET_SEL    = 'div.widget-med, div.widget';
  const TITLE_SEL     = '.widget__title--txt';
  const REQUIRED_WIDGET = 'OBSERVATION ENTREE';

  const normalize = txt =>
    txt
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase()
      .trim();

  const extractWidgetText = title => {
    const target = normalize(title);
    const widget = Array.from(document.querySelectorAll(WIDGET_SEL)).find(w => {
      const titleEl = w.querySelector(TITLE_SEL);
      return titleEl && normalize(titleEl.textContent) === target;
    });
    if (!widget) return '';

    const blocs = widget.querySelectorAll(
      '.dossier__fiche__observation, .ficobsresume, .frmresume, .transCibleResume'
    );
    const sources = blocs.length
      ? blocs
      : widget.querySelectorAll('[ng-bind-html*="fiche.observation"]');

    return Array.from(sources)
      .map(el => el.innerText.trim())
      .filter(Boolean)
      .join('\n\n');
  };

  const extractAndDownload = () => {
    const nomPrenom =
      document.getElementById('BandeauFormBean.PATI_TITLE')?.value.trim() || '';

    const dobEl = document.getElementById('BandeauFormBean.pati_ageDiv');
    const dateNaissance = dobEl ? dobEl.innerText.split(' ')[0].trim() : '';

    const admEl = document.getElementById('BandeauFormBean.SEJO_DAT_DEB_LONG_2Div');
    const dateAdmission = admEl ? admEl.innerText.trim() : '';

    const obsEntree     = extractWidgetText('OBSERVATION ENTREE');
    const obsSuivi      = extractWidgetText('OBSERVATION SUIVI');
    const transmissions = extractWidgetText('TRANSMISSIONS CIBLEES');

    const content = `Nom et prénom       : ${nomPrenom}
Date de naissance   : ${dateNaissance}
Date d’admission    : ${dateAdmission}

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
  };

  const createButton = () => {
    const button = document.createElement('button');
    button.id = 'aidepres-extract';
    button.textContent = 'Extraire dossier patient';
    Object.assign(button.style, {
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
      display: 'none'
    });
    button.addEventListener('click', extractAndDownload);
    document.body.appendChild(button);
    return button;
  };

  const waitForWidget = title =>
    new Promise(resolve => {
      let attempts = 0;
      const timer = setInterval(() => {
        attempts++;
        const found = Array.from(document.querySelectorAll(TITLE_SEL))
          .some(el => normalize(el.textContent) === normalize(title));
        if (found || attempts >= MAX_ATTEMPTS) {
          clearInterval(timer);
          resolve(found);
        }
      }, POLL_INTERVAL);
    });

  document.addEventListener('DOMContentLoaded', async () => {
    const btn = createButton();
    await waitForWidget(REQUIRED_WIDGET);
    btn.style.display = 'block';
  });
})();
