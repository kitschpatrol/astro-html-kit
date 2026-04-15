<!-- title -->

# astro-html-kit

<!-- /title -->

<!-- badges -->

[![NPM Package astro-html-kit](https://img.shields.io/npm/v/astro-html-kit.svg)](https://npmjs.com/package/astro-html-kit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/kitschpatrol/astro-html-kit/actions/workflows/ci.yml/badge.svg)](https://github.com/kitschpatrol/astro-html-kit/actions/workflows/ci.yml)

<!-- /badges -->

<!-- short-description -->

**Astro integration for common DOM transforms and clean HTML.**

<!-- /short-description -->

## Overview

TK

It includes:

- **TK**\
  TK
- **TK**\
  TK

Two ways to use astro-html-kit:

1. As middleware (astro-html-kit/middleware) — full control, supports custom handlers:
   // src/middleware.ts
   import { htmlKit } from 'astro-html-kit/middleware'
   export const onRequest = htmlKit({ custom: myHandler })
2. As integration (astro-html-kit) — zero-config convenience, no custom (functions can't serialize):
   // astro.config.ts
   import htmlKit from 'astro-html-kit'
   export default defineConfig({
   integrations: \[htmlKit({ stripLinkSuffix: false })],
   })

## Getting started

### Prerequisites

An [Astro](https://astro.build/) 6+ project.

### Installation

```bash
pnpm add astro-html-kit
```

### Basic setup

The simplest way to use `astro-html-kit` is as an Astro integration. TK TK.

```ts
// Astro.config.ts
import htmlKit from 'astro-html-kit'
import { defineConfig } from 'astro/config'

export default defineConfig({
  integrations: [
    htmlKit({
      // TK options
    }),
  ],
})
```

Even if no middleware actions, all HTML is still run though Linkedom which performs some normalization.

### Direct middleware usage

TK

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
