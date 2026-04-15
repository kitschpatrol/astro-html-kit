import { describe, expect, it } from 'vitest'
import { deduplicateIds } from '../src/middleware/deduplicate-ids'
import { createMockContext, parseDocument } from './helpers'

describe('deduplicateIds', () => {
	const context = createMockContext()

	it('leaves unique ids unchanged', async () => {
		const document = parseDocument(`<html><body>
			<h2 id="intro">Intro</h2>
			<h2 id="concept">Concept</h2>
		</body></html>`)
		const result = await deduplicateIds(context, document)
		const headings = result.querySelectorAll('h2')
		expect(headings[0]!.getAttribute('id')).toBe('intro')
		expect(headings[1]!.getAttribute('id')).toBe('concept')
	})

	it('appends -2 to the second occurrence of a duplicate id', async () => {
		const document = parseDocument(`<html><body>
			<h2 id="concept">Concept 1</h2>
			<h2 id="concept">Concept 2</h2>
		</body></html>`)
		const result = await deduplicateIds(context, document)
		const headings = result.querySelectorAll('h2')
		expect(headings[0]!.getAttribute('id')).toBe('concept')
		expect(headings[1]!.getAttribute('id')).toBe('concept-2')
	})

	it('handles three or more duplicates', async () => {
		const document = parseDocument(`<html><body>
			<h2 id="concept">A</h2>
			<h2 id="concept">B</h2>
			<h2 id="concept">C</h2>
		</body></html>`)
		const result = await deduplicateIds(context, document)
		const headings = result.querySelectorAll('h2')
		expect(headings[0]!.getAttribute('id')).toBe('concept')
		expect(headings[1]!.getAttribute('id')).toBe('concept-2')
		expect(headings[2]!.getAttribute('id')).toBe('concept-3')
	})

	it('deduplicates across different element types', async () => {
		const document = parseDocument(`<html><body>
			<h2 id="nav">Nav heading</h2>
			<div id="nav">Nav div</div>
		</body></html>`)
		const result = await deduplicateIds(context, document)
		expect(result.querySelector('h2')!.getAttribute('id')).toBe('nav')
		expect(result.querySelector('div')!.getAttribute('id')).toBe('nav-2')
	})

	it('handles multiple groups of duplicates', async () => {
		const document = parseDocument(`<html><body>
			<h2 id="alpha">A1</h2>
			<h2 id="beta">B1</h2>
			<h2 id="alpha">A2</h2>
			<h2 id="beta">B2</h2>
		</body></html>`)
		const result = await deduplicateIds(context, document)
		const headings = result.querySelectorAll('h2')
		expect(headings[0]!.getAttribute('id')).toBe('alpha')
		expect(headings[1]!.getAttribute('id')).toBe('beta')
		expect(headings[2]!.getAttribute('id')).toBe('alpha-2')
		expect(headings[3]!.getAttribute('id')).toBe('beta-2')
	})
})
