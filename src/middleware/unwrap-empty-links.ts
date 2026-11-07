import { defineDomMiddleware } from './dom-middleware'

/**
 * DOM middleware that replaces `<a>` elements with a missing, empty, or
 * whitespace-only `href` attribute with their children. The anchor itself is
 * removed; its inner text and elements remain in place.
 *
 * Anchors with an `id` or `name` attribute are left alone, since they serve as
 * fragment targets even without an `href`.
 */
export const unwrapEmptyLinks = defineDomMiddleware((_context, document) => {
	for (const anchor of document.querySelectorAll('a')) {
		const href = anchor.getAttribute('href')
		if (href !== null && href.trim() !== '') {
			continue
		}

		if (anchor.hasAttribute('id') || anchor.hasAttribute('name')) {
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
