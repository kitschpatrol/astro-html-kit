import starlight from '@astrojs/starlight'
import { defineConfig } from 'astro/config'

export default defineConfig({
	integrations: [
		starlight({
			sidebar: [
				{
					items: [{ label: 'Middleware', slug: 'middleware' }],
					label: 'Tests',
				},
			],
			title: 'astro-html-kit',
		}),
	],
	site: 'http://localhost:4321',
})
