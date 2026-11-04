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

test('refuse un 7e Pokémon (limite de 6)', async ({ page, request }) => {
  // On remplit la wishlist avec 6 Pokémon directement via l'API (plus rapide que par l'interface)
  for (let i = 1; i <= 6; i++) {
    await request.post(API + '/wishlist', {
      data: { id: i, name: 'pokemon' + i, image: null },
    })
  }

  // On ouvre la page : elle charge la wishlist pleine depuis le backend
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  await expect(page.getByText('Ma wishlist (6/6)')).toBeVisible()

  // On essaie d'ajouter un 7e Pokémon (Pikachu, id 25, absent de la liste)
  await page.getByPlaceholder("Nom d'un Pokémon...").fill('pikachu')
  await page.getByRole('button', { name: 'Rechercher' }).click()
  await page.getByRole('button', { name: 'Ajouter à ma wishlist' }).click()

  // Le message d'erreur envoyé par le backend doit s'afficher
  await expect(page.getByText('Wishlist pleine (6 maximum)')).toBeVisible()
})
