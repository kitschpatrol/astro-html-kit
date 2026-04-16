import { defineDomMiddleware } from './dom-middleware'

export const externalLinkAnnotator = defineDomMiddleware((context, document) => {
	const localHostname = 'localhost'
	const { hostname: ourHostname } = context.site ?? { hostname: '' }
	// TODO Not on hero pages for starlight?
	for (const element of document.querySelectorAll<HTMLAnchorElement>(
		'a[href]:not([href^="#"]):not([href^="/"])',
	)) {
		try {
			const { hostname } = new URL(element.href)
			if (hostname !== ourHostname && hostname !== localHostname && hostname !== '') {
				element.dataset.externalLink = ''
				element.setAttribute('rel', 'noopener noreferrer')
			}
		} catch {
			// Assume invalid URLs are internal
		}
	}

	return document
})
