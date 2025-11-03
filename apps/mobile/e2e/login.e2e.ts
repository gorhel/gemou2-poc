import { device, element, by, expect as detoxExpect } from 'detox'

describe('Authentification Mobile', () => {
  beforeAll(async () => {
    await device.launchApp()
  })

  beforeEach(async () => {
    await device.reloadReactNative()
  })

  it('devrait afficher l\'écran de connexion', async () => {
    await detoxExpect(element(by.id('login-screen'))).toBeVisible()
    await detoxExpect(element(by.id('email-input'))).toBeVisible()
    await detoxExpect(element(by.id('password-input'))).toBeVisible()
    await detoxExpect(element(by.id('login-button'))).toBeVisible()
  })

  it('devrait permettre de saisir un email', async () => {
    await element(by.id('email-input')).typeText('test@example.com')
    await detoxExpect(element(by.id('email-input'))).toHaveText('test@example.com')
  })

  it('devrait afficher une erreur avec des identifiants invalides', async () => {
    await element(by.id('email-input')).typeText('test@example.com')
    await element(by.id('password-input')).typeText('wrongpassword')
    await element(by.id('login-button')).tap()
    
    await detoxExpect(element(by.text(/erreur|invalide/i))).toBeVisible()
  })

  it('devrait naviguer vers l\'écran d\'inscription', async () => {
    await element(by.id('register-link')).tap()
    await detoxExpect(element(by.id('register-screen'))).toBeVisible()
  })
})

describe('Navigation Mobile', () => {
  beforeAll(async () => {
    await device.launchApp()
  })

  it('devrait charger l\'application', async () => {
    await detoxExpect(element(by.id('app-root'))).toBeVisible()
  })

  it('devrait afficher les onglets principaux', async () => {
    await detoxExpect(element(by.id('tab-home'))).toBeVisible()
    await detoxExpect(element(by.id('tab-events'))).toBeVisible()
    await detoxExpect(element(by.id('tab-profile'))).toBeVisible()
  })
})

