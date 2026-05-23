# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Mike Vu's portfolio site, built with Astro 4 + Tailwind CSS + MDX, deployed to Azure Static Web Apps at `mikeavuportfolio.com`. All active work is in `astro-site/`. The root-level Hugo files (`content/`, `config/`, `themes/`, `public/`, `archetypes/`) are the old stack and are no longer deployed — ignore them.

## Commands

All commands run from `astro-site/`:

```bash
cd astro-site

npm run dev       # local dev server with hot reload (localhost:4321)
npm run build     # production build → astro-site/dist/
npm run preview   # serve the dist/ output locally
```

No lint or test commands are configured.

## Deployment

Pushing to `main` triggers the GitHub Actions workflow (`.github/workflows/azure-static-web-apps-ambitious-tree-075e10e10.yml`), which runs `npm ci && npm run build` inside `astro-site/`, then uploads `astro-site/dist/` to Azure Static Web Apps. No manual deploy step needed.

## Architecture

### Import alias

`@/` maps to `astro-site/src/` (configured in `tsconfig.json`). Use this for all internal imports.

### Content Collections

Content lives in `astro-site/src/content/` as Astro content collections:

- `posts/` — blog posts and nested subsections
- `about/` — the About page content and its co-located images

Schemas are defined in `astro-site/src/content/config.ts`. The key distinction between page types is the `isSection` front matter field:

- **Section pages** (`isSection: true`) — rendered by `SectionLayout`, display a list of direct child posts only (one level deep)
- **Leaf pages** (default) — rendered by `PostLayout`, show article content with TOC sidebar

The slug is the directory path under `src/content/posts/`. Nesting is unlimited (e.g., `ThousandEyes_Learning/Troubleshooting-Labs/Tshoot-Scenario-A`). Each post lives in its own directory as `index.md`, with images co-located alongside it.

### Routing

- `src/pages/posts/[...slug].astro` — handles all post routes; fetches the full collection, resolves hero images, computes reading time, dispatches to `PostLayout` or `SectionLayout`
- `src/pages/tags/[tag].astro` — tag archive pages; tags are lowercased for URL matching
- `src/pages/search.json.ts` — API endpoint that emits a JSON index consumed by the client-side Fuse.js search (`SearchModal.astro`)
- All URLs use trailing slashes (`trailingSlash: 'always'` in `astro.config.mjs`)

### Hero Images

`astro-site/src/lib/heroImage.ts` auto-discovers hero images: it first checks the `heroImage` front matter field, then falls back to a `feature.{jpg,jpeg,png,svg}` file co-located in the same directory as the post. No explicit declaration is needed if a `feature.*` file is present.

### Layouts

- `Base.astro` — HTML shell, dark mode toggle, global styles
- `PostLayout.astro` — article view with hero banner, metadata header, prose content, and sticky TOC sidebar
- `SectionLayout.astro` — section index with hero banner and direct child post cards

### Styling

Tailwind CSS with `@tailwindcss/typography` (`prose` classes) for markdown rendering. Global overrides in `astro-site/src/styles/global.css`. Config in `astro-site/tailwind.config.mjs`.

### MDX features

- Syntax highlighting via Shiki (`github-dark` theme, word wrap enabled)
- Emoji shortcodes via `remark-emoji` (e.g., `:rocket:` → 🚀)

## Content Front Matter

### Leaf post (article)

```yaml
---
title: "Post Title"
date: 2025-01-01
draft: false
description: "Short description"
tags: [Tag1, Tag2]
categories: [Guides]
---
```

### Section post (index of child pages)

```yaml
---
title: "Section Title"
isSection: true
tags: [Tag1, Tag2]
categories: [Guides]
---
```

- `draft: true` excludes the post from the build
- `heroImage` is optional; if absent, a co-located `feature.*` file is used automatically
- Hugo carry-over fields (`heroStyle`, `showTableOfContents`, `showHero`, etc.) are accepted by the schema but ignored at render time
