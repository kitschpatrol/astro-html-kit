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
})
