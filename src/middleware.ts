import type { MiddlewareHandler } from 'astro'
import type { DomMiddlewareHandler } from './middleware/dom-middleware'
import { addLinkPrefix } from './middleware/add-link-prefix'
import { domSequence } from './middleware/dom-middleware'
import { externalLinkAnnotator } from './middleware/external-link-annotator'
import { stripLinkSuffix } from './middleware/strip-link-suffix'

/**
 * Configuration for the astro-html-kit middleware.
 */
export type HtmlKitMiddlewareConfig = {
	addLinkPrefix?: boolean
	annotateExternalLinks?: boolean
	custom?: DomMiddlewareHandler | DomMiddlewareHandler[]
	stripLinkSuffix?: boolean
}

/**
 * Creates Astro middleware that applies DOM transforms to HTML responses.
 *
 * All built-in transforms are disabled by default. Pass `true` to enable
 * specific ones.
 *
 * @example
 * 	// src/middleware.ts
 * 	import { htmlKit } from 'astro-html-kit/middleware'
 *
 * 	export const onRequest = htmlKit({
 * 		stripLinkSuffix: true,
 * 		annotateExternalLinks: true,
 * 	})
 *
 * @example
 * 	// With custom handler
 * 	import { htmlKit } from 'astro-html-kit/middleware'
 *
 * 	export const onRequest = htmlKit({
 * 		custom: (context, document) => {
 * 			// Your DOM transforms here
 * 			return document
 * 		},
 * 	})
 */
export function htmlKit(config?: HtmlKitMiddlewareConfig): MiddlewareHandler {
	const handlers: DomMiddlewareHandler[] = []

	if (config?.annotateExternalLinks) handlers.push(externalLinkAnnotator)
	if (config?.addLinkPrefix) handlers.push(addLinkPrefix)
	if (config?.stripLinkSuffix) handlers.push(stripLinkSuffix)

	if (config?.custom) {
		if (Array.isArray(config.custom)) {
			handlers.push(...config.custom)
		} else {
			handlers.push(config.custom)
		}
	}

	return domSequence(...handlers)
}

export {
	defineDomMiddleware,
	defineDomMiddlewareAsMiddleware,
	domSequence,
} from './middleware/dom-middleware'
export type { DomMiddlewareHandler } from './middleware/dom-middleware'
