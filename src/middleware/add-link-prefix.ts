import type { DomMiddlewareHandler } from './dom-middleware'
import { defineDomMiddleware } from './dom-middleware'
import { stripTrailingSlash } from './utilities'

const ASTRO_PATH_PREFIX = '/_astro/'

const URL_ATTRIBUTES = ['href', 'src'] as const

const LEADING_WHITESPACE_REGEX = /^\s*/v

function rewriteSrcset(value: string, prefix: string): string {
	return value
		.split(',')
		.map((candidate) => {
			const leading = LEADING_WHITESPACE_REGEX.exec(candidate)?.[0] ?? ''
			const rest = candidate.slice(leading.length)
			return rest.startsWith(ASTRO_PATH_PREFIX) ? `${leading}${prefix}${rest}` : candidate
		})
		.join(',')
}

/**
 * Creates a DOM middleware handler that prefixes `/_astro/` asset paths in
 * `href`, `src`, and `srcset` attributes with the site's base path.
 *
 * @param baseUrl The configured base path, normally `import.meta.env.BASE_URL`.
 * A trailing slash is ignored, so `/docs` and `/docs/` behave the same, and
 * the root base `/` is a no-op.
 */
export function createAddLinkPrefix(baseUrl: string): DomMiddlewareHandler {
	const prefix = stripTrailingSlash(baseUrl)

	return defineDomMiddleware((_context, document) => {
		if (prefix === '') {
			return document
		}

		for (const element of document.querySelectorAll('[href], [src], [srcset]')) {
			for (const attribute of URL_ATTRIBUTES) {
				const value = element.getAttribute(attribute)
				if (value?.startsWith(ASTRO_PATH_PREFIX)) {
					element.setAttribute(attribute, `${prefix}${value}`)
				}
			}

			const srcset = element.getAttribute('srcset') ?? ''
			if (srcset === '') {
				continue
			}

			const updated = rewriteSrcset(srcset, prefix)
			if (updated !== srcset) {
				element.setAttribute('srcset', updated)
			}
		}

		return document
	})
}
