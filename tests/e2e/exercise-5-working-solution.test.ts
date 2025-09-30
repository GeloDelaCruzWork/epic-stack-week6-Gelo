import { test, expect } from '#tests/playwright-utils'

/**
 * Working solution for Exercise 5: Intercept Network Requests
 *
 * React Router v7 uses a special format for data responses when using fetcher.load().
 * The response needs to be in a specific array format with metadata.
 */
test.describe('Exercise 5: API Search Mocking - Working Solution', () => {
	test('successfully mock search API responses', async ({ page, login }) => {
		await login()

		// Intercept the search API call
		await page.route('**/api/search.data**', async (route) => {
			// React Router v7 expects this specific format for data routes
			// Format: [metadata, routeId, data]
			const mockResponse = [
				{ _1: 2 },
				'routes/api.search',
				{
					results: [
						{
							id: 'mock-note-1',
							title: 'Important Meeting Notes',
							type: 'note',
							description: 'Discussion about Q4 planning and budget allocation',
						},
						{
							id: 'mock-user-1',
							title: 'John Doe',
							type: 'user',
							description: '@johndoe',
						},
						{
							id: 'mock-note-2',
							title: 'Project Requirements',
							type: 'note',
							description: 'Technical specifications for the new feature',
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

		// Navigate to search page
		await page.goto('/search')

		// Enter search query
		const searchInput = page.getByTestId('search-input')
		await expect(searchInput).toBeVisible()
		await searchInput.fill('test query')

		// Click search button
		await page.getByTestId('search-button').click()

		// Wait for and verify results
		await page.waitForSelector('[data-testid="search-results"]', {
			timeout: 5000,
		})

		const results = page.getByTestId('search-result')
		await expect(results).toHaveCount(3)

		// Verify the content of mocked results
		await expect(results.nth(0)).toContainText('Important Meeting Notes')
		await expect(results.nth(0)).toContainText('Discussion about Q4 planning')

		await expect(results.nth(1)).toContainText('John Doe')
		await expect(results.nth(1)).toContainText('@johndoe')

		await expect(results.nth(2)).toContainText('Project Requirements')
		await expect(results.nth(2)).toContainText('Technical specifications')

		// Verify result count display
		await expect(page.locator('text=Search Results (3)')).toBeVisible()
	})

	test('handle empty search results', async ({ page, login }) => {
		await login()

		// Mock empty results
		await page.route('**/api/search.data**', async (route) => {
			const emptyResponse = [{ _1: 2 }, 'routes/api.search', { results: [] }]

			await route.fulfill({
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

		// Perform search
		await page.getByTestId('search-input').fill('nonexistent')
		await page.getByTestId('search-button').click()

		// Wait for response to process
		await page.waitForTimeout(1000)

		// Verify "No results found" message appears
		await expect(page.locator('text=No results found')).toBeVisible()
	})

	test('search with Enter key', async ({ page, login }) => {
		await login()

		let searchCount = 0

		// Count how many times the API is called
		await page.route('**/api/search.data**', async (route) => {
			searchCount++

			const response = [
				{ _1: 2 },
				'routes/api.search',
				{
					results: [
						{
							id: `result-${searchCount}`,
							title: `Search ${searchCount} Result`,
							type: 'note',
							description: `This is search number ${searchCount}`,
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
				body: JSON.stringify(response),
			})
		})

		await page.goto('/search')

		const searchInput = page.getByTestId('search-input')

		// First search with Enter key
		await searchInput.fill('first search')
		await searchInput.press('Enter')

		// Wait for results
		await page.waitForSelector('[data-testid="search-results"]', {
			timeout: 5000,
		})
		await expect(page.getByTestId('search-result')).toHaveCount(1)
		await expect(page.getByTestId('search-result').first()).toContainText(
			'Search 1 Result',
		)

		// Second search with button click
		await searchInput.clear()
		await searchInput.fill('second search')
		await page.getByTestId('search-button').click()

		// Wait for new results
		await page.waitForTimeout(500)
		await expect(page.getByTestId('search-result').first()).toContainText(
			'Search 2 Result',
		)

		// Verify both searches were made
		expect(searchCount).toBe(2)
	})
})

/**
 * Notes on React Router v7 data format:
 *
 * When using fetcher.load(), React Router v7 expects responses in this format:
 * - Array with 3 elements: [metadata, routeId, data]
 * - metadata: Usually {"_1":2} for simple responses
 * - routeId: The route handling the request (e.g., "routes/api.search")
 * - data: The actual response data
 *
 * Headers must include:
 * - 'content-type': 'text/x-script; charset=utf-8'
 * - 'x-remix-response': 'yes'
 */
