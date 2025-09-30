import { test, expect } from '#tests/playwright-utils'

test('search with turbo-stream format', async ({ page, login }) => {
	await login()

	await page.route('**/api/search.data**', (route) => {
		console.log('Intercepting:', route.request().url())

		// React Router v7 turbo-stream format
		const data = {
			results: [
				{
					id: 'test-1',
					title: 'Test Result',
					type: 'note',
					description: 'This is a test',
				},
			],
		}

		// Create turbo-stream response
		const turboStreamResponse = `<turbo-stream action="update" target="0"><template>window.__reactRouterData=window.__reactRouterData||{};window.__reactRouterData["routes/api.search"]=${JSON.stringify(data)}</template></turbo-stream>`

		route.fulfill({
			status: 200,
			contentType: 'text/vnd.turbo-stream.html; charset=utf-8',
			body: turboStreamResponse,
		})
	})

	await page.goto('/search')
	await page.getByTestId('search-input').fill('test')
	await page.getByTestId('search-button').click()

	// Wait and check
	await page.waitForTimeout(2000)

	const hasResults = await page
		.locator('[data-testid="search-results"]')
		.count()
	console.log('Found search-results elements:', hasResults)

	if (hasResults > 0) {
		const resultCount = await page.getByTestId('search-result').count()
		console.log('Found result items:', resultCount)
	}
})
