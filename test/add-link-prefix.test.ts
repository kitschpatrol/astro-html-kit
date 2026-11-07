import { describe, expect, it } from 'vitest'
import { createAddLinkPrefix } from '../src/middleware/add-link-prefix'
import { createMockContext, parseDocument } from './helpers'

describe('addLinkPrefix', () => {
	const context = createMockContext()
	const addLinkPrefix = createAddLinkPrefix('/docs/')

	it('prefixes /_astro/ href with the base path', async () => {
		const document = parseDocument('<html><body><a href="/_astro/style.css">Link</a></body></html>')
		const result = await addLinkPrefix(context, document)
		expect(result.querySelector('a')!.getAttribute('href')).toBe('/docs/_astro/style.css')
	})

	it('prefixes /_astro/ src on img elements', async () => {
		const document = parseDocument('<html><body><img src="/_astro/image.png" /></body></html>')
		const result = await addLinkPrefix(context, document)
		expect(result.querySelector('img')!.getAttribute('src')).toBe('/docs/_astro/image.png')
	})

	it('prefixes every /_astro/ candidate in srcset and keeps descriptors', async () => {
		const document = parseDocument(
			'<html><body><img srcset="/_astro/a.png 1x, /_astro/b.png 2x" /></body></html>',
		)
		const result = await addLinkPrefix(context, document)
		expect(result.querySelector('img')!.getAttribute('srcset')).toBe(
			'/docs/_astro/a.png 1x, /docs/_astro/b.png 2x',
		)
	})

	it('prefixes only the /_astro/ candidates in a mixed srcset', async () => {
		const document = parseDocument(
			'<html><body><img srcset="/_astro/a.png 480w,https://cdn.example.com/b.png 800w" /></body></html>',
		)
		const result = await addLinkPrefix(context, document)
		expect(result.querySelector('img')!.getAttribute('srcset')).toBe(
			'/docs/_astro/a.png 480w,https://cdn.example.com/b.png 800w',
		)
	})

	it('treats a base without a trailing slash the same', async () => {
		const addLinkPrefixNoSlash = createAddLinkPrefix('/docs')
		const document = parseDocument('<html><body><a href="/_astro/style.css">Link</a></body></html>')
		const result = await addLinkPrefixNoSlash(context, document)
		expect(result.querySelector('a')!.getAttribute('href')).toBe('/docs/_astro/style.css')
	})

	it('does nothing for the root base', async () => {
		const addLinkPrefixRoot = createAddLinkPrefix('/')
		const document = parseDocument(
			'<html><body><a href="/_astro/style.css">Link</a><img srcset="/_astro/a.png 1x" /></body></html>',
		)
		const result = await addLinkPrefixRoot(context, document)
		expect(result.querySelector('a')!.getAttribute('href')).toBe('/_astro/style.css')
		expect(result.querySelector('img')!.getAttribute('srcset')).toBe('/_astro/a.png 1x')
	})

	it('does not modify non-astro paths', async () => {
		const document = parseDocument('<html><body><a href="/about">About</a></body></html>')
		const result = await addLinkPrefix(context, document)
		expect(result.querySelector('a')!.getAttribute('href')).toBe('/about')
	})

	it('does not modify external URLs', async () => {
		const document = parseDocument(
			'<html><body><a href="https://example.com">External</a></body></html>',
		)
		const result = await addLinkPrefix(context, document)
		expect(result.querySelector('a')!.getAttribute('href')).toBe('https://example.com')
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
