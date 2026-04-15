import { defineStringMiddleware } from './dom-middleware'

/**
 * String middleware that trims trailing whitespace from each line of the HTML
 * output.
 */
export const trimTrailingWhitespace = defineStringMiddleware((_context, html) =>
	html
		.split('\n')
		.map((line) => line.trimEnd())
		.join('\n'),
)
