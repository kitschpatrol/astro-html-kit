import type { AstroIntegration } from 'astro'
import type { DomMiddlewareHandler } from './middleware/dom-middleware'
import htmlKitMiddleware, { onRequest } from './middleware/middleware'

/**
 * Configuration for the astro-html-kit integration.
 */
export type HtmlKitConfig = {
	addLinkPrefix?: boolean
	annotateExternalLinks?: boolean
	custom?: DomMiddlewareHandler
	stripLinkSuffix?: boolean
}

/**
 * Astro integration for astro-html-kit.
 *
 * @example
 * 	// Your astro.config.ts
 * 	import htmlKit from 'astro-html-kit'
 * 	export default defineConfig({
 * 		integrations: [htmlKit()],
 * 	})
 */
export default function htmlKit(config?: HtmlKitConfig): AstroIntegration {
	console.log(config)

	return {
		hooks: {
			'astro:config:setup'({ addMiddleware }) {
				addMiddleware({
					entrypoint: new URL('middleware/middleware.ts', import.meta.url),
					order: 'pre',
				})
			},
		},
		name: 'astro-html-kit',
	}
}
