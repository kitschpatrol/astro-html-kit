import { defineDomMiddleware } from './dom-middleware'
import { stripTrailingSlash } from './utilities'
const { BASE_URL: baseUrl } = import.meta.env

// Match `.html` at the end of the path, or immediately before a query
// (`?`) or fragment (`#`), so that `/about.html?x=1` and `/about.html#top`
// are also stripped to `/about?x=1` and `/about#top`.
const HTML_SUFFIX_REGEX = /\.html(?=$|[?#])/

export const stripLinkSuffix = defineDomMiddleware((context, document) => {
	if (!context.site || !baseUrl) {
		return document
	}

	const baseValues = [
		`${stripTrailingSlash(context.site.toString())}${stripTrailingSlash(baseUrl)}`,
		baseUrl,
	]

	for (const anchor of document.querySelectorAll('a')) {
		const href = anchor.getAttribute('href')
		if (!href) {
			continue
		}

		const isInternal = baseValues.some((base) => href.startsWith(base))
		if (!isInternal) {
			continue
		}

		const updated = href.replace(HTML_SUFFIX_REGEX, '')
		if (updated !== href) {
			anchor.setAttribute('href', updated)
		}
	}

	return document
})
