/**
 * Strips trailing slash
 */
export function stripTrailingSlash(string: string): string {
	return string.endsWith('/') ? string.slice(0, -1) : string
}
