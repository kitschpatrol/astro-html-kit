import type { APIContext, MiddlewareHandler } from 'astro'
import { parseHTML } from 'linkedom'

export type DomMiddlewareHandler = (
	context: APIContext,
	document: Document,
) => Document | Promise<Document>

export type StringMiddlewareHandler = (
	context: APIContext,
	html: string,
) => Promise<string> | string

/**
 * Define a DOM middleware handler that can be used in `domSequence()`.
 *
 * This is a convenience function that allows you to define a middleware handler
 * that operates on the DOM.
 */
export function defineDomMiddleware(fn: DomMiddlewareHandler): DomMiddlewareHandler {
	return fn
}

/**
 * Define a string middleware handler that can be used in `domSequence()`.
 *
 * String handlers run after DOM serialization, operating on the raw HTML
 * string.
 */
export function defineStringMiddleware(fn: StringMiddlewareHandler): StringMiddlewareHandler {
	return fn
}

/**
 * Define a DOM middleware handler in the form of Astro's MiddlewareHandler.
 */
export function defineDomMiddlewareAsMiddleware(fn: DomMiddlewareHandler): MiddlewareHandler {
	return domSequence({ domHandlers: [fn] })
}

export type DomSequenceOptions = {
	domHandlers?: DomMiddlewareHandler[] | undefined
	stringHandlers?: StringMiddlewareHandler[] | undefined
}

/**
 * Like Astro's `sequence()` middleware, but passes DOM objects through instead
 * of Response objects, followed by string-level transforms on the serialized
 * HTML.
 *
 * Running as a sequence allows you to run multiple DOM transforms via a single
 * parse and render of the DOM.
 */
export function domSequence(options: DomSequenceOptions): MiddlewareHandler {
	const { domHandlers = [], stringHandlers = [] } = options

	return async (context, next) => {
		const response = await next()
		// Only operate on HTML responses. Astro typically emits
		// `text/html; charset=utf-8`, so match by prefix.
		if (!response.headers.get('content-type')?.startsWith('text/html')) {
			return response
		}

		const html = await response.text()
		let { document } = parseHTML(html)

		// Not actually copying the document, leaving that to the handlers,
		//  so mutation is possible... gross but hypothetically for efficiency...
		for (const domHandler of domHandlers) {
			document = await domHandler(context, document)
		}

		// Linkedom implements a `toString()` that serializes the document back to HTML
		// eslint-disable-next-line ts/no-base-to-string
		let output = document.toString()

		for (const stringHandler of stringHandlers) {
			output = await stringHandler(context, output)
		}

		return new Response(output, {
			headers: response.headers,
			status: response.status,
			statusText: response.statusText,
		})
	}
}
