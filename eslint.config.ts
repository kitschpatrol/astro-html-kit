import { eslintConfig } from '@kitschpatrol/eslint-config'

export default eslintConfig({
	astro: true,
	ignores: [
		// Directives and attributes make a mess of MDX linting
		'playground/**/*.mdx',
		'playground-starlight/**/*.mdx',
	],
	type: 'lib',
})
