import en from '../locales/en.json'
import fr from '../locales/fr.json'
import es from '../locales/es.json'
import de from '../locales/de.json'

export type Langue = 'en' | 'fr' | 'es' | 'de'
export const LANGUES: Langue[] = ['en', 'fr', 'es', 'de']

const traductions: Record<Langue, Record<string, string>> = { en, fr, es, de }

// Transforme une valeur quelconque (ex : lue dans le cookie) en langue valide
function versLangue(valeur: string | null | undefined): Langue {
  for (let i = 0; i < LANGUES.length; i++) {
    const candidate = LANGUES[i]
    if (candidate !== undefined && candidate === valeur) {
      return candidate
    }
  }
  return 'en'
}

export function useTraduction() {
  // Le cookie "lang" garde la langue entre deux visites (valable 1 an)
  const cookie = useCookie<string>('lang', {
    default: () => 'en',
    maxAge: 60 * 60 * 24 * 365,
  })

  // useState partage la langue entre tous les composants de la page
  const langue = useState<Langue>('langue', () => versLangue(cookie.value))

  // Changer de langue : on met à jour l'état ET le cookie
  function changerLangue(nouvelle: Langue): void {
    langue.value = nouvelle
    cookie.value = nouvelle
  }

  // t('cle') retourne le texte traduit (ou la clé si elle n'existe pas)
  function t(cle: string): string {
    const texte = traductions[langue.value][cle]
    if (texte === undefined) {
      return cle
    }
    return texte
  }

  return { langue, changerLangue, t }
}
