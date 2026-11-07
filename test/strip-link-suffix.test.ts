import { describe, expect, it } from 'vitest'
import { createStripLinkSuffix } from '../src/middleware/strip-link-suffix'
import { createMockContext, parseDocument } from './helpers'

describe('stripLinkSuffix', () => {
	const context = createMockContext({ site: 'http://localhost:4321' })
	const stripLinkSuffix = createStripLinkSuffix('/')

	it('strips .html suffix from matching hrefs', async () => {
		const document = parseDocument('<html><body><a href="/about.html">About</a></body></html>')
		const result = await stripLinkSuffix(context, document)
		const link = result.querySelector('a')!
		expect(link.getAttribute('href')).toBe('/about')
	})

	it('strips .html from nested paths', async () => {
		const document = parseDocument('<html><body><a href="/blog/post.html">Post</a></body></html>')
		const result = await stripLinkSuffix(context, document)
		const link = result.querySelector('a')!
		expect(link.getAttribute('href')).toBe('/blog/post')
	})

	it('does not modify hrefs without .html suffix', async () => {
		const document = parseDocument('<html><body><a href="/about">About</a></body></html>')
		const result = await stripLinkSuffix(context, document)
		const link = result.querySelector('a')!
		expect(link.getAttribute('href')).toBe('/about')
	})

	it('does not strip .html from external URLs', async () => {
		const document = parseDocument(
			'<html><body><a href="https://example.com/page.html">External</a></body></html>',
		)
		const result = await stripLinkSuffix(context, document)
		const link = result.querySelector('a')!
		expect(link.getAttribute('href')).toBe('https://example.com/page.html')
	})

	it('does nothing without a site configured', async () => {
		const noSiteContext = createMockContext()
		const document = parseDocument('<html><body><a href="/about.html">About</a></body></html>')
		const result = await stripLinkSuffix(noSiteContext, document)
		const link = result.querySelector('a')!
		expect(link.getAttribute('href')).toBe('/about.html')
	})

	it('strips .html before a query string', async () => {
		const document = parseDocument('<html><body><a href="/about.html?x=1">About</a></body></html>')
		const result = await stripLinkSuffix(context, document)
		expect(result.querySelector('a')!.getAttribute('href')).toBe('/about?x=1')
	})

	it('strips .html before a hash fragment', async () => {
		const document = parseDocument(
			'<html><body><a href="/about.html#section">About</a></body></html>',
		)
		const result = await stripLinkSuffix(context, document)
		expect(result.querySelector('a')!.getAttribute('href')).toBe('/about#section')
	})

	it('strips .html before a query and hash combined', async () => {
		const document = parseDocument(
			'<html><body><a href="/about.html?x=1#section">About</a></body></html>',
		)
		const result = await stripLinkSuffix(context, document)
		expect(result.querySelector('a')!.getAttribute('href')).toBe('/about?x=1#section')
	})

	it('handles multiple links', async () => {
		const document = parseDocument(`<html><body>
			<a href="/one.html">One</a>
			<a href="/two">Two</a>
			<a href="/three.html">Three</a>
		</body></html>`)
		const result = await stripLinkSuffix(context, document)
		const links = result.querySelectorAll('a')
		expect(links[0]!.getAttribute('href')).toBe('/one')
		expect(links[1]!.getAttribute('href')).toBe('/two')
		expect(links[2]!.getAttribute('href')).toBe('/three')
	})

	it('strips .html from absolute links on the site origin', async () => {
		const document = parseDocument(
			'<html><body><a href="http://localhost:4321/about.html">About</a></body></html>',
		)
		const result = await stripLinkSuffix(context, document)
		expect(result.querySelector('a')!.getAttribute('href')).toBe('http://localhost:4321/about')
	})

	it('does not strip .html from a different origin that shares the site prefix', async () => {
		const document = parseDocument(
			'<html><body><a href="http://localhost:43210/about.html">Other port</a></body></html>',
		)
		const result = await stripLinkSuffix(context, document)
		expect(result.querySelector('a')!.getAttribute('href')).toBe('http://localhost:43210/about.html')
	})

	it('leaves document-relative links alone', async () => {
		const document = parseDocument('<html><body><a href="about.html">About</a></body></html>')
		const result = await stripLinkSuffix(context, document)
		expect(result.querySelector('a')!.getAttribute('href')).toBe('about.html')
	})

	describe('with a base path', () => {
		const stripWithBase = createStripLinkSuffix('/docs/')

		it('strips .html from links under the base', async () => {
			const document = parseDocument('<html><body><a href="/docs/page.html">Page</a></body></html>')
			const result = await stripWithBase(context, document)
			expect(result.querySelector('a')!.getAttribute('href')).toBe('/docs/page')
		})

		it('strips .html from absolute links on the site origin under the base', async () => {
			const document = parseDocument(
				'<html><body><a href="http://localhost:4321/docs/page.html#top">Page</a></body></html>',
			)
			const result = await stripWithBase(context, document)
			expect(result.querySelector('a')!.getAttribute('href')).toBe(
				'http://localhost:4321/docs/page#top',
			)
		})

		it('leaves links outside the base alone', async () => {
			const document = parseDocument(
				'<html><body><a href="/other/page.html">Other</a></body></html>',
			)
			const result = await stripWithBase(context, document)
			expect(result.querySelector('a')!.getAttribute('href')).toBe('/other/page.html')
		})

		it('does not treat a longer path segment as within the base', async () => {
			const document = parseDocument(
				'<html><body><a href="/docs-archive/page.html">Archive</a></body></html>',
			)
			const result = await stripWithBase(context, document)
			expect(result.querySelector('a')!.getAttribute('href')).toBe('/docs-archive/page.html')
		})

		it('treats a base without a trailing slash the same', async () => {
			const stripNoSlash = createStripLinkSuffix('/docs')
			const document = parseDocument(`<html><body>
				<a href="/docs/page.html">Page</a>
				<a href="/docs-archive/page.html">Archive</a>
			</body></html>`)
			const result = await stripNoSlash(context, document)
			const links = result.querySelectorAll('a')
			expect(links[0]!.getAttribute('href')).toBe('/docs/page')
			expect(links[1]!.getAttribute('href')).toBe('/docs-archive/page.html')
		})
	})
})
