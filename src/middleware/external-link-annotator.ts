import { defineDomMiddleware } from './dom-middleware'

const WHITESPACE_SPLIT_REGEX = /\s+/v

/**
 * DOM middleware that adds `data-external-link` and `rel="noopener noreferrer"`
 * to links pointing outside the site. Existing `rel` tokens are preserved.
 * Requires `site` to be set in the Astro config so internal and external links
 * can be distinguished.
 */
export const externalLinkAnnotator = defineDomMiddleware((context, document) => {
	if (!context.site) {
		return document
	}

	const localHostname = 'localhost'
	const { hostname: ourHostname } = context.site
	// TODO Not on hero pages for starlight?
	for (const element of document.querySelectorAll<HTMLAnchorElement>(
		'a[href]:not([href^="#"]):not([href^="/"])',
	)) {
		try {
			const { hostname } = new URL(element.href)
			if (hostname !== ourHostname && hostname !== localHostname && hostname !== '') {
				element.dataset.externalLink = ''
				const tokens = new Set(
					(element.getAttribute('rel') ?? '')
						.split(WHITESPACE_SPLIT_REGEX)
						.filter((token) => token !== ''),
				)
				tokens.add('noopener')
				tokens.add('noreferrer')
				element.setAttribute('rel', [...tokens].join(' '))
			}
		} catch {
			// Assume invalid URLs are internal
		}
	}

	return document
})
