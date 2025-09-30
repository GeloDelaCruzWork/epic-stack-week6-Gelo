import { test, expect } from '#tests/playwright-utils'

test('debug response interception', async ({ page, login }) => {
	await login()

	// Capture what the client actually receives
	await page.addInitScript(() => {
		const originalFetch = window.fetch
		window.fetch = async (...args) => {
			const response = await originalFetch(...args)
			const url = typeof args[0] === 'string' ? args[0] : args[0].url

			if (url.includes('api/search')) {
				const clonedResponse = response.clone()
				const text = await clonedResponse.text()
				console.log('Fetch intercepted:', {
					url,
					status: response.status,
					headers: Object.fromEntries(response.headers.entries()),
					bodyPreview: text.substring(0, 200),
				})
			}

			return response
		}
	})

	// Set up console logging
	page.on('console', (msg) => {
		if (msg.text().includes('Fetch intercepted')) {
			console.log(msg.text())
		}
	})

	// Try different response formats
	await page.route('**/api/search.data**', async (route) => {
		console.log('Route intercepted:', route.request().url())

		// Try the simple format first
		const simpleResponse = {
			results: [
				{
					id: 'test-1',
					title: 'Test Result',
					type: 'note',
					description: 'Test description',
				},
			],
		}

		// Log what we're sending
		console.log('Sending response:', JSON.stringify(simpleResponse))

		await route.fulfill({
			status: 200,
			contentType: 'application/json',
			body: JSON.stringify(simpleResponse),
		})
	})

	await page.goto('/search')

	// Perform search
	await page.getByTestId('search-input').fill('test')
	await page.getByTestId('search-button').click()

	// Wait a bit
	await page.waitForTimeout(2000)

	// Check what's visible
	const bodyText = await page.locator('body').innerText()
	console.log('\nPage text after search:')
	console.log(bodyText.split('\n').slice(0, 20).join('\n'))

	// Check if error message is present
	if (bodyText.includes('Unable to decode')) {
		console.log('\n❌ Found "Unable to decode" error - wrong response format')
	}

	// Check for search results
	const resultsVisible = await page
		.locator('[data-testid="search-results"]')
		.isVisible()
		.catch(() => false)
	console.log('\n✓ Search results visible:', resultsVisible)
})
