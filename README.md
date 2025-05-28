#aidePres1

Ce dépôt contient une extension Firefox permettant d'extraire certaines
informations d'un dossier patient et de les enregistrer dans un fichier
texte. Un bouton est ajouté à la page lorsque le widget "Observation
entrée" est détecté afin de lancer l'extraction.

Une fois installée, l'extension injecte automatiquement le script sur les
pages visitées. Quand la zone "Observation ENTREE" est repérée, le bouton
**Extraire dossier patient** apparaît. Un clic sur ce bouton télécharge un
fichier texte récapitulant le nom, la date de naissance, la date
d'admission et les observations trouvées.

Pour tester l'extension :
1. Ouvrir `about:debugging#/runtime/this-firefox` dans Firefox.
2. Cliquer sur **Charger un module complémentaire temporaire…**.
3. Sélectionner le fichier `manifest.json` du dépôt.
