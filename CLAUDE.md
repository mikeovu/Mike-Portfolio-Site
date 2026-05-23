# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a Hugo static site portfolio for Mike Vu, using the [Blowfish theme](https://blowfish.page/docs/). Content is written in Markdown and deployed to `mikeavuportfolio.com`.

## Commands

```bash
# Start local dev server (hot reload, drafts hidden)
hugo server

# Start local dev server including draft posts
hugo server -D

# Build the production site to public/
hugo

# Create a new post (page bundle)
hugo new posts/post-name/index.md
```

## Configuration

Configuration is split across `config/_default/` (takes precedence over the root `hugo.toml`):

- `hugo.toml` — base URL, pagination, taxonomies, output formats
- `params.toml` — theme behavior (color scheme, layouts, article display options)
- `menus.en.toml` — navigation menu items
- `languages.en.toml` — author info (name, image, social links), display name

The root `hugo.toml` is a minimal fallback; prefer editing files in `config/_default/`.

## Content Structure

Content lives in `content/` as [Hugo page bundles](https://gohugo.io/content-management/page-bundles/):

- **Section pages** use `_index.md` (e.g., `content/posts/HTB-AI-Red-Teamer/_index.md`) — these render as list pages
- **Leaf pages** use `index.md` (e.g., `content/posts/HTB-AI-Red-Teamer/Supervised_Learning_Algorithms/index.md`) — these are individual articles
- Images are co-located with the post in the same directory and referenced by filename only (e.g., `![alt](image.png)`)

## Front Matter Conventions

All posts use YAML front matter (`---` delimiters). Standard fields:

```yaml
---
title: "Post Title"
date: 2025-01-01
draft: false
author: "Mike Vu"
description: "Short description"
tags: [Tag1, Tag2]
categories: [Guides]
layout: background      # optional: applies background hero style to the page
---
```

- `categories` is almost always `[Guides]`
- `layout: background` enables the full-bleed background hero (used on most posts)
- Omit `date` if the post doesn't need chronological ordering

## Theme Customization

The Blowfish theme lives in `themes/blowfish/` — avoid editing it directly, as it is a third-party dependency. Override layouts by creating matching files in `layouts/` at the root. Custom CSS/JS/images go in `assets/`.

Key layout options (set in `params.toml` or per-page front matter):
- `heroStyle`: `basic`, `big`, `background`, `thumbAndBackground`
- `layout` (homepage): `page`, `profile`, `hero`, `card`, `background`, `custom`
