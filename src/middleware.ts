import type { MiddlewareHandler } from 'astro'
import type { DomMiddlewareHandler } from './middleware/dom-middleware'
import { addLinkPrefix } from './middleware/add-link-prefix'
import { deduplicateIds } from './middleware/deduplicate-ids'
import { domSequence } from './middleware/dom-middleware'
import { externalLinkAnnotator } from './middleware/external-link-annotator'
import { createFixNumericIds } from './middleware/fix-numeric-ids'
import { stripLinkSuffix } from './middleware/strip-link-suffix'

/**
 * Configuration for the astro-html-kit middleware.
 */
export type HtmlKitMiddlewareConfig = {
	addLinkPrefix?: boolean
	annotateExternalLinks?: boolean
	custom?: DomMiddlewareHandler | DomMiddlewareHandler[]
	deduplicateIds?: boolean
	fixNumericIds?: boolean | string
	stripLinkSuffix?: boolean
	trimTrailingWhitespace?: boolean
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
	if (config?.fixNumericIds) {
		const prefix = typeof config.fixNumericIds === 'string' ? config.fixNumericIds : 'id'
		handlers.push(createFixNumericIds(prefix))
	}

	if (config?.deduplicateIds) handlers.push(deduplicateIds)

	if (config?.custom) {
		if (Array.isArray(config.custom)) {
			handlers.push(...config.custom)
		} else {
			handlers.push(config.custom)
		}
	}

	return domSequence(handlers, {
		trimTrailingWhitespace: config?.trimTrailingWhitespace,
	})
}

export {
	defineDomMiddleware,
	defineDomMiddlewareAsMiddleware,
	domSequence,
} from './middleware/dom-middleware'
export type { DomMiddlewareHandler, DomSequenceOptions } from './middleware/dom-middleware'
