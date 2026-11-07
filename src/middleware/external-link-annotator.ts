import { defineDomMiddleware } from './dom-middleware'

const WHITESPACE_SPLIT_REGEX = /\s+/v

/**
 * DOM middleware that adds `data-external-link` and `rel="noopener noreferrer"`
 * to links pointing outside the site. Existing `rel` tokens are preserved.
 * Requires `site` to be set in the Astro config so internal and external links
 * can be distinguished.
 *
 * Each `href` is resolved against `site`, so relative paths, fragments, and
 * same-host absolute URLs count as internal, while protocol-relative URLs
 * (`//cdn.example.com/…`) and other hosts count as external. Links to
 * `localhost` are treated as internal to keep development output clean.
 * Non-HTTP schemes like `mailto:` have no hostname and are left alone.
 */
export const externalLinkAnnotator = defineDomMiddleware((context, document) => {
	if (!context.site) {
		return document
	}

	const internalHostnames = new Set(['', context.site.hostname, 'localhost'])

	for (const element of document.querySelectorAll<HTMLAnchorElement>('a[href]')) {
		const href = element.getAttribute('href') ?? ''

		let hostname: string
		try {
			;({ hostname } = new URL(href, context.site))
		} catch {
			// Unparsable hrefs are left untouched
			continue
		}

		if (internalHostnames.has(hostname)) {
			continue
		}

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

	return document
})
