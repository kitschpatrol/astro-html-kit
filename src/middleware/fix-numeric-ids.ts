import { defineDomMiddleware } from './dom-middleware'

const NUMERIC_ID_REGEX = /^\d/
const NUMERIC_HREF_REGEX = /^#\d/

/**
 * Creates a DOM middleware handler that prefixes numeric IDs to ensure valid
 * HTML identifiers. Also updates anchor links and `[aria-*]` attributes
 * pointing to those IDs.
 *
 * Markdown headings like `## 2024 Updates` generate `id="2024-updates"`, which
 * starts with a digit. While valid in HTML5, this causes issues with CSS
 * selectors and some JavaScript APIs. This handler rewrites them to e.g.
 * `id="id-2024-updates"`.
 */
export function createFixNumericIds(prefix: string) {
	const fullPrefix = `${prefix}-`

	return defineDomMiddleware((_context, document) => {
		for (const element of document.querySelectorAll('[id]')) {
			const id = element.getAttribute('id')
			if (id && NUMERIC_ID_REGEX.test(id)) {
				element.setAttribute('id', `${fullPrefix}${id}`)
			}
		}

		for (const anchor of document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')) {
			const href = anchor.getAttribute('href')
			if (href && NUMERIC_HREF_REGEX.test(href)) {
				anchor.setAttribute('href', `#${fullPrefix}${href.slice(1)}`)
			}
		}

		return document
	})
}
