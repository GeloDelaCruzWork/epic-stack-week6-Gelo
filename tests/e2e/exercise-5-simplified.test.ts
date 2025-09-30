import { test, expect } from '#tests/playwright-utils'

// Simplified working solution for Exercise 5
test.describe('Exercise 5: Search API Mocking - Simplified', () => {
	test('mock search API with correct React Router v7 format', async ({
		page,
		login,
	}) => {
		await login()

		// Intercept the API call
		await page.route('**/api/search.data**', (route) => {
			// React Router v7 uses a special array-based JSON format
			// This is a simplified version that works
			const mockResponse = [
				{ _1: 2 },
				'routes/api.search',
				{
					results: [
						{
							id: 'mock-1',
							title: 'Mocked Note Result',
							type: 'note',
							description: 'This is a mocked note from the test',
						},
						{
							id: 'mock-2',
							title: 'Mocked User',
							type: 'user',
							description: '@mockeduser',
						},
					],
				},
			]

			route.fulfill({
				status: 200,
				contentType: 'text/x-script; charset=utf-8',
				headers: {
					'content-type': 'text/x-script; charset=utf-8',
					'x-remix-response': 'yes',
				},
				body: JSON.stringify(mockResponse),
			})
		})

		// Navigate to the search page
		await page.goto('/search')

		// Perform search
		const searchInput = page.getByTestId('search-input')
		await searchInput.fill('test query')
		await page.getByTestId('search-button').click()

		// Wait for results to appear
		await page.waitForSelector('[data-testid="search-results"]', {
			state: 'visible',
			timeout: 10000,
		})

		// Verify the mocked results are displayed
		const results = page.getByTestId('search-result')
		await expect(results).toHaveCount(2)

		// Verify first result
		await expect(results.nth(0)).toContainText('Mocked Note Result')
		await expect(results.nth(0)).toContainText(
			'This is a mocked note from the test',
		)

		// Verify second result
		await expect(results.nth(1)).toContainText('Mocked User')
		await expect(results.nth(1)).toContainText('@mockeduser')
	})

	test('mock empty search results', async ({ page, login }) => {
		await login()

		await page.route('**/api/search.data**', (route) => {
			const emptyResponse = [{ _1: 2 }, 'routes/api.search', { results: [] }]

			route.fulfill({
				status: 200,
				contentType: 'text/x-script; charset=utf-8',
				headers: {
					'content-type': 'text/x-script; charset=utf-8',
					'x-remix-response': 'yes',
				},
				body: JSON.stringify(emptyResponse),
			})
		})

		await page.goto('/search')

		const searchInput = page.getByTestId('search-input')
		await searchInput.fill('no results')
		await page.getByTestId('search-button').click()

		// Wait for the search to complete
		await page.waitForTimeout(1000)

		// Check for the "No results found" message
		await expect(page.locator('text=No results found')).toBeVisible()
	})
})
