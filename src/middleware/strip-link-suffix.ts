import type { DomMiddlewareHandler } from './dom-middleware'
import { defineDomMiddleware } from './dom-middleware'
import { stripTrailingSlash } from './utilities'

// Match `.html` at the end of the path, or immediately before a query
// (`?`) or fragment (`#`), so that `/about.html?x=1` and `/about.html#top`
// are also stripped to `/about?x=1` and `/about#top`.
const HTML_SUFFIX_REGEX = /\.html(?=$|[?#])/v

const PATH_BOUNDARIES = ['/', '?', '#'] as const

/**
 * Whether `href` is `prefix` itself or sits beneath it on a path boundary, so
 * that a base of `/docs` doesn't claim `/docs-archive/…`.
 */
function isWithinPrefix(href: string, prefix: string): boolean {
	return (
		href === prefix || PATH_BOUNDARIES.some((boundary) => href.startsWith(`${prefix}${boundary}`))
	)
}

/**
 * Creates a DOM middleware handler that removes `.html` from internal link
 * `href`s, including before `?query` and `#hash`.
 *
 * A link counts as internal when it's a root-relative path under the base, or
 * an absolute URL on the site's origin under the base. Document-relative links
 * like `page.html` are left alone. Requires `site` to be set in the Astro
 * config.
 *
 * @param baseUrl The configured base path, normally `import.meta.env.BASE_URL`.
 *   A trailing slash is ignored, so `/docs` and `/docs/` behave the same.
 */
export function createStripLinkSuffix(baseUrl: string): DomMiddlewareHandler {
	const basePath = stripTrailingSlash(baseUrl)

	return defineDomMiddleware((context, document) => {
		if (!context.site) {
			return document
		}

		const prefixes = [`${context.site.origin}${basePath}`, basePath]

		for (const anchor of document.querySelectorAll('a[href]')) {
			const href = anchor.getAttribute('href') ?? ''
			if (prefixes.every((prefix) => !isWithinPrefix(href, prefix))) {
				continue
			}

			const updated = href.replace(HTML_SUFFIX_REGEX, '')
			if (updated !== href) {
				anchor.setAttribute('href', updated)
			}
		}

		return document
	})
}
