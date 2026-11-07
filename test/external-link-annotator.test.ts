import { describe, expect, it } from 'vitest'
import { externalLinkAnnotator } from '../src/middleware/external-link-annotator'
import { createMockContext, parseDocument } from './helpers'

describe('externalLinkAnnotator', () => {
	const context = createMockContext({ site: 'http://localhost:4321' })

	it('adds data-external-link and rel to external links', async () => {
		const document = parseDocument(
			'<html><body><a href="https://example.com">External</a></body></html>',
		)
		const result = await externalLinkAnnotator(context, document)
		const link = result.querySelector('a')!
		expect(link.dataset.externalLink).toBe('')
		expect(link.getAttribute('rel')).toBe('noopener noreferrer')
	})

	it('does not annotate internal links', async () => {
		const document = parseDocument('<html><body><a href="/about">Internal</a></body></html>')
		const result = await externalLinkAnnotator(context, document)
		const link = result.querySelector('a')!
		expect(Object.hasOwn(link.dataset, 'externalLink')).toBe(false)
		expect(link.hasAttribute('rel')).toBe(false)
	})

	it('does not annotate links matching the site hostname', async () => {
		const document = parseDocument(
			'<html><body><a href="http://localhost:4321/page">Same site</a></body></html>',
		)
		const result = await externalLinkAnnotator(context, document)
		const link = result.querySelector('a')!
		expect(Object.hasOwn(link.dataset, 'externalLink')).toBe(false)
	})

	it('handles multiple links', async () => {
		const document = parseDocument(`<html><body>
			<a href="https://example.com">External 1</a>
			<a href="/local">Internal</a>
			<a href="https://github.com">External 2</a>
		</body></html>`)
		const result = await externalLinkAnnotator(context, document)
		const links = result.querySelectorAll('a')
		expect(Object.hasOwn(links[0]!.dataset, 'externalLink')).toBe(true)
		expect(Object.hasOwn(links[1]!.dataset, 'externalLink')).toBe(false)
		expect(Object.hasOwn(links[2]!.dataset, 'externalLink')).toBe(true)
	})

	it('handles links with invalid URLs gracefully', async () => {
		const document = parseDocument(
			'<html><body><a href="javascript:void(0)">Invalid</a></body></html>',
		)
		const result = await externalLinkAnnotator(context, document)
		const link = result.querySelector('a')!
		expect(Object.hasOwn(link.dataset, 'externalLink')).toBe(false)
	})

	it('preserves existing rel tokens', async () => {
		const document = parseDocument(
			'<html><body><a href="https://example.com" rel="me nofollow">External</a></body></html>',
		)
		const result = await externalLinkAnnotator(context, document)
		const link = result.querySelector('a')!
		expect(link.getAttribute('rel')).toBe('me nofollow noopener noreferrer')
	})

	it('does not duplicate rel tokens already present', async () => {
		const document = parseDocument(
			'<html><body><a href="https://example.com" rel="noopener">External</a></body></html>',
		)
		const result = await externalLinkAnnotator(context, document)
		expect(result.querySelector('a')!.getAttribute('rel')).toBe('noopener noreferrer')
	})

	it('does nothing without a site configured', async () => {
		const noSiteContext = createMockContext()
		const document = parseDocument(
			'<html><body><a href="https://example.com">External</a></body></html>',
		)
		const result = await externalLinkAnnotator(noSiteContext, document)
		const link = result.querySelector('a')!
		expect(Object.hasOwn(link.dataset, 'externalLink')).toBe(false)
		expect(link.hasAttribute('rel')).toBe(false)
	})

	it('annotates protocol-relative URLs on other hosts', async () => {
		const document = parseDocument(
			'<html><body><a href="//cdn.example.com/lib.js">CDN</a></body></html>',
		)
		const result = await externalLinkAnnotator(context, document)
		const link = result.querySelector('a')!
		expect(Object.hasOwn(link.dataset, 'externalLink')).toBe(true)
		expect(link.getAttribute('rel')).toBe('noopener noreferrer')
	})

	it('does not annotate protocol-relative URLs on the site host', async () => {
		const document = parseDocument(
			'<html><body><a href="//localhost:4321/page">Same host</a></body></html>',
		)
		const result = await externalLinkAnnotator(context, document)
		expect(Object.hasOwn(result.querySelector('a')!.dataset, 'externalLink')).toBe(false)
	})

	it('does not annotate document-relative paths', async () => {
		const document = parseDocument(
			'<html><body><a href="sibling.html">Sibling</a><a href="../parent">Parent</a></body></html>',
		)
		const result = await externalLinkAnnotator(context, document)
		for (const link of result.querySelectorAll('a')) {
			expect(Object.hasOwn(link.dataset, 'externalLink')).toBe(false)
		}
	})

	it('does not annotate fragment-only links', async () => {
		const document = parseDocument('<html><body><a href="#top">Top</a></body></html>')
		const result = await externalLinkAnnotator(context, document)
		expect(Object.hasOwn(result.querySelector('a')!.dataset, 'externalLink')).toBe(false)
	})

	it('does not annotate mailto and tel links', async () => {
		const document = parseDocument(
			'<html><body><a href="mailto:a@example.com">Mail</a><a href="tel:+15555550123">Call</a></body></html>',
		)
		const result = await externalLinkAnnotator(context, document)
		for (const link of result.querySelectorAll('a')) {
			expect(Object.hasOwn(link.dataset, 'externalLink')).toBe(false)
			expect(link.hasAttribute('rel')).toBe(false)
		}
	})

	it('treats a different subdomain as external', async () => {
		const siteContext = createMockContext({ site: 'https://www.example.com' })
		const document = parseDocument(
			'<html><body><a href="https://example.com/page">Apex</a></body></html>',
		)
		const result = await externalLinkAnnotator(siteContext, document)
		expect(Object.hasOwn(result.querySelector('a')!.dataset, 'externalLink')).toBe(true)
	})
})
