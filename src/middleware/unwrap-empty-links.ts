import { defineDomMiddleware } from './dom-middleware'

/**
 * DOM middleware that replaces `<a>` elements with a missing, empty, or
 * whitespace-only `href` attribute with their children. The anchor itself is
 * removed; its inner text and elements remain in place.
 */
export const unwrapEmptyLinks = defineDomMiddleware((_context, document) => {
	for (const anchor of document.querySelectorAll('a')) {
		const href = anchor.getAttribute('href')
		if (href !== null && href.trim() !== '') {
			continue
		}

		const parent = anchor.parentNode
		if (parent === null) {
			continue
		}

		while (anchor.firstChild) {
			parent.insertBefore(anchor.firstChild, anchor)
		}

		anchor.remove()
	}

	return document
})
