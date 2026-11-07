import { defineStringMiddleware } from './dom-middleware'

// Whitespace other than line terminators, running up to the end of a line.
const TRAILING_WHITESPACE_REGEX = /[^\S\r\n]+$/gmv

/**
 * String middleware that trims trailing whitespace from each line of the HTML
 * output. Line endings are preserved, so CRLF stays CRLF.
 */
export const trimTrailingWhitespace = defineStringMiddleware((_context, html) =>
	html.replaceAll(TRAILING_WHITESPACE_REGEX, ''),
)
