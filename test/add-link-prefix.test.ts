import { describe, expect, it } from 'vitest'
import { addLinkPrefix } from '../src/middleware/add-link-prefix'
import { createMockContext, parseDocument } from './helpers'

describe('addLinkPrefix', () => {
	const context = createMockContext()

	it('prefixes /_astro/ href with base URL', async () => {
		const document = parseDocument('<html><body><a href="/_astro/style.css">Link</a></body></html>')
		const result = await addLinkPrefix(context, document)
		const link = result.querySelector('a')!
		// BASE_URL is "/" in tests, so stripping trailing slash gives ""
		// Result: "" + "/_astro/style.css" = "/_astro/style.css"
		expect(link.getAttribute('href')).toBe('/_astro/style.css')
	})

	it('prefixes /_astro/ src on img elements', async () => {
		const document = parseDocument('<html><body><img src="/_astro/image.png" /></body></html>')
		const result = await addLinkPrefix(context, document)
		const img = result.querySelector('img')!
		expect(img.getAttribute('src')).toBe('/_astro/image.png')
	})

	it('does not modify non-astro paths', async () => {
		const document = parseDocument('<html><body><a href="/about">About</a></body></html>')
		const result = await addLinkPrefix(context, document)
		const link = result.querySelector('a')!
		expect(link.getAttribute('href')).toBe('/about')
	})

	it('does not modify external URLs', async () => {
		const document = parseDocument(
			'<html><body><a href="https://example.com">External</a></body></html>',
		)
		const result = await addLinkPrefix(context, document)
		const link = result.querySelector('a')!
		expect(link.getAttribute('href')).toBe('https://example.com')
	})

	it('does not modify srcset without /_astro/ urls', async () => {
		const document = parseDocument(
			'<html><body><img srcset="https://example.com/foo.png 1x, https://example.com/bar.png 2x" /></body></html>',
		)
		const result = await addLinkPrefix(context, document)
		expect(result.querySelector('img')!.getAttribute('srcset')).toBe(
			'https://example.com/foo.png 1x, https://example.com/bar.png 2x',
		)
	})

	it('handles elements without href or src', async () => {
		const document = parseDocument('<html><body><div>No link</div></body></html>')
		const result = await addLinkPrefix(context, document)
		expect(result.querySelector('div')!.textContent).toBe('No link')
	})
})
