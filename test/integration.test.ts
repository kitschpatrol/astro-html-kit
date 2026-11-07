import type { AstroIntegration } from 'astro'
import { describe, expect, it } from 'vitest'
import htmlKit from '../src/index'

const virtualModuleId = 'virtual:astro-html-kit/middleware'

async function runConfigSetup(integration: AstroIntegration) {
	type SetupOptions = Parameters<NonNullable<AstroIntegration['hooks']['astro:config:setup']>>[0]

	type VirtualModulePlugin = {
		load: { filter: { id: RegExp }; handler: () => string }
		name: string
		resolveId: { filter: { id: RegExp }; handler: () => string }
	}

	const middlewares: unknown[] = []
	let plugin: undefined | VirtualModulePlugin

	await integration.hooks['astro:config:setup']?.({
		addMiddleware(middleware: unknown) {
			middlewares.push(middleware)
		},
		updateConfig(config: { vite?: { plugins?: unknown[] } }) {
			plugin = config.vite?.plugins?.[0] as VirtualModulePlugin
		},
	} as unknown as SetupOptions)

	return { middlewares, plugin: plugin! }
}

describe('htmlKit integration', () => {
	it('registers the virtual middleware module ahead of user middleware', async () => {
		const { middlewares } = await runConfigSetup(htmlKit())
		expect(middlewares).toEqual([{ entrypoint: virtualModuleId, order: 'pre' }])
	})

	it('resolves and loads the virtual module with the serialized config', async () => {
		const { plugin } = await runConfigSetup(
			htmlKit({ fixNumericIds: 'heading', stripLinkSuffix: true }),
		)
		expect(plugin.resolveId.filter.id.test(virtualModuleId)).toBe(true)

		const resolvedId = plugin.resolveId.handler()
		expect(resolvedId).toBe(`\0${virtualModuleId}`)
		expect(plugin.load.filter.id.test(resolvedId)).toBe(true)
		expect(plugin.load.filter.id.test(virtualModuleId)).toBe(false)

		expect(plugin.load.handler()).toBe(
			`import { htmlKit } from 'astro-html-kit/middleware';\nexport const onRequest = htmlKit({"fixNumericIds":"heading","stripLinkSuffix":true});`,
		)
	})

	it('serializes an empty config when none is given', async () => {
		const { plugin } = await runConfigSetup(htmlKit())
		expect(plugin.load.handler()).toContain('htmlKit({})')
	})

	it('rejects custom handlers, which cannot be serialized', () => {
		const customDomHandler = (_context: unknown, document: Document) => document
		expect(() => htmlKit({ customDomHandler } as never)).toThrow('customDomHandler')
		expect(() => htmlKit({ customStringHandler: undefined } as never)).toThrow(
			'customStringHandler',
		)
	})
})
