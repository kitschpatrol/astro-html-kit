# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.6.1] - 2026-11-07

### Maintenance

- Refresh development and release tooling, including `@kitschpatrol/chagent`, `@kitschpatrol/shared-config`, Vitest, and pnpm.
- Add a pnpm package extension declaring `@emnapi/runtime@1.11.3` for `@astrojs/astro2tsx@0.1.3` to match its pinned `@emnapi/core` dependency.
- Update GitHub Actions for pnpm installation, repository metadata synchronization, and dependency-update automation.

## [0.6.0] - 2026-11-06

### Changed

- **Breaking:** Raise the Astro peer dependency requirement from `^7.0.0` to `^7.4.7`.

### Fixed

- Preserve anchors with an `id` or `name` when `unwrapEmptyLinks` runs, keeping fragment navigation intact.
- Annotate protocol-relative links to external hosts with `data-external-link` and `rel="noopener noreferrer"`.
- Read `BASE_URL` through Astro's statically replaceable property access so asset prefixing and link suffix removal use the configured base in builds.
- Make `stripLinkSuffix` respect base-path boundaries and the site's exact origin, preventing rewrites of similarly prefixed paths, hosts, and ports.
- Preserve CRLF line endings when `trimTrailingWhitespace` removes trailing spaces and tabs.
- Rewrite `form`, `list`, `popovertarget`, and `commandfor` references when `fixNumericIds` prefixes their target IDs.
- Reject unsupported custom-handler options in integration configuration with an error directing callers to `astro-html-kit/middleware`, instead of silently dropping handlers.

### Documentation

- Expand README and configuration-type documentation for link classification, ID-reference rewriting, duplicate-ID references, fragment targets, and preserved line endings.
- Document middleware ordering with `sequence()`, response buffering, fragment serialization, and linkedom's markup normalization even when transforms are disabled.

### Maintenance

- Integrate `@kitschpatrol/chagent` into changelog generation during releases and upgrade the GitHub release-changelog action to v3.
- Update the `linkedom` dependency requirement from `^0.18.14` to `^0.18.15`.
- Remove unused `node-gyp` and `node-addon-api` development dependencies.
- Add integration tests for virtual-module resolution, configuration serialization, middleware registration, and invalid handlers; expand link-transform coverage for non-root bases and `srcset`.

## [0.5.4] - 2026-11-02

### Maintenance

- Update the runtime linkedom requirement to `^0.18.14`.
- Refresh development tooling, including shared-config 8.14 and pnpm 12.16.1, and simplify lint configuration and external-link hostname checks.
- Run Astro synchronization during `prepare`, move contributor skills to pnpm-managed installation, and simplify repository cleanup.
- Update release and dependency-update actions and change scheduled dependency updates from weekly to monthly.
- Skip loopback URLs during automated link checks and allow checks with no URLs to succeed.

## [0.5.3] - 2026-10-07

### Changed

- **Breaking:** Narrow Node.js support to `^24.16.0 || >=26.3.0`, excluding Node.js 25 and 26.0–26.2.

### Documentation

- Generate README prerequisites from package metadata, documenting the exact Node.js and Astro requirements.

### Maintenance

- Declare the published package side-effect-free for bundlers.
- Upgrade to pnpm 12 and Vitest 5, refresh development dependencies, and adapt source and lint configuration to stricter shared-config rules.
- Add scheduled/manual dependency-update PR automation, pin release and metadata actions to commit SHAs, and correct sitemap-discovery error capture.
- Synchronize contributor skills during `prepare` and rename `clean` to `clean-deep`.

## [0.5.2] - 2026-08-26

### Maintenance

- Refresh development dependencies and pnpm, including shared-config 8.7 and Astro 7.2, and update CSpell release-age exemptions.
- Improve website link checks by loading Lychee configuration, discovering sitemap links from the homepage, and pinning discovery tools.
- Use an npm one-time password from 1Password when publishing releases.

## [0.5.1] - 2026-08-05

### Changed

- **Breaking:** Raise the consumer Node.js requirement from `>=22.12.0` to `>=24.16.0`.

### Documentation

- Update README links to canonical npm and MIT license URLs.

### Maintenance

- Update the runtime linkedom requirement to `^0.18.13`.
- Refresh development dependencies, including shared-config 8.6 and bumpp 12, update pnpm, and adopt shared Astro TypeScript defaults.
- Add scheduled repository and website link checks and refresh GitHub Actions.
- Tighten release-tag matching and reject GitHub releases for tags outside the repository's default branch.
- Add VS Code lint/fix tasks, rename playground scripts to `dev` and `dev-starlight`, and exclude placeholder Astro pages from the npm package.

## [0.5.0] - 2026-07-07

### Changed

- **Breaking:** Require Astro 7 (`^7.0.0`) and adapt the integration's virtual-module plugin to its Vite 8 toolchain.

### Fixed

- Preserve existing external-link `rel` tokens when adding `noopener` and `noreferrer`, without duplicating tokens.
- Skip external-link annotation when Astro's `site` setting is absent.

### Documentation

- Update Astro prerequisites and explain Astro 7's Sätteri processor and rehype opt-in requirements.
- Clarify external-link annotation's `site` requirement and preservation of `rel` tokens, and correct linkedom repository links.

### Maintenance

- Upgrade shared-config to 8 and TypeScript to 6, refresh development tooling, and raise the contributor Node.js requirement to 24.16.
- Add focused tests for trailing-whitespace transforms and string handlers operating on serialized HTML.

## [0.4.0] - 2026-06-11

### Changed

- **Breaking:** Raise the Astro peer requirement from `^6.0.0` to `^6.4.0`.

### Maintenance

- Refresh development dependencies and update pnpm to 11.5.1.

## [0.3.2] - 2026-05-17

### Maintenance

- Roll back the development compiler from TypeScript 6 to TypeScript `~5.9.3`.

## [0.3.1] - 2026-05-16

### Documentation

- Correct the README's MIT license link.

### Maintenance

- Upgrade to pnpm 11, migrate dependency build approvals to `allowBuilds`, and refresh development dependencies and GitHub Actions.
- Pass npm authentication directly to the publishing command in the release script.

## [0.3.0] - 2026-04-29

### Added

- Add opt-in `unwrapEmptyLinks` support to replace anchors with missing, empty, or whitespace-only `href` attributes with their children.

### Documentation

- Document `unwrapEmptyLinks` and add descriptions and defaults to integration and middleware configuration options.

## [0.2.0] - 2026-04-28

### Maintenance

- Refresh the Astro and `@astrojs/check` development dependencies.
- Disable Astro telemetry during CI builds to prevent Windows cleanup crashes.

## [0.1.0] - 2026-04-28

### Added

- Introduce `htmlKit()` integration and middleware entry points as TypeScript ES modules for Astro 6 and Node.js 22.12+, with built-in transforms disabled by default.
- Process HTML responses, including charset-qualified content types, through a shared linkedom DOM followed by string handlers, preserving response status and headers.
- Expose `domSequence()`, `defineDomMiddleware()`, `defineStringMiddleware()`, and `defineDomMiddlewareAsMiddleware()` with configuration, handler, and options types for custom synchronous or asynchronous pipelines.
- Add external-link annotation with `data-external-link` and `rel="noopener noreferrer"`, excluding same-site and localhost links.
- Add `addLinkPrefix` to prefix `/_astro/` asset URLs in `href`, `src`, and `srcset` with Astro's `BASE_URL`.
- Add `stripLinkSuffix` to remove `.html` from internal links, including before query strings and fragments.
- Add `fixNumericIds` with default or custom prefixes, updating fragment links and ID references in `for`, `headers`, and ARIA attributes.
- Add page-wide ID deduplication with numeric suffixes that avoid collisions.
- Add `trimTrailingWhitespace` to remove trailing whitespace from each line of serialized HTML.

### Documentation

- Add installation and setup guides, configuration and export references, custom-handler examples, execution-order explanations, and contributor guidance.
- Warn that the project remains under development and is unsuitable for general use before version 1.0.

### Maintenance

- Establish TypeScript checking, middleware and transform tests, shared linting, cross-platform CI, and npm/GitHub release automation.

[0.1.0]: https://github.com/kitschpatrol/astro-html-kit/releases/tag/v0.1.0
[0.2.0]: https://github.com/kitschpatrol/astro-html-kit/compare/v0.1.0...v0.2.0
[0.3.0]: https://github.com/kitschpatrol/astro-html-kit/compare/v0.2.0...v0.3.0
[0.3.1]: https://github.com/kitschpatrol/astro-html-kit/compare/v0.3.0...v0.3.1
[0.3.2]: https://github.com/kitschpatrol/astro-html-kit/compare/v0.3.1...v0.3.2
[0.4.0]: https://github.com/kitschpatrol/astro-html-kit/compare/v0.3.2...v0.4.0
[0.5.0]: https://github.com/kitschpatrol/astro-html-kit/compare/v0.4.0...v0.5.0
[0.5.1]: https://github.com/kitschpatrol/astro-html-kit/compare/v0.5.0...v0.5.1
[0.5.2]: https://github.com/kitschpatrol/astro-html-kit/compare/v0.5.1...v0.5.2
[0.5.3]: https://github.com/kitschpatrol/astro-html-kit/compare/v0.5.2...v0.5.3
[0.5.4]: https://github.com/kitschpatrol/astro-html-kit/compare/v0.5.3...v0.5.4
[0.6.0]: https://github.com/kitschpatrol/astro-html-kit/compare/v0.5.4...v0.6.0
[0.6.1]: https://github.com/kitschpatrol/astro-html-kit/compare/v0.6.0...v0.6.1
