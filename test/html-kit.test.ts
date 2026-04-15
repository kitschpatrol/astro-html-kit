import { describe, expect, it } from 'vitest'
import type { DomMiddlewareHandler } from '../src/middleware'
import { defineDomMiddleware, htmlKit } from '../src/middleware'

const mockContext = {
	site: new URL('http://localhost:4321'),
	url: new URL('http://localhost:4321/'),
}

function htmlResponse(html: string) {
	return new Response(html, {
		headers: { 'content-type': 'text/html' },
	})
}

function jsonResponse(json: string) {
	return new Response(json, {
		headers: { 'content-type': 'application/json' },
	})
}

// eslint-disable-next-line ts/no-unsafe-type-assertion
const context = mockContext as unknown as Parameters<ReturnType<typeof htmlKit>>[0]

async function callMiddleware(
	middleware: ReturnType<typeof htmlKit>,
	html: string,
): Promise<Response> {
	// eslint-disable-next-line ts/no-unsafe-type-assertion, ts/promise-function-async
	return (await middleware(context, () => Promise.resolve(htmlResponse(html)))) as Response
}

const addCustomAttribute: DomMiddlewareHandler = (_context, document) => {
	document.body.dataset.custom = 'true'
	return document
}

const addFirstAttribute = defineDomMiddleware((_context, document) => {
	document.body.dataset.first = 'true'
	return document
})

const addSecondAttribute = defineDomMiddleware((_context, document) => {
	document.body.dataset.second = 'true'
	return document
})

describe('htmlKit', () => {
	it('passes HTML through linkedom even with no handlers enabled', async () => {
		const middleware = htmlKit()
		const response = await callMiddleware(middleware, '<html><body><p>Hello</p></body></html>')
		const result = await response.text()
		expect(result).toContain('<p>Hello</p>')
	})

	it('skips non-HTML responses', async () => {
		const middleware = htmlKit()
		const jsonBody = '{"key": "value"}'
		// eslint-disable-next-line ts/no-unsafe-type-assertion, ts/require-await
		const response = (await middleware(context, async () => jsonResponse(jsonBody))) as Response
		expect(await response.text()).toBe(jsonBody)
	})

	it('runs enabled built-in handlers', async () => {
		const middleware = htmlKit({ annotateExternalLinks: true })
		const response = await callMiddleware(
			middleware,
			'<html><body><a href="https://example.com">Ext</a></body></html>',
		)
		const result = await response.text()
		expect(result).toContain('data-external-link')
	})

	it('does not run disabled handlers', async () => {
		const middleware = htmlKit()
		const response = await callMiddleware(
			middleware,
			'<html><body><a href="https://example.com">Ext</a></body></html>',
		)
		const result = await response.text()
		expect(result).not.toContain('data-external-link')
	})

	it('runs a single custom handler', async () => {
		const middleware = htmlKit({ custom: addCustomAttribute })
		const response = await callMiddleware(middleware, '<html><body><p>Test</p></body></html>')
		const result = await response.text()
		expect(result).toContain('data-custom="true"')
	})

	it('runs multiple custom handlers in order', async () => {
		const middleware = htmlKit({ custom: [addFirstAttribute, addSecondAttribute] })
		const response = await callMiddleware(middleware, '<html><body><p>Test</p></body></html>')
		const result = await response.text()
		expect(result).toContain('data-first="true"')
		expect(result).toContain('data-second="true"')
	})
})
