import { defineDomMiddleware } from './dom-middleware'

const NUMERIC_ID_REGEX = /^\d/v

// Attributes whose value is one or more whitespace-separated ID references.
// Some accept a single ID and others a list, but splitting on whitespace
// handles both forms uniformly.
const ID_REFERENCE_ATTRIBUTES = [
	'aria-activedescendant',
	'aria-controls',
	'aria-describedby',
	'aria-details',
	'aria-errormessage',
	'aria-flowto',
	'aria-labelledby',
	'aria-owns',
	'commandfor',
	'for',
	'form',
	'headers',
	'list',
	'popovertarget',
] as const

const ID_REFERENCE_SELECTOR = ID_REFERENCE_ATTRIBUTES.map((attribute) => `[${attribute}]`).join(
	', ',
)

const WHITESPACE_SPLIT_REGEX = /\s+/v

/**
 * Creates a DOM middleware handler that prefixes numeric IDs to ensure valid
 * HTML identifiers. Also updates anchor `<a href="#…">` links and the `for`,
 * `form`, `headers`, `list`, `popovertarget`, `commandfor`, and aria-*
 * attributes that reference IDs so that existing references continue to
 * resolve.
 *
 * Markdown headings like `## 2024 Updates` generate `id="2024-updates"`, which
 * starts with a digit. While valid in HTML5, this causes issues with CSS
 * selectors and some JavaScript APIs. This handler rewrites them to e.g.
 * `id="id-2024-updates"`.
 */
export function createFixNumericIds(prefix: string) {
	const fullPrefix = `${prefix}-`
	const prefixIfNumeric = (id: string): string =>
		NUMERIC_ID_REGEX.test(id) ? `${fullPrefix}${id}` : id

	return defineDomMiddleware((_context, document) => {
		for (const element of document.querySelectorAll('[id]')) {
			const id = element.getAttribute('id') ?? ''
			if (NUMERIC_ID_REGEX.test(id)) {
				element.setAttribute('id', `${fullPrefix}${id}`)
			}
		}

		for (const anchor of document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')) {
			const href = anchor.getAttribute('href') ?? ''
			if (href.length > 1 && NUMERIC_ID_REGEX.test(href.slice(1))) {
				anchor.setAttribute('href', `#${fullPrefix}${href.slice(1)}`)
			}
		}

		for (const element of document.querySelectorAll(ID_REFERENCE_SELECTOR)) {
			for (const attribute of ID_REFERENCE_ATTRIBUTES) {
				const value = element.getAttribute(attribute) ?? ''
				if (value === '') {
					continue
				}

				const updated = value
					.split(WHITESPACE_SPLIT_REGEX)
					.map((id) => prefixIfNumeric(id))
					.join(' ')
				if (updated !== value) {
					element.setAttribute(attribute, updated)
				}
			}
		}

		return document
	})
}
