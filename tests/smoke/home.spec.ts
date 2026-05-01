import { test, expect } from '@playwright/test'

test('home renders with all major sections and live counter > 0', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', e => errors.push(String(e)))
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })

  await page.goto('/')

  await expect(page.getByRole('heading', { name: /Why this exists/i })).toBeVisible()
  await expect(page.getByRole('heading', { name: /How it works/i })).toBeVisible()
  await expect(page.getByRole('heading', { name: /The token/i })).toBeVisible()
  await expect(page.getByRole('heading', { name: /The cause/i })).toBeVisible()
  await expect(page.getByRole('heading', { name: /Every fee, on the block\./i })).toBeVisible()

  // Hero CTA must be visible and link to pump.fun
  const cta = page.getByRole('link', { name: /Trade \$BREAST on pump\.fun/i })
  await expect(cta).toBeVisible()
  await expect(cta).toHaveAttribute('href', /pump\.fun/)

  // Counter shows a non-zero USD value
  const heroBody = page.locator('header').first()
  await expect(heroBody).toContainText(/\$\d/)

  expect(errors, errors.join('\n')).toEqual([])
})
