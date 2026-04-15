/**
 * Strips trailing slash
 */
export function stripTrailingSlash(string: string): string {
	if (string.endsWith('/')) {
		return string.slice(0, -1)
	}

	return string
}
