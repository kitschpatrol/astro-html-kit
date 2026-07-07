import { describe, expect, it } from 'vitest'
import { trimTrailingWhitespace } from '../src/middleware/trim-trailing-whitespace'
import { createMockContext } from './helpers'

describe('trimTrailingWhitespace', () => {
	const context = createMockContext()

	it('trims trailing spaces and tabs from each line', async () => {
		const result = await trimTrailingWhitespace(context, 'one   \ntwo\t\nthree')
		expect(result).toBe('one\ntwo\nthree')
	})

	it('preserves leading whitespace', async () => {
		const result = await trimTrailingWhitespace(context, '\tindented  \n  spaced\t')
		expect(result).toBe('\tindented\n  spaced')
	})

	it('preserves empty lines', async () => {
		const result = await trimTrailingWhitespace(context, 'one\n\ntwo')
		expect(result).toBe('one\n\ntwo')
	})

	it('handles an empty string', async () => {
		const result = await trimTrailingWhitespace(context, '')
		expect(result).toBe('')
	})

	it('leaves already-clean output unchanged', async () => {
		const html = '<html><body><p>Hello</p></body></html>'
		expect(await trimTrailingWhitespace(context, html)).toBe(html)
	})
})
