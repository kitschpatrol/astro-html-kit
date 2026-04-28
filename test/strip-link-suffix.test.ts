import { describe, expect, it } from 'vitest'
import { stripLinkSuffix } from '../src/middleware/strip-link-suffix'
import { createMockContext, parseDocument } from './helpers'

describe('stripLinkSuffix', () => {
	const context = createMockContext({ site: 'http://localhost:4321' })

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
})
