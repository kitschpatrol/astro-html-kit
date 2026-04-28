import { defineDomMiddleware } from './dom-middleware'

/**
 * DOM middleware that deduplicates IDs on the page by appending `-2`, `-3`,
 * etc. to subsequent occurrences. Mirrors the behavior of `github-slugger` but
 * operates page-wide across all rendered content.
 *
 * If a generated suffixed ID would itself collide with another ID on the page,
 * the suffix is incremented further until a free slot is found.
 */
export const deduplicateIds = defineDomMiddleware((_context, document) => {
	const taken = new Set<string>()
	const counts = new Map<string, number>()

	for (const element of document.querySelectorAll('[id]')) {
		const id = element.getAttribute('id')
		if (!id) {
			continue
		}

		let result = id
		while (taken.has(result)) {
			const count = (counts.get(id) ?? 1) + 1
			counts.set(id, count)
			result = `${id}-${count}`
		}

		taken.add(result)

		if (result !== id) {
			element.setAttribute('id', result)
		}
	}

	return document
})
