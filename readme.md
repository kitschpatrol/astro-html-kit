<!-- title -->

# astro-html-kit

<!-- /title -->

<!-- badges -->

[![NPM Package astro-html-kit](https://img.shields.io/npm/v/astro-html-kit.svg)](https://npmjs.com/package/astro-html-kit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/kitschpatrol/astro-html-kit/actions/workflows/ci.yml/badge.svg)](https://github.com/kitschpatrol/astro-html-kit/actions/workflows/ci.yml)

<!-- /badges -->

<!-- short-description -->

**Astro integration and middleware to clean up your HTML.**

<!-- /short-description -->

## Overview

Astro renders clean HTML, but the final output often needs small fixes that are tedious to handle per-page: stripping `.html` suffixes from links, annotating external URLs, deduplicating IDs across repeated content, or trimming trailing whitespace.

`astro-html-kit` runs these transforms as Astro middleware. The point of collecting them in one place is efficiency: every HTML response is parsed into a DOM once, all handlers operate on that single parsed document, and it's serialized back to HTML once. No matter how many transforms you enable, the cost is one parse/serialize round-trip — not one per transform. String-level handlers then run on the serialized output. Even with no transforms enabled, the [linkedom](https://github.com/nicolo-ribaudo/linkedom) round-trip normalizes the HTML.

Some of these transforms (like fixing numeric IDs or deduplicating headings) could be implemented as rehype plugins, which would be more efficient since they'd run during Markdown/MDX compilation rather than on the final HTML. The trade-off is that rehype only covers the Markdown pipeline. Running as middleware means every Astro-rendered page is covered — `.astro` templates, framework components, and Markdown/MDX alike.

Built-in transforms:

- **`annotateExternalLinks`** — Add `data-external-link` and `rel="noopener noreferrer"` to links pointing outside your site.
- **`addLinkPrefix`** — Prefix `/_astro/` asset paths with `BASE_URL`.
- **`stripLinkSuffix`** — Remove `.html` from internal link hrefs.
- **`fixNumericIds`** — Prefix IDs that start with a digit (e.g. `id="2024-updates"` becomes `id="id-2024-updates"`) to avoid issues with CSS selectors and JavaScript APIs.
- **`deduplicateIds`** — Append `-2`, `-3`, etc. to duplicate IDs on the page, matching `github-slugger` behavior but page-wide.
- **`trimTrailingWhitespace`** — Trim trailing whitespace from each line of the HTML output.

All transforms are disabled by default and must be explicitly enabled.

Two ways to use `astro-html-kit`:

1. **As middleware** (`astro-html-kit/middleware`) — Full control over the handler pipeline, with support for custom DOM and string handlers.
2. **As an integration** (`astro-html-kit`) — Zero-config convenience. Registers middleware automatically via `addMiddleware`. No custom handlers (functions can't be serialized), but all built-in transforms are available.

## Getting started

### Prerequisites

An [Astro](https://astro.build/) 6+ project.

### Installation

```bash
pnpm add astro-html-kit
```

### Integration setup

The simplest way to use `astro-html-kit` is as an Astro integration:

```ts
// In astro.config.ts
import htmlKit from 'astro-html-kit'
import { defineConfig } from 'astro/config'

export default defineConfig({
  integrations: [
    htmlKit({
      annotateExternalLinks: true,
      deduplicateIds: true,
      fixNumericIds: true,
      stripLinkSuffix: true,
      trimTrailingWhitespace: true,
    }),
  ],
  site: 'https://example.com',
})
```

### Middleware setup

For custom handlers or finer control, use the middleware export directly in your `src/middleware.ts`:

```ts
// In src/middleware.ts
import { htmlKit } from 'astro-html-kit/middleware'

export const onRequest = htmlKit({
  annotateExternalLinks: true,
  stripLinkSuffix: true,
})
```

Compose with other middleware using Astro's `sequence`:

```ts
// In src/middleware.ts
import { htmlKit } from 'astro-html-kit/middleware'
import { sequence } from 'astro:middleware'

export const onRequest = sequence(htmlKit({ annotateExternalLinks: true }), myOtherMiddleware)
```

## Configuration

All options apply to both the integration and middleware configs, except `customDomHandler` and `customStringHandler` which are middleware-only (functions can't be serialized through the integration's virtual module).

| Option                   | Type                                                   | Default | Description                                                           |
| ------------------------ | ------------------------------------------------------ | ------- | --------------------------------------------------------------------- |
| `addLinkPrefix`          | `boolean`                                              | `false` | Prefix `/_astro/` asset paths with `BASE_URL`.                        |
| `annotateExternalLinks`  | `boolean`                                              | `false` | Add `data-external-link` and `rel` to external links.                 |
| `deduplicateIds`         | `boolean`                                              | `false` | Append `-2`, `-3`, etc. to duplicate IDs.                             |
| `fixNumericIds`          | `boolean \| string`                                    | `false` | Prefix numeric IDs. `true` uses `id-`, a string sets a custom prefix. |
| `stripLinkSuffix`        | `boolean`                                              | `false` | Remove `.html` from internal link hrefs. Requires `site` in config.   |
| `trimTrailingWhitespace` | `boolean`                                              | `false` | Trim trailing whitespace from each line of the HTML output.           |
| `customDomHandler`       | `DomMiddlewareHandler \| DomMiddlewareHandler[]`       | —       | Custom DOM transform(s). Middleware only.                             |
| `customStringHandler`    | `StringMiddlewareHandler \| StringMiddlewareHandler[]` | —       | Custom string transform(s). Middleware only.                          |

## Custom handlers

### DOM handlers

DOM handlers receive an Astro `APIContext` and a linkedom `Document`, and return a (possibly mutated) `Document`. They run before serialization.

```ts
// Src/middleware.ts
import { defineDomMiddleware, htmlKit } from 'astro-html-kit/middleware'

const addTimestamp = defineDomMiddleware((_context, document) => {
  document.body.dataset.rendered = new Date().toISOString()
  return document
})

export const onRequest = htmlKit({
  customDomHandler: addTimestamp,
})
```

### String handlers

String handlers receive the serialized HTML string after all DOM handlers have run. They're useful for text-level transformations that don't need a DOM tree.

```ts
// Src/middleware.ts
import { defineStringMiddleware, htmlKit } from 'astro-html-kit/middleware'

const addComment = defineStringMiddleware(
  (_context, html) => `<!-- generated by astro-html-kit -->\n${html}`,
)

export const onRequest = htmlKit({
  customStringHandler: addComment,
  trimTrailingWhitespace: true,
})
```

### Execution order

1. Built-in DOM handlers (in config order: `annotateExternalLinks`, `addLinkPrefix`, `stripLinkSuffix`, `fixNumericIds`, `deduplicateIds`)
2. Custom DOM handlers
3. Serialization via linkedom `toString()`
4. Built-in string handlers (`trimTrailingWhitespace`)
5. Custom string handlers

## How it works

`astro-html-kit` middleware intercepts Astro's HTML responses after rendering. Only responses with `content-type: text/html` are processed — JSON, CSS, and other content types pass through untouched.

The HTML is parsed into a DOM via [linkedom](https://github.com/nicolo-ribaudo/linkedom), a lightweight server-side DOM implementation. All DOM handlers share the same parsed document (one parse/serialize cycle, regardless of how many handlers run). After DOM transforms complete, the document is serialized back to HTML and passed through any string handlers.

This architecture means transforms apply to all Astro-rendered HTML regardless of source: `.astro` pages, Markdown, MDX, and framework components.

## Exports

### `astro-html-kit` (integration)

| Export                           | Description                                         |
| -------------------------------- | --------------------------------------------------- |
| `default` (function)             | `htmlKit(config?)` — Returns an `AstroIntegration`. |
| `HtmlKitConfig` (type)           | Integration config type.                            |
| `HtmlKitMiddlewareConfig` (type) | Full middleware config type.                        |
| `DomMiddlewareHandler` (type)    | DOM handler function signature.                     |

### `astro-html-kit/middleware`

| Export                            | Description                                                                  |
| --------------------------------- | ---------------------------------------------------------------------------- |
| `htmlKit`                         | Middleware factory. Returns an Astro `MiddlewareHandler`.                    |
| `defineDomMiddleware`             | Identity function for typing DOM handlers.                                   |
| `defineStringMiddleware`          | Identity function for typing string handlers.                                |
| `defineDomMiddlewareAsMiddleware` | Wrap a single DOM handler as a standalone `MiddlewareHandler`.               |
| `domSequence`                     | Lower-level API: compose DOM and string handlers into a `MiddlewareHandler`. |
| `HtmlKitMiddlewareConfig` (type)  | Middleware config type.                                                      |
| `DomMiddlewareHandler` (type)     | `(context: APIContext, document: Document) => Document \| Promise<Document>` |
| `StringMiddlewareHandler` (type)  | `(context: APIContext, html: string) => string \| Promise<string>`           |
| `DomSequenceOptions` (type)       | Options for `domSequence`.                                                   |

## Maintainers

[@kitschpatrol](https://github.com/kitschpatrol)

<!-- contributing -->

## Contributing

[Issues](https://github.com/kitschpatrol/astro-html-kit/issues) and pull requests are welcome.

<!-- /contributing -->

<!-- license -->

## License

[MIT](license.txt) © Eric Mika

<!-- /license -->
