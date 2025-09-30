import { test, expect } from '#tests/playwright-utils'

// Exercise 5: Intercept Network Requests - Fixed for actual API format
test.describe('Exercise 5: API Search Mocking', () => {
	test('mock /api/search endpoint', async ({ page, login }) => {
		await login()

		// Intercept the API call - React Router v7 adds .data suffix and uses special format
		await page.route('**/api/search.data**', (route) => {
			// React Router v7 uses a special array-based JSON format
			const mockResponse = [
				{ _1: 2 },
				'routes/api.search',
				{ _3: 4 },
				'data',
				{ _5: 6 },
				'results',
				[7, 11, 15], // Array indices for the results
				{ _8: 8, _9: 9, _10: 10, _12: 13, _14: 14 }, // First result
				'mock-1',
				'Mocked Note Result',
				'This is a mocked note from the test',
				{ _8: 8, _9: 12, _10: 13, _12: 13, _14: 14 }, // Second result
				'mock-2',
				'Mocked User',
				'@mockeduser - Test user account',
				{ _8: 8, _9: 16, _10: 17, _12: 13, _14: 18 }, // Third result
				'mock-3',
				'Another Test Note',
				'Important meeting notes from the test',
				'id',
				'title',
				'type',
				'note',
				'description',
				'user',
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
		await page.waitForLoadState('networkidle')

		// Find the search input and enter a query
		const searchInput = page.getByTestId('search-input')
		await expect(searchInput).toBeVisible()
		await searchInput.fill('test query')

		// Click the search button
		const searchButton = page.getByTestId('search-button')
		await searchButton.click()

		// Wait for results to appear
		await page.waitForSelector('[data-testid="search-results"]', {
			state: 'visible',
			timeout: 10000,
		})

		// Verify the mocked results are displayed
		const results = page.getByTestId('search-result')
		await expect(results).toHaveCount(3)

		// Check first result
		await expect(results.nth(0)).toContainText('Mocked Note Result')
		await expect(results.nth(0)).toContainText(
			'This is a mocked note from the test',
		)
		await expect(results.nth(0)).toContainText('note')

		// Check second result
		await expect(results.nth(1)).toContainText('Mocked User')
		await expect(results.nth(1)).toContainText('@mockeduser')
		await expect(results.nth(1)).toContainText('user')

		// Check third result
		await expect(results.nth(2)).toContainText('Another Test Note')
		await expect(results.nth(2)).toContainText('Important meeting notes')
		await expect(results.nth(2)).toContainText('note')

		// Verify result count
		await expect(page.locator('text=Search Results (3)')).toBeVisible()
	})

	test('handle empty results', async ({ page, login }) => {
		await login()

		await page.route('**/api/search.data**', (route) => {
			const emptyResponse = [
				{ _1: 2 },
				'routes/api.search',
				{ _3: 4 },
				'data',
				{ _5: 6 },
				'results',
				[], // Empty results array
			]

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
		await searchInput.fill('empty search')
		await page.getByTestId('search-button').click()

		// Wait for response
		await page.waitForTimeout(1000)

		// Verify "No results found" message
		await expect(page.locator('text=No results found')).toBeVisible()
	})

	test('verify search with Enter key', async ({ page, login }) => {
		await login()

		await page.route('**/api/search.data**', (route) => {
			const response = [
				{ _1: 2 },
				'routes/api.search',
				{ _3: 4 },
				'data',
				{ _5: 6 },
				'results',
				[7], // Single result
				{ _8: 8, _9: 9, _10: 10, _12: 11, _14: 12 },
				'enter-test',
				'Enter Key Test',
				'Submitted with Enter key',
				'note',
				'id',
				'title',
				'type',
				'description',
			]

			route.fulfill({
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
		await searchInput.fill('enter test')

		// Press Enter instead of clicking button
		await searchInput.press('Enter')

		// Wait for results
		await page.waitForSelector('[data-testid="search-results"]', {
			state: 'visible',
			timeout: 10000,
		})

		const results = page.getByTestId('search-result')
		await expect(results).toHaveCount(1)
		await expect(results.first()).toContainText('Enter Key Test')
		await expect(results.first()).toContainText('Submitted with Enter key')
	})

	test('multiple searches with different results', async ({ page, login }) => {
		await login()

		let searchCount = 0

		await page.route('**/api/search.data**', (route) => {
			searchCount++

			const response =
				searchCount === 1
					? [
							{ _1: 2 },
							'routes/api.search',
							{ _3: 4 },
							'data',
							{ _5: 6 },
							'results',
							[7],
							{ _8: 8, _9: 9, _10: 10, _12: 11, _14: 12 },
							'first-1',
							'First Search Result',
							'Initial search',
							'note',
							'id',
							'title',
							'type',
							'description',
						]
					: [
							{ _1: 2 },
							'routes/api.search',
							{ _3: 4 },
							'data',
							{ _5: 6 },
							'results',
							[7, 11],
							{ _8: 8, _9: 9, _10: 10, _12: 13, _14: 14 },
							'second-1',
							'Second Search - Item 1',
							'Updated results',
							{ _8: 8, _9: 12, _10: 15, _12: 13, _14: 16 },
							'second-2',
							'note',
							'description',
							'Second Search - Item 2',
							'@seconduser',
							'id',
							'title',
							'type',
							'user',
						]

			route.fulfill({
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

		// First search
		const searchInput = page.getByTestId('search-input')
		await searchInput.fill('first')
		await page.getByTestId('search-button').click()

		await page.waitForSelector('[data-testid="search-results"]')
		await expect(page.getByTestId('search-result')).toHaveCount(1)
		await expect(page.getByTestId('search-result').first()).toContainText(
			'First Search Result',
		)

		// Second search
		await searchInput.clear()
		await searchInput.fill('second')
		await page.getByTestId('search-button').click()

		// Wait for new results
		await page.waitForFunction(
			() =>
				document.querySelectorAll('[data-testid="search-result"]').length === 2,
			{ timeout: 5000 },
		)

		const results = page.getByTestId('search-result')
		await expect(results).toHaveCount(2)
		await expect(results.first()).toContainText('Second Search - Item 1')
		await expect(results.nth(1)).toContainText('Second Search - Item 2')

		// Verify both searches were made
		expect(searchCount).toBe(2)
	})
})

// Alternative approach using simple page navigation (for comparison)
test.describe('Alternative: Search Page Navigation', () => {
	test('search using URL parameters', async ({ page, login }) => {
		await login()

		// Mock the search results page
		await page.route('**/search?**', async (route) => {
			if (route.request().method() === 'GET') {
				// Let the normal page load but we can verify the URL
				await route.continue()
			}
		})

		// Navigate directly with search query
		await page.goto('/search')

		const searchInput = page.getByTestId('search-input')
		await searchInput.fill('url test')

		// Track navigation
		const navigationPromise = page.waitForURL('**/search?**')
		await page.getByTestId('search-button').click()

		// This would navigate if it was a regular form
		// But since we're using fetcher.load, it stays on same page
		try {
			await navigationPromise
			console.log('Navigated to search URL')
		} catch {
			console.log('No navigation occurred - using fetcher')
		}
	})
})
