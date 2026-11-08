import fs from 'node:fs'
import process from 'node:process'

// Les deux rapports à lire : [nom, fichier]
const parties = [
  ['Frontend', 'coverage/coverage-summary.json'],
  ['Backend', 'backend/coverage/coverage-summary.json'],
]

let totalLignes = 0
let lignesCouvertes = 0
let tableau = '| Partie | Lignes couvertes | Taux |\n|---|---|---|\n'

for (const [nom, fichier] of parties) {
  if (!fs.existsSync(fichier)) {
    throw new Error('Rapport absent : ' + fichier)
  }
  const donnees = JSON.parse(fs.readFileSync(fichier, 'utf8'))
  const lignes = donnees.total.lines // { total, covered, pct }
  totalLignes += lignes.total
  lignesCouvertes += lignes.covered
  tableau +=
    '| ' +
    nom +
    ' | ' +
    lignes.covered +
    ' / ' +
    lignes.total +
    ' | ' +
    lignes.pct +
    '% |\n'
}

// Taux global arrondi (0 si aucune ligne)
let pourcentage = 0
if (totalLignes > 0) {
  pourcentage = Math.round((lignesCouvertes * 100) / totalLignes)
}
tableau +=
  '| **Total** | ' +
  lignesCouvertes +
  ' / ' +
  totalLignes +
  ' | **' +
  pourcentage +
  '%** |\n'

process.stdout.write(tableau)

// Dans GitHub Actions, ce texte s'affiche sur la page du run (c'est le rapport)
if (process.env.GITHUB_STEP_SUMMARY) {
  fs.appendFileSync(
    process.env.GITHUB_STEP_SUMMARY,
    '## Couverture des tests\n\n' + tableau,
  )
}

// Couleur du badge : vert (80 et plus), jaune (60 et plus), rouge sinon
let couleur = '#e05d44'
if (pourcentage >= 80) {
  couleur = '#4c1'
} else if (pourcentage >= 60) {
  couleur = '#dfb317'
}

const texte = pourcentage + '%'
const svg =
  '<svg xmlns="http://www.w3.org/2000/svg" width="110" height="20" role="img" aria-label="coverage: ' +
  texte +
  '">' +
  '<rect width="62" height="20" fill="#555"/>' +
  '<rect x="62" width="48" height="20" fill="' +
  couleur +
  '"/>' +
  '<g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,sans-serif" font-size="11">' +
  '<text x="31" y="14">coverage</text>' +
  '<text x="86" y="14">' +
  texte +
  '</text></g></svg>'
fs.writeFileSync('coverage-badge.svg', svg)
