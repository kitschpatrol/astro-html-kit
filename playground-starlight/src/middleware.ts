import { defineDomMiddleware, htmlKit } from 'astro-html-kit/middleware'

const addProcessedAttribute = defineDomMiddleware((_context, document) => {
	document.body.dataset.processed = 'true'
	return document
})

export const onRequest = htmlKit({
	addLinkPrefix: true,
	annotateExternalLinks: true,
	custom: addProcessedAttribute,
	stripLinkSuffix: true,
})
