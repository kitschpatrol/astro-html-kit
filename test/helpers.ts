import type { APIContext } from 'astro'
import { parseHTML } from 'linkedom'

/**
 * Create a minimal mock APIContext for testing DOM middleware handlers.
 */
export function createMockContext(options?: { site?: string }): APIContext {
	const site = options?.site ? new URL(options.site) : undefined
	// eslint-disable-next-line ts/no-unsafe-type-assertion
	return {
		site,
		url: new URL('http://localhost:4321/'),
	} as unknown as APIContext
}

/**
 * Parse an HTML string into a linkedom Document.
 */
export function parseDocument(html: string): Document {
	return parseHTML(html).document
}
