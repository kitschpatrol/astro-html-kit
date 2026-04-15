import { addLinkPrefix } from './add-link-prefix'
import { domSequence } from './dom-middleware'
import { externalLinkAnnotator } from './external-link-annotator'
import { stripLinkSuffix } from './strip-link-suffix'

export const onRequest = domSequence(externalLinkAnnotator, addLinkPrefix, stripLinkSuffix)
