import { chromium } from 'playwright'
import type { Browser, Page } from 'playwright'

let browser: Browser | null = null

async function getBrowser() {
	if (!browser) {
		browser = await chromium.launch({
			headless: true,
		})
	}
	return browser
}

export async function generatePDFFromURL(
	url: string,
	options?: {
		format?: 'A4' | 'Letter'
		landscape?: boolean
		margin?: { top?: string; right?: string; bottom?: string; left?: string }
		printBackground?: boolean
	},
) {
	const browserInstance = await getBrowser()
	const page = await browserInstance.newPage()

	try {
		// Navigate to the URL
		await page.goto(url, { waitUntil: 'networkidle' })

		// Generate PDF
		const pdf = await page.pdf({
			format: options?.format || 'A4',
			landscape: options?.landscape || false,
			margin: options?.margin || {
				top: '10mm',
				right: '10mm',
				bottom: '10mm',
				left: '10mm',
			},
			printBackground: options?.printBackground !== false,
		})

		return pdf
	} finally {
		await page.close()
	}
}

export async function generatePDFFromHTML(
	html: string,
	options?: {
		format?: 'A4' | 'Letter'
		landscape?: boolean
		margin?: { top?: string; right?: string; bottom?: string; left?: string }
		printBackground?: boolean
		stylesheets?: string[]
	},
) {
	const browserInstance = await getBrowser()
	const page = await browserInstance.newPage()

	try {
		// Set the HTML content
		await page.setContent(html, { waitUntil: 'networkidle' })

		// Add any additional stylesheets
		if (options?.stylesheets) {
			for (const stylesheet of options.stylesheets) {
				await page.addStyleTag({ path: stylesheet })
			}
		}

		// Generate PDF
		const pdf = await page.pdf({
			format: options?.format || 'A4',
			landscape: options?.landscape || false,
			margin: options?.margin || {
				top: '10mm',
				right: '10mm',
				bottom: '10mm',
				left: '10mm',
			},
			printBackground: options?.printBackground !== false,
		})

		return pdf
	} finally {
		await page.close()
	}
}

// Cleanup function to close browser when needed
export async function closeBrowser() {
	if (browser) {
		await browser.close()
		browser = null
	}
}

// Close browser on process exit
if (typeof process !== 'undefined') {
	process.on('exit', () => {
		if (browser) {
			browser.close()
		}
	})
}
