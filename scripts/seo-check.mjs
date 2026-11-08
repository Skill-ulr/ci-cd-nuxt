import process from 'node:process'

// Pokémon à contrôler (ou ceux donnés en arguments : node scripts/seo-check.mjs mew)
const PAR_DEFAUT = ['pikachu', 'bulbasaur', 'charizard', 'mewtwo']
let pokemons = PAR_DEFAUT
if (process.argv.length > 2) {
  pokemons = process.argv.slice(2)
}

const TAILLE_MINI = 1500 // en dessous, la page ressemble à une coquille vide
let echecs = 0

// Lit une adresse dans les variables d'environnement (erreur si absente)
function adresse(nom) {
  const valeur = process.env[nom]
  if (!valeur) {
    throw new Error('Variable manquante : ' + nom)
  }
  return valeur.replace(/\/$/, '')
}

// Extrait le texte d'une balise (<title>, <h1>), sans les sous-balises
function extraire(html, balise) {
  const motif = new RegExp(
    '<' + balise + '[^>]*>([\\s\\S]*?)</' + balise + '>',
    'i',
  )
  const resultat = html.match(motif)
  if (!resultat) {
    return ''
  }
  return resultat[1].replace(/<[^>]*>/g, '').trim()
}

// Récupère le HTML brut d'une fiche et retourne ses informations
async function lire(source, base, nom) {
  const url = base + '/pokemon/' + nom
  const reponse = await fetch(url) // pas de JavaScript : HTML brut uniquement
  const html = await reponse.text()
  const infos = {
    source: source,
    nom: nom,
    statut: reponse.status,
    taille: html.length,
    title: extraire(html, 'title'),
    h1: extraire(html, 'h1'),
    problemes: [],
  }

  if (reponse.status !== 200) {
    infos.problemes.push('statut ' + reponse.status + ' au lieu de 200')
  }
  if (html.length < TAILLE_MINI) {
    infos.problemes.push('HTML trop court (coquille vide ?)')
  }
  if (!infos.title.toLowerCase().includes(nom)) {
    infos.problemes.push('title sans le nom du Pokémon')
  }
  if (!infos.h1.toLowerCase().includes(nom)) {
    infos.problemes.push('h1 absent ou sans le nom du Pokémon')
  }
  return infos
}

// Affiche le résultat d'une page
function afficher(infos) {
  let verdict = 'OK    '
  if (infos.problemes.length > 0) {
    verdict = 'ECHEC '
    echecs++
  }
  process.stdout.write(
    verdict +
      infos.source +
      ' ' +
      infos.nom +
      ' | title="' +
      infos.title +
      '" | h1="' +
      infos.h1 +
      '" | ' +
      infos.taille +
      ' caracteres\n',
  )
  for (const probleme of infos.problemes) {
    process.stdout.write('       -> ' + probleme + '\n')
  }
}

async function main() {
  const ssr = adresse('SSR_URL')
  const ssg = adresse('SSG_URL')

  for (const nom of pokemons) {
    const pageSsr = await lire('SSR', ssr, nom)
    const pageSsg = await lire('SSG', ssg, nom)
    afficher(pageSsr)
    afficher(pageSsg)

    // Les deux versions doivent avoir le même titre
    if (pageSsr.title !== pageSsg.title) {
      process.stdout.write('ECHEC ' + nom + ' : title différent SSR / SSG\n')
      echecs++
    }
  }

  if (echecs > 0) {
    process.exitCode = 1
  } else {
    process.stdout.write('SEO OK : SSR et SSG renvoient un vrai HTML\n')
  }
}

main().catch((erreur) => {
  process.stdout.write('ERREUR : ' + erreur.message + '\n')
  process.exitCode = 1
})
