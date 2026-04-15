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
				{
					items: [
						{ label: 'Picture', slug: 'components/picture' },
						{ label: 'Video', slug: 'components/video' },
						{ label: 'Audio', slug: 'components/audio' },
						{ label: 'Caption', slug: 'components/caption' },
						{ label: 'Zoom', slug: 'components/zoom' },
					],
					label: 'Components',
				},
				{
					items: [{ label: 'Syntax & Directives', slug: 'mdx/syntax' }],
					label: 'MDX',
				},
			],
			title: 'astro-html-kit',
		}),
	],
	site: 'http://localhost:4321',
})
