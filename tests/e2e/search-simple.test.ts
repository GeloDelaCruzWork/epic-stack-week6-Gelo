import { test, expect } from '#tests/playwright-utils'

test('simple search test', async ({ page, login }) => {
	await login()

	// Intercept and log what's happening
	let intercepted = false
	await page.route('**/api/search.data**', (route) => {
		intercepted = true
		console.log('Intercepted URL:', route.request().url())
		const mockResponse = {
			results: [
				{
					id: 'test-1',
					title: 'Test Result',
					type: 'note',
					description: 'This is a test',
				},
			],
		}

		route.fulfill({
			status: 200,
			contentType: 'application/json',
			body: JSON.stringify(mockResponse),
		})
	})

	await page.goto('/search')

	// Fill and submit search
	await page.getByTestId('search-input').fill('test')
	await page.getByTestId('search-button').click()

	// Wait for the request to be intercepted
	await page.waitForTimeout(1000)

	if (!intercepted) {
		console.log('Request was not intercepted!')
	}

	// Check page state
	const pageContent = await page.content()
	console.log(
		'Has search-results?',
		pageContent.includes('data-testid="search-results"'),
	)

	// Try to wait for any element that might appear
	try {
		await page.waitForSelector('[data-testid="search-results"]', {
			timeout: 3000,
		})
		console.log('Found search-results!')
	} catch {
		console.log('No search-results found')

		// Check what's actually on the page
		const visibleText = await page.locator('body').innerText()
		console.log('Page text:', visibleText.substring(0, 500))
	}
})
