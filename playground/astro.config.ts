import mdx from '@astrojs/mdx'
import htmlKit from 'astro-html-kit'
import { defineConfig } from 'astro/config'

process.env.BROWSER = 'chromium'

export default defineConfig({
	integrations: [
		htmlKit({ addLinkPrefix: true, annotateExternalLinks: true, stripLinkSuffix: true }),
		mdx(),
	],
	site: 'http://localhost:4321',
})
