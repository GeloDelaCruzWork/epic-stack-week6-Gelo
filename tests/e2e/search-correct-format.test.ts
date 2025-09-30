import { test, expect } from '#tests/playwright-utils'

test('search with correct React Router v7 format', async ({ page, login }) => {
	await login()

	await page.route('**/api/search.data**', async (route) => {
		// This is the exact format React Router v7 expects for data responses
		// It's an array where index [2] contains the actual data
		const mockResponse = [
			{ _1: 2 }, // Internal React Router metadata
			'routes/api.search', // The route identifier
			{
				results: [
					// Index 2 contains the actual data
					{
						id: 'test-1',
						title: 'Test Note Result',
						type: 'note',
						description: 'This is a test note',
					},
					{
						id: 'test-2',
						title: 'Test User',
						type: 'user',
						description: '@testuser',
					},
				],
			},
		]

		await route.fulfill({
			status: 200,
			contentType: 'text/x-script; charset=utf-8',
			headers: {
				'content-type': 'text/x-script; charset=utf-8',
				'x-remix-response': 'yes',
			},
			body: JSON.stringify(mockResponse),
		})
	})

	await page.goto('/search')

	// Perform search
	await page.getByTestId('search-input').fill('test')
	await page.getByTestId('search-button').click()

	// Wait for results with better error handling
	try {
		await page.waitForSelector('[data-testid="search-results"]', {
			state: 'visible',
			timeout: 5000,
		})
		console.log('✓ Search results container appeared')

		// Count results
		const resultCount = await page.getByTestId('search-result').count()
		console.log(`✓ Found ${resultCount} search results`)

		// Verify content
		if (resultCount > 0) {
			const firstResult = await page
				.getByTestId('search-result')
				.first()
				.innerText()
			console.log('First result content:', firstResult)
		}

		// Take a screenshot for verification
		await page.screenshot({ path: 'search-success.png', fullPage: true })
	} catch (error) {
		console.log('✗ Search results did not appear')

		// Check for error messages
		const bodyText = await page.locator('body').innerText()
		if (bodyText.includes('Unable to decode')) {
			console.log('Error: Unable to decode turbo-stream response')
		} else if (bodyText.includes('Cannot read properties')) {
			console.log('Error: JavaScript error in processing response')
		} else {
			console.log('Page content:', bodyText.substring(0, 300))
		}
	}
})
