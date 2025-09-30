import { test, expect } from '#tests/playwright-utils'

test('working search mock', async ({ page, login }) => {
	await login()

	// Intercept the data request
	await page.route('**/api/search.data**', async (route) => {
		const data = {
			results: [
				{
					id: 'test-1',
					title: 'Test Result',
					type: 'note',
					description: 'This is a test note',
				},
				{
					id: 'test-2',
					title: 'Another Result',
					type: 'user',
					description: '@testuser',
				},
			],
		}

		// Try the format that React Router v7 expects for data responses
		// Based on the error, it seems like it needs a special encoding
		const response = `2:{"results":[{"id":"test-1","title":"Test Result","type":"note","description":"This is a test note"},{"id":"test-2","title":"Another Result","type":"user","description":"@testuser"}]}\n`

		await route.fulfill({
			status: 200,
			contentType: 'text/x-script; charset=utf-8',
			headers: {
				'content-type': 'text/x-script; charset=utf-8',
				'x-react-router-data': 'true',
			},
			body: response,
		})
	})

	await page.goto('/search')
	await page.getByTestId('search-input').fill('test')
	await page.getByTestId('search-button').click()

	// Wait for results
	try {
		await page.waitForSelector('[data-testid="search-results"]', {
			timeout: 5000,
		})
		console.log('✓ Found search-results container')

		const resultCount = await page.getByTestId('search-result').count()
		console.log(`✓ Found ${resultCount} result items`)

		if (resultCount > 0) {
			const firstResult = await page
				.getByTestId('search-result')
				.first()
				.innerText()
			console.log('First result text:', firstResult)
		}
	} catch (e) {
		console.log('✗ Failed to find search results')
		const pageText = await page.locator('body').innerText()
		console.log('Page content:', pageText.substring(0, 200))
	}
})
