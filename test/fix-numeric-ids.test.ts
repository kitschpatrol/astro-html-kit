import { describe, expect, it } from 'vitest'
import { createFixNumericIds } from '../src/middleware/fix-numeric-ids'
import { createMockContext, parseDocument } from './helpers'

describe('fixNumericIds', () => {
	const context = createMockContext()
	const fixNumericIds = createFixNumericIds('id')

	it('prefixes numeric ids with id-', async () => {
		const document = parseDocument('<html><body><h2 id="2024-updates">2024</h2></body></html>')
		const result = await fixNumericIds(context, document)
		expect(result.querySelector('h2')!.getAttribute('id')).toBe('id-2024-updates')
	})

	it('does not modify non-numeric ids', async () => {
		const document = parseDocument('<html><body><h2 id="about-us">About</h2></body></html>')
		const result = await fixNumericIds(context, document)
		expect(result.querySelector('h2')!.getAttribute('id')).toBe('about-us')
	})

	it('fixes anchor hrefs pointing to numeric ids', async () => {
		const document = parseDocument('<html><body><a href="#2024-updates">Link</a></body></html>')
		const result = await fixNumericIds(context, document)
		expect(result.querySelector('a')!.getAttribute('href')).toBe('#id-2024-updates')
	})

	it('does not modify anchor hrefs pointing to non-numeric ids', async () => {
		const document = parseDocument('<html><body><a href="#about-us">Link</a></body></html>')
		const result = await fixNumericIds(context, document)
		expect(result.querySelector('a')!.getAttribute('href')).toBe('#about-us')
	})

	it('does not modify external hrefs', async () => {
		const document = parseDocument(
			'<html><body><a href="https://example.com">Link</a></body></html>',
		)
		const result = await fixNumericIds(context, document)
		expect(result.querySelector('a')!.getAttribute('href')).toBe('https://example.com')
	})

	it('fixes both id and href on the same page', async () => {
		const document = parseDocument(`<html><body>
			<h2 id="3-things">3 Things</h2>
			<a href="#3-things">Link</a>
		</body></html>`)
		const result = await fixNumericIds(context, document)
		expect(result.querySelector('h2')!.getAttribute('id')).toBe('id-3-things')
		expect(result.querySelector('a')!.getAttribute('href')).toBe('#id-3-things')
	})

	it('uses a custom prefix', async () => {
		const customFixIds = createFixNumericIds('heading')
		const document = parseDocument(`<html><body>
			<h2 id="99-problems">99</h2>
			<a href="#99-problems">Link</a>
		</body></html>`)
		const result = await customFixIds(context, document)
		expect(result.querySelector('h2')!.getAttribute('id')).toBe('heading-99-problems')
		expect(result.querySelector('a')!.getAttribute('href')).toBe('#heading-99-problems')
	})
})
