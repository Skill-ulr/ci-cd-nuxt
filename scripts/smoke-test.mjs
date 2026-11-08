import process from 'node:process'
import { setTimeout as attendre } from 'node:timers/promises'

// Cible choisie en argument : api, ssr, ssg ou all
const cible = process.argv[2] || 'all'
const TENTATIVES = 5 // nombre d'essais avant de déclarer un échec
const PAUSE = 5000 // pause entre deux essais (5 secondes)

// Lit une adresse dans les variables d'environnement (erreur si absente)
function adresse(nom) {
  const valeur = process.env[nom]
  if (!valeur) {
    throw new Error('Variable manquante : ' + nom)
  }
  return valeur.replace(/\/$/, '') // retire un "/" final éventuel
}

// Construit la liste des vérifications selon la cible
function listeDesVerifications() {
  const verifs = []

  if (cible === 'api' || cible === 'all') {
    const api = adresse('API_BASE_URL')
    verifs.push({ nom: 'API /health', url: api + '/health', statut: 200 })
    verifs.push({ nom: 'API /wishlist', url: api + '/wishlist', statut: 200 })
  }

  if (cible === 'ssr' || cible === 'all') {
    const ssr = adresse('SSR_URL')
    verifs.push({
      nom: 'SSR fiche pikachu',
      url: ssr + '/pokemon/pikachu',
      statut: 200,
      texte: 'pikachu', // le HTML doit déjà contenir le Pokémon
    })
    verifs.push({
      nom: 'SSR page inconnue',
      url: ssr + '/pokemon/nimportequoi',
      statut: 404,
    })
  }

  if (cible === 'ssg' || cible === 'all') {
    const ssg = adresse('SSG_URL')
    verifs.push({ nom: 'SSG accueil', url: ssg + '/', statut: 200 })
    verifs.push({
      nom: 'SSG fiche pikachu',
      url: ssg + '/pokemon/pikachu',
      statut: 200,
      texte: 'pikachu',
    })
  }

  return verifs
}

// Fait une vérification ; retourne '' si OK, sinon la raison de l'échec
async function verifier(verif) {
  try {
    const reponse = await fetch(verif.url)
    if (reponse.status !== verif.statut) {
      return 'statut ' + reponse.status + ' au lieu de ' + verif.statut
    }
    if (verif.texte) {
      const corps = await reponse.text()
      if (!corps.includes(verif.texte)) {
        return 'texte "' + verif.texte + '" absent de la page'
      }
    }
    return ''
  } catch (erreur) {
    return 'requête impossible : ' + erreur.message
  }
}

async function main() {
  const verifs = listeDesVerifications()
  let echecs = 0

  for (const verif of verifs) {
    let raison = ''
    // On réessaie plusieurs fois : un déploiement peut mettre quelques secondes
    for (let essai = 1; essai <= TENTATIVES; essai++) {
      raison = await verifier(verif)
      if (raison === '') {
        break
      }
      if (essai < TENTATIVES) {
        await attendre(PAUSE)
      }
    }

    if (raison === '') {
      process.stdout.write('OK : ' + verif.nom + '\n')
    } else {
      process.stdout.write('ECHEC : ' + verif.nom + ' (' + raison + ')\n')
      echecs++
    }
  }

  if (echecs > 0) {
    process.exitCode = 1 // fait échouer le workflow
  } else {
    process.stdout.write('Tous les smoke tests sont OK\n')
  }
}

main().catch((erreur) => {
  process.stdout.write('ERREUR : ' + erreur.message + '\n')
  process.exitCode = 1
})
