import { test, expect } from '#tests/playwright-utils'

test('test real search to see response format', async ({ page, login }) => {
	await login()

	// Monitor the actual response format
	page.on('response', async (response) => {
		if (response.url().includes('api/search.data')) {
			console.log('Response URL:', response.url())
			console.log('Response status:', response.status())
			console.log('Response headers:', response.headers())

			try {
				const body = await response.text()
				console.log('Response body (first 500 chars):', body.substring(0, 500))
				console.log('Full response length:', body.length)
			} catch (e) {
				console.log('Could not read response body:', e)
			}
		}
	})

	await page.goto('/search')

	// Do a real search (no mocking)
	await page.getByTestId('search-input').fill('test')
	await page.getByTestId('search-button').click()

	// Wait a bit for the response
	await page.waitForTimeout(2000)

	// Check if results appear
	const hasResults = await page
		.locator('[data-testid="search-results"]')
		.count()
	console.log('Search results container found:', hasResults > 0)

	if (hasResults > 0) {
		const resultCount = await page.getByTestId('search-result').count()
		console.log('Number of results:', resultCount)
	}
})
