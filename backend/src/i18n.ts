import en from './locales/en.json' with { type: 'json' }
import fr from './locales/fr.json' with { type: 'json' }
import es from './locales/es.json' with { type: 'json' }
import de from './locales/de.json' with { type: 'json' }

export type Langue = 'en' | 'fr' | 'es' | 'de'
export type Messages = typeof en

const LANGUES: Langue[] = ['en', 'fr', 'es', 'de']

// Si une clé manque dans un fichier de langue, TypeScript signale l'erreur ici
const traductions: Record<Langue, Messages> = { en, fr, es, de }

// Lit l'en-tête Accept-Language (ex : "fr-FR,fr;q=0.9") et choisit la langue
export function choisirLangue(entete: string | undefined): Langue {
  if (!entete) {
    return 'en'
  }

  // On garde les 2 premières lettres : "fr-FR" devient "fr"
  const code = entete.trim().slice(0, 2).toLowerCase()

  for (let i = 0; i < LANGUES.length; i++) {
    const langue = LANGUES[i]
    if (langue === code) {
      return langue
    }
  }

  // Langue inconnue : anglais par défaut
  return 'en'
}

// Retourne tous les messages de la langue choisie
export function messages(langue: Langue): Messages {
  return traductions[langue]
}
