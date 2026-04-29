import type { MiddlewareHandler } from 'astro'
import type { DomMiddlewareHandler, StringMiddlewareHandler } from './middleware/dom-middleware'
import { addLinkPrefix } from './middleware/add-link-prefix'
import { deduplicateIds } from './middleware/deduplicate-ids'
import { domSequence } from './middleware/dom-middleware'
import { externalLinkAnnotator } from './middleware/external-link-annotator'
import { createFixNumericIds } from './middleware/fix-numeric-ids'
import { stripLinkSuffix } from './middleware/strip-link-suffix'
import { trimTrailingWhitespace } from './middleware/trim-trailing-whitespace'
import { unwrapEmptyLinks } from './middleware/unwrap-empty-links'

/**
 * Coerce a value or array of values into an array.
 */
function toArray<T>(value: T | T[]): T[] {
	return Array.isArray(value) ? value : [value]
}

/**
 * Configuration for the astro-html-kit middleware.
 */
export type HtmlKitMiddlewareConfig = {
	/**
	 * Prefix `/_astro/` asset paths in `href`, `src`, and `srcset` attributes
	 * with `BASE_URL` (read from `import.meta.env`).
	 *
	 * @default false
	 */
	addLinkPrefix?: boolean
	/**
	 * Add `data-external-link` and `rel="noopener noreferrer"` to links pointing
	 * outside your site.
	 *
	 * @default false
	 */
	annotateExternalLinks?: boolean
	/**
	 * One or more custom DOM transforms run after all built-in DOM handlers. Each
	 * handler receives the shared `Document` and may mutate it in place.
	 *
	 * Middleware-only — function handlers can't be serialized through the
	 * integration's virtual module.
	 */
	customDomHandler?: DomMiddlewareHandler | DomMiddlewareHandler[]
	/**
	 * One or more custom string transforms run on the serialized HTML, after
	 * built-in string handlers.
	 *
	 * Middleware-only — function handlers can't be serialized through the
	 * integration's virtual module.
	 */
	customStringHandler?: StringMiddlewareHandler | StringMiddlewareHandler[]
	/**
	 * Append `-2`, `-3`, etc. to duplicate IDs page-wide. Mirrors
	 * `github-slugger` behavior, but runs across all rendered content rather than
	 * per Markdown document.
	 *
	 * @default false
	 */
	deduplicateIds?: boolean
	/**
	 * Prefix IDs that begin with a digit so they're valid CSS/JS identifiers
	 * (e.g. `id="2024-updates"` becomes `id="id-2024-updates"`).
	 *
	 * - `true` uses the prefix `id-`.
	 * - A string sets a custom prefix; the trailing `-` is added automatically.
	 *
	 * Also rewrites `<a href="#…">` fragments and `for`, `headers`, and `aria-*`
	 * attributes that reference fixed IDs.
	 *
	 * @default false
	 */
	fixNumericIds?: boolean | string
	/**
	 * Remove `.html` from internal link `href`s, including before `?query` and
	 * `#hash`. Requires `site` to be set in your Astro config so internal vs.
	 * external links can be distinguished.
	 *
	 * @default false
	 */
	stripLinkSuffix?: boolean
	/**
	 * Trim trailing whitespace from each line of the serialized HTML output.
	 *
	 * @default false
	 */
	trimTrailingWhitespace?: boolean
	/**
	 * Replace `<a>` elements with an empty, whitespace-only, or missing `href`
	 * attribute with their children.
	 *
	 * @default false
	 */
	unwrapEmptyLinks?: boolean
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

	if (config?.annotateExternalLinks) {
		domHandlers.push(externalLinkAnnotator)
	}

	if (config?.addLinkPrefix) {
		domHandlers.push(addLinkPrefix)
	}

	if (config?.stripLinkSuffix) {
		domHandlers.push(stripLinkSuffix)
	}

	if (config?.fixNumericIds) {
		const prefix = typeof config.fixNumericIds === 'string' ? config.fixNumericIds : 'id'
		domHandlers.push(createFixNumericIds(prefix))
	}

	if (config?.deduplicateIds) {
		domHandlers.push(deduplicateIds)
	}

	if (config?.unwrapEmptyLinks) {
		domHandlers.push(unwrapEmptyLinks)
	}

	if (config?.customDomHandler) {
		domHandlers.push(...toArray(config.customDomHandler))
	}

	if (config?.trimTrailingWhitespace) {
		stringHandlers.push(trimTrailingWhitespace)
	}

	if (config?.customStringHandler) {
		stringHandlers.push(...toArray(config.customStringHandler))
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
