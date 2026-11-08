import { test, expect } from '@playwright/test'

const API = 'http://localhost:3001'

// Avant chaque test : le site s'affiche en français
test.beforeEach(async ({ context }) => {
  await context.addCookies([
    { name: 'lang', value: 'fr', url: 'http://localhost:3000' },
  ])
})

test('la fiche affiche le Pokémon et un inconnu renvoie 404', async ({
  page,
}) => {
  await page.goto('/pokemon/pikachu')
  await expect(
    page.getByRole('heading', { level: 1, name: /pikachu/i }),
  ).toBeVisible()
  await expect(page.getByRole('img', { name: 'pikachu' })).toBeVisible()

  // Pokémon inexistant : vrai code HTTP 404
  const reponse = await page.goto('/pokemon/nimportequoi')
  expect(reponse?.status()).toBe(404)
})

test('le bouton J aime est traduit dans les 4 langues', async ({
  page,
  context,
}) => {
  // Pour chaque langue : [code, texte attendu du bouton]
  const langues = [
    ['fr', "J'aime ce Pokémon"],
    ['en', 'Like this Pokémon'],
    ['es', 'Me gusta este Pokémon'],
    ['de', 'Gefällt mir'],
  ]

  for (let i = 0; i < langues.length; i++) {
    await context.addCookies([
      { name: 'lang', value: langues[i][0], url: 'http://localhost:3000' },
    ])
    await page.goto('/pokemon/pikachu')
    await expect(
      page.getByRole('button', { name: langues[i][1] }),
    ).toBeVisible()
  }
})

test('un like est enregistré et persiste après rechargement', async ({
  page,
  request,
}) => {
  // Total avant le test (pas de route de suppression : on compare avant/après)
  const avant = await request.get(API + '/likes/pikachu')
  const total = (await avant.json()).total

  await page.goto('/pokemon/pikachu')
  await page.waitForLoadState('networkidle')

  await page.getByRole('button', { name: "J'aime ce Pokémon" }).click()
  await expect(page.getByTestId('likes')).toHaveText(String(total + 1))

  // Après rechargement, le total vient de la base : il est conservé
  await page.reload()
  await expect(page.getByTestId('likes')).toHaveText(String(total + 1))
})
