import { test, expect } from '@playwright/test'

test.describe('Authentification', () => {
  test('affiche le formulaire de connexion', async ({ page }) => {
    await page.goto('/login')
    
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.getByRole('button', { name: /connexion/i })).toBeVisible()
  })

  test('affiche un message d\'erreur avec des identifiants invalides', async ({ page }) => {
    await page.goto('/login')
    
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')
    
    await expect(page.locator('text=/erreur|invalide/i')).toBeVisible()
  })

  test('redirige vers le lien d\'inscription', async ({ page }) => {
    await page.goto('/login')
    
    const registerLink = page.getByRole('link', { name: /inscription|créer un compte/i })
    await expect(registerLink).toBeVisible()
    
    await registerLink.click()
    await expect(page).toHaveURL(/\/register/)
  })
})

test.describe('Page d\'accueil', () => {
  test('charge correctement', async ({ page }) => {
    await page.goto('/')
    
    await expect(page).toHaveTitle(/gemou2/i)
  })
})

