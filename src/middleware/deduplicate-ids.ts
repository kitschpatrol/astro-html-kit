import { defineDomMiddleware } from './dom-middleware'

/**
 * DOM middleware that deduplicates IDs on the page by appending `-2`, `-3`,
 * etc. to subsequent occurrences. Mirrors the behavior of `github-slugger`
 * but operates page-wide across all rendered content.
 */
export const deduplicateIds = defineDomMiddleware((_context, document) => {
	const seen = new Map<string, number>()

	for (const element of document.querySelectorAll('[id]')) {
		const id = element.getAttribute('id')
		if (!id) continue

		const count = seen.get(id) ?? 0
		seen.set(id, count + 1)

		if (count > 0) {
			const newId = `${id}-${count + 1}`
			element.setAttribute('id', newId)
		}
	}

	return document
})
