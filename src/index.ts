import type { AstroIntegration } from 'astro'
import type { HtmlKitMiddlewareConfig } from './middleware'

const virtualModuleId = 'virtual:astro-html-kit/middleware'
const resolvedVirtualModuleId = `\0${virtualModuleId}`
const virtualModuleIdFilter = /^virtual:astro-html-kit\/middleware$/v
const resolvedVirtualModuleIdFilter = /^\0virtual:astro-html-kit\/middleware$/v

/**
 * Integration configuration for astro-html-kit.
 *
 * Same as `HtmlKitMiddlewareConfig` but without `customDomHandler` and
 * `customStringHandler`, since function handlers can't be serialized through
 * the integration's virtual module. Use the middleware export directly
 * (`astro-html-kit/middleware`) if you need custom handlers.
 */
export type HtmlKitConfig = Omit<
	HtmlKitMiddlewareConfig,
	'customDomHandler' | 'customStringHandler'
>

/**
 * Astro integration for astro-html-kit.
 *
 * Automatically registers the middleware via `addMiddleware`. For custom DOM
 * handlers, use the middleware export directly instead.
 *
 * @example
 * 	// astro.config.ts
 * 	import htmlKit from 'astro-html-kit'
 * 	export default defineConfig({
 * 		integrations: [htmlKit()],
 * 	})
 *
 * @example
 * 	// With options
 * 	import htmlKit from 'astro-html-kit'
 * 	export default defineConfig({
 * 		integrations: [htmlKit({ stripLinkSuffix: false })],
 * 	})
 */
export default function htmlKit(config?: HtmlKitConfig): AstroIntegration {
	const virtualModulePlugin = {
		load: {
			filter: { id: resolvedVirtualModuleIdFilter },
			handler() {
				return `import { htmlKit } from 'astro-html-kit/middleware';\nexport const onRequest = htmlKit(${JSON.stringify(config ?? {})});`
			},
		},
		name: 'astro-html-kit:virtual',
		resolveId: {
			filter: { id: virtualModuleIdFilter },
			handler() {
				return resolvedVirtualModuleId
			},
		},
	}

	return {
		hooks: {
			'astro:config:setup'({ addMiddleware, updateConfig }) {
				updateConfig({
					vite: {
						plugins: [virtualModulePlugin],
					},
				})

				addMiddleware({
					entrypoint: virtualModuleId,
					order: 'pre',
				})
			},
		},
		name: 'astro-html-kit',
	}
}

export type { DomMiddlewareHandler, HtmlKitMiddlewareConfig } from './middleware'
