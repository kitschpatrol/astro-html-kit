import { describe, expect, it } from 'vitest'
import { unwrapEmptyLinks } from '../src/middleware/unwrap-empty-links'
import { createMockContext, parseDocument } from './helpers'

describe('unwrapEmptyLinks', () => {
	const context = createMockContext()

	it('unwraps anchors with empty href, preserving inner text', async () => {
		const document = parseDocument(`<html><body>
			<p><a href="">orphan</a></p>
		</body></html>`)
		const result = await unwrapEmptyLinks(context, document)
		expect(result.querySelector('a')).toBeNull()
		expect(result.querySelector('p')!.textContent).toBe('orphan')
	})

	it('unwraps anchors with no href attribute', async () => {
		const document = parseDocument(`<html><body>
			<p><a>placeholder</a></p>
		</body></html>`)
		const result = await unwrapEmptyLinks(context, document)
		expect(result.querySelector('a')).toBeNull()
		expect(result.querySelector('p')!.textContent).toBe('placeholder')
	})

	it('unwraps anchors with whitespace-only href', async () => {
		const document = parseDocument(`<html><body>
			<p><a href="   ">spaced</a></p>
		</body></html>`)
		const result = await unwrapEmptyLinks(context, document)
		expect(result.querySelector('a')).toBeNull()
		expect(result.querySelector('p')!.textContent).toBe('spaced')
	})

	it('leaves anchors with a non-empty href untouched', async () => {
		const document = parseDocument(`<html><body>
			<p><a href="/about">about</a></p>
		</body></html>`)
		const result = await unwrapEmptyLinks(context, document)
		const anchor = result.querySelector('a')
		expect(anchor).not.toBeNull()
		expect(anchor!.getAttribute('href')).toBe('/about')
		expect(anchor!.textContent).toBe('about')
	})

	it('moves nested children into the parent in order', async () => {
		const document = parseDocument(`<html><body>
			<p><a href=""><strong>bold</strong> tail</a></p>
		</body></html>`)
		const result = await unwrapEmptyLinks(context, document)
		expect(result.querySelector('a')).toBeNull()
		const paragraph = result.querySelector('p')!
		expect(paragraph.querySelector('strong')!.textContent).toBe('bold')
		expect(paragraph.textContent).toContain('bold')
		expect(paragraph.textContent).toContain('tail')
	})

	it('unwraps multiple empty anchors in one document', async () => {
		const document = parseDocument(`<html><body>
			<a href="">one</a>
			<a href="/keep">keep</a>
			<a>two</a>
		</body></html>`)
		const result = await unwrapEmptyLinks(context, document)
		const anchors = result.querySelectorAll('a')
		expect(anchors.length).toBe(1)
		expect(anchors[0]!.getAttribute('href')).toBe('/keep')
		expect(result.body.textContent).toContain('one')
		expect(result.body.textContent).toContain('two')
	})

	it('removes empty anchors that have no children', async () => {
		const document = parseDocument(`<html><body>
			<p>start <a href=""></a> end</p>
		</body></html>`)
		const result = await unwrapEmptyLinks(context, document)
		expect(result.querySelector('a')).toBeNull()
		expect(result.querySelector('p')!.textContent).toBe('start  end')
	})
})
