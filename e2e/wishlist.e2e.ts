import { test, expect } from '@playwright/test'

// Adresse du backend, utilisée pour vider la wishlist avant le test
const API = 'http://localhost:3001'

// Avant chaque test : on vide la wishlist du backend pour repartir de zéro
test.beforeEach(async ({ request }) => {
  const reponse = await request.get(API + '/wishlist')
  const liste = await reponse.json()

  // Boucle classique : on supprime chaque Pokémon présent
  for (let i = 0; i < liste.length; i++) {
    await request.delete(API + '/wishlist/' + liste[i].id)
  }
})

test('parcours complet : rechercher, ajouter, recharger, supprimer', async ({
  page,
}) => {
  // 1. Ouvrir l'application et attendre que la page soit prête
  await page.goto('/')
  await page.waitForLoadState('networkidle')

  // 2. Rechercher Pikachu
  await page.getByPlaceholder("Nom d'un Pokémon...").fill('pikachu')
  await page.getByRole('button', { name: 'Rechercher' }).click()
  // /pikachu/i = le texte "pikachu" en majuscules ou en minuscules
  await expect(
    page.getByRole('heading', { level: 2, name: /pikachu/i }),
  ).toBeVisible()

  // 3. Ajouter à la wishlist
  await page.getByRole('button', { name: 'Ajouter à ma wishlist' }).click()
  await expect(page.getByText('Ma wishlist (1/6)')).toBeVisible()

  // 4. Un doublon doit être refusé (message envoyé par le backend)
  await page.getByRole('button', { name: 'Ajouter à ma wishlist' }).click()
  await expect(page.getByText(/déjà dans la wishlist/)).toBeVisible()

  // 5. Recharger la page : Pikachu doit revenir depuis le backend
  await page.reload()
  const wishlist = page.locator('.wishlist')
  await expect(
    wishlist.getByRole('heading', { level: 3, name: /pikachu/i }),
  ).toBeVisible()

  // 6. Supprimer Pikachu : la wishlist redevient vide
  await wishlist.getByRole('button', { name: 'Supprimer' }).click()
  await expect(
    page.getByText('Aucun Pokémon dans ta wishlist pour le moment.'),
  ).toBeVisible()
})
