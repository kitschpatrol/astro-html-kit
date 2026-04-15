import type { MiddlewareHandler } from 'astro'
import type { DomMiddlewareHandler, StringMiddlewareHandler } from './middleware/dom-middleware'
import { addLinkPrefix } from './middleware/add-link-prefix'
import { deduplicateIds } from './middleware/deduplicate-ids'
import { domSequence } from './middleware/dom-middleware'
import { externalLinkAnnotator } from './middleware/external-link-annotator'
import { createFixNumericIds } from './middleware/fix-numeric-ids'
import { stripLinkSuffix } from './middleware/strip-link-suffix'
import { trimTrailingWhitespace } from './middleware/trim-trailing-whitespace'

/**
 * Configuration for the astro-html-kit middleware.
 */
export type HtmlKitMiddlewareConfig = {
	addLinkPrefix?: boolean
	annotateExternalLinks?: boolean
	customDomHandler?: DomMiddlewareHandler | DomMiddlewareHandler[]
	customStringHandler?: StringMiddlewareHandler | StringMiddlewareHandler[]
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
 * 		customDomHandler: (context, document) => {
 * 			// Your DOM transforms here
 * 			return document
 * 		},
 * 	})
 */
export function htmlKit(config?: HtmlKitMiddlewareConfig): MiddlewareHandler {
	const domHandlers: DomMiddlewareHandler[] = []
	const stringHandlers: StringMiddlewareHandler[] = []

	if (config?.annotateExternalLinks) domHandlers.push(externalLinkAnnotator)
	if (config?.addLinkPrefix) domHandlers.push(addLinkPrefix)
	if (config?.stripLinkSuffix) domHandlers.push(stripLinkSuffix)
	if (config?.fixNumericIds) {
		const prefix = typeof config.fixNumericIds === 'string' ? config.fixNumericIds : 'id'
		domHandlers.push(createFixNumericIds(prefix))
	}

	if (config?.deduplicateIds) domHandlers.push(deduplicateIds)

	if (config?.customDomHandler) {
		if (Array.isArray(config.customDomHandler)) {
			domHandlers.push(...config.customDomHandler)
		} else {
			domHandlers.push(config.customDomHandler)
		}
	}

	if (config?.trimTrailingWhitespace) stringHandlers.push(trimTrailingWhitespace)

	if (config?.customStringHandler) {
		if (Array.isArray(config.customStringHandler)) {
			stringHandlers.push(...config.customStringHandler)
		} else {
			stringHandlers.push(config.customStringHandler)
		}
	}

	return domSequence({ domHandlers, stringHandlers })
}

export {
	defineDomMiddleware,
	defineDomMiddlewareAsMiddleware,
	defineStringMiddleware,
	domSequence,
} from './middleware/dom-middleware'
export type {
	DomMiddlewareHandler,
	DomSequenceOptions,
	StringMiddlewareHandler,
} from './middleware/dom-middleware'
