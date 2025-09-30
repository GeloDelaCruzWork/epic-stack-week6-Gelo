import { test, expect } from '#tests/playwright-utils'

test.describe('Search Debug', () => {
	test('debug search functionality', async ({ page, login }) => {
		await login()

		// Log all network requests to see what's happening
		page.on('request', (request) => {
			if (request.url().includes('search')) {
				console.log('>> Request:', request.method(), request.url())
			}
		})

		page.on('response', (response) => {
			if (response.url().includes('search')) {
				console.log('<< Response:', response.status(), response.url())
			}
		})

		// Mock the API
		await page.route('**/api/search**', async (route) => {
			console.log('Intercepted:', route.request().url())
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

			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify(mockResponse),
			})
		})

		// Navigate to search page
		await page.goto('/search')
		await page.waitForLoadState('networkidle')

		// Take a screenshot to see the page
		await page.screenshot({ path: 'search-page.png', fullPage: true })

		// Check if search input exists
		const searchInput = page.getByTestId('search-input')
		await expect(searchInput).toBeVisible()
		console.log('Search input found')

		// Type and search
		await searchInput.fill('test query')
		await page.getByTestId('search-button').click()

		// Wait a bit for any requests
		await page.waitForTimeout(2000)

		// Take another screenshot
		await page.screenshot({ path: 'search-after-click.png', fullPage: true })

		// Check what's on the page
		const content = await page.content()
		if (content.includes('search-results')) {
			console.log('Found search-results element')
		} else {
			console.log('No search-results element found')
		}

		// Check if the mock was called
		const results = await page.locator('[data-testid="search-results"]').count()
		console.log('Search results elements found:', results)
	})
})
