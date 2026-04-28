import { defineDomMiddleware } from './dom-middleware'
import { stripTrailingSlash } from './utilities'

const { BASE_URL: baseUrl } = import.meta.env

const ASTRO_PATH_PREFIX = '/_astro/'

const URL_ATTRIBUTES = ['href', 'src'] as const

function rewriteSrcset(value: string, prefix: string): string {
	return value
		.split(',')
		.map((candidate) => {
			const leading = /^\s*/.exec(candidate)?.[0] ?? ''
			const rest = candidate.slice(leading.length)
			if (rest.startsWith(ASTRO_PATH_PREFIX)) {
				return `${leading}${prefix}${rest}`
			}

			return candidate
		})
		.join(',')
}

export const addLinkPrefix = defineDomMiddleware((_context, document) => {
	const prefix = stripTrailingSlash(baseUrl)
	if (!prefix) {
		return document
	}

	for (const element of document.querySelectorAll('[href], [src], [srcset]')) {
		for (const attribute of URL_ATTRIBUTES) {
			const value = element.getAttribute(attribute)
			if (value?.startsWith(ASTRO_PATH_PREFIX)) {
				element.setAttribute(attribute, `${prefix}${value}`)
			}
		}

		const srcset = element.getAttribute('srcset')
		if (srcset) {
			const updated = rewriteSrcset(srcset, prefix)
			if (updated !== srcset) {
				element.setAttribute('srcset', updated)
			}
		}
	}

	return document
})
