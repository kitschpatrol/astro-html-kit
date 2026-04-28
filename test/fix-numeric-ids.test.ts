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

	it('rewrites label[for] pointing at numeric ids', async () => {
		const document = parseDocument(
			'<html><body><label for="2024-field">Year</label><input id="2024-field"/></body></html>',
		)
		const result = await fixNumericIds(context, document)
		expect(result.querySelector('label')!.getAttribute('for')).toBe('id-2024-field')
		expect(result.querySelector('input')!.getAttribute('id')).toBe('id-2024-field')
	})

	it('rewrites aria-labelledby with a single id reference', async () => {
		const document = parseDocument(
			'<html><body><h2 id="2024-updates">2024</h2><div aria-labelledby="2024-updates">Body</div></body></html>',
		)
		const result = await fixNumericIds(context, document)
		expect(result.querySelector('div')!.getAttribute('aria-labelledby')).toBe('id-2024-updates')
	})

	it('rewrites only the numeric ids inside whitespace-separated reference lists', async () => {
		const document = parseDocument(
			'<html><body><div aria-describedby="alpha 2024-updates beta"></div></body></html>',
		)
		const result = await fixNumericIds(context, document)
		expect(result.querySelector('div')!.getAttribute('aria-describedby')).toBe(
			'alpha id-2024-updates beta',
		)
	})

	it('rewrites th[headers] lists', async () => {
		const document = parseDocument(
			'<html><body><table><tr><th id="3-col">3</th></tr><tr><td headers="3-col">cell</td></tr></table></body></html>',
		)
		const result = await fixNumericIds(context, document)
		expect(result.querySelector('th')!.getAttribute('id')).toBe('id-3-col')
		expect(result.querySelector('td')!.getAttribute('headers')).toBe('id-3-col')
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
