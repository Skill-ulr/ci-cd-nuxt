import fs from 'node:fs'
import process from 'node:process'

// Les deux dossiers de traductions à vérifier
const dossiers = ['app/locales', 'backend/src/locales']
// L'anglais sert de référence, on compare les 3 autres langues
const autres = ['fr', 'es', 'de']
let erreurs = 0

// Affiche une erreur et la compte
function signaler(message) {
  process.stdout.write('ERREUR : ' + message + '\n')
  erreurs++
}

// Lit un fichier JSON ; retourne null s'il est absent ou invalide
function lire(chemin) {
  if (!fs.existsSync(chemin)) {
    signaler('fichier absent : ' + chemin)
    return null
  }
  try {
    return JSON.parse(fs.readFileSync(chemin, 'utf8'))
  } catch {
    signaler('JSON invalide : ' + chemin)
    return null
  }
}

for (const dossier of dossiers) {
  const reference = lire(dossier + '/en.json')
  if (reference === null) continue // sans référence, on ne peut pas comparer

  for (const langue of autres) {
    const chemin = dossier + '/' + langue + '.json'
    const traduction = lire(chemin)
    if (traduction === null) continue

    // Clés de l'anglais : doivent exister dans la langue et ne pas être vides
    for (const cle of Object.keys(reference)) {
      if (!(cle in traduction)) {
        signaler('clé manquante "' + cle + '" dans ' + chemin)
      } else if (String(traduction[cle]).trim() === '') {
        signaler('texte vide pour "' + cle + '" dans ' + chemin)
      }
    }
    // Clés présentes dans la langue mais pas en anglais
    for (const cle of Object.keys(traduction)) {
      if (!(cle in reference)) {
        signaler('clé en trop "' + cle + '" dans ' + chemin)
      }
    }
  }
}

if (erreurs > 0) {
  process.exitCode = 1 // fait échouer la CI
} else {
  process.stdout.write('OK : toutes les traductions sont complètes\n')
}
