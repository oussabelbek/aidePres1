// background.js

// Lorsqu’on clique sur l’icône de l’extension,
// on injecte contentScript.js dans l’onglet actif
browser.browserAction.onClicked.addListener((tab) => {
  browser.tabs.executeScript(tab.id, {
    file: "contentScript.js"
  });
});
