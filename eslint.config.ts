import { eslintConfig } from '@kitschpatrol/eslint-config'

export default eslintConfig({
	astro: true,
	ignores: [
		// Directives and attributes make a mess of MDX linting
		'playground/**/*.mdx',
		'playground-starlight/**/*.mdx',
		// Astro code blocks in markdown aren't part of any tsconfig program
		'**/*.md/*.astro',
	],
	type: 'lib',
})
