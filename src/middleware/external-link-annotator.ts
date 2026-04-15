import { defineDomMiddleware } from './dom-middleware'

export const externalLinkAnnotator = defineDomMiddleware((context, document) => {
	const localHostname = 'localhost'
	const { hostname: ourHostname } = context.site ?? { hostname: '' }
	// Not on hero pages
	for (const element of document.querySelectorAll<HTMLAnchorElement>('a')) {
		try {
			const { hostname } = new URL(element.href)
			console.log(hostname)
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
