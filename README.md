# ACM CTF 2.0 — Official Website

Official MkDocs-based website for ACM CTF 2.0, hosted by the ACM Student Chapter at Prince Sultan University.

## Structure

```text
acm-ctf2-web/
├── docs/
│   ├── index.md
│   ├── schedule.md
│   ├── workshop.md
│   ├── resources.md
│   ├── challenges.md
│   ├── rules.md
│   ├── faq.md
│   ├── about.md
│   ├── tutorial-recon-web-proxies.md
│   ├── tutorial-access-control.md
│   ├── tutorial-injection-attacks.md
│   ├── tutorial-broken-authentication.md
│   ├── tutorial-api-exploitation-file-attacks.md
│   ├── assets/
│   │   ├── custom/
│   │   └── tutorials/
│   └── overrides/
├── mkdocs.yml
└── build_hooks.py
```

## Source of Truth

- The live site is generated from `docs/` with MkDocs.
- Shared styling and behavior live in `docs/assets/custom/` and `docs/overrides/`.
- Standalone tutorial HTML files that get embedded into tutorial pages live in `docs/assets/tutorials/`.

## Tutorial Flow

- The workshop page links to the tutorial pages in `docs/tutorial-*.md`.
- Each tutorial page embeds a standalone HTML file in an `iframe`.
- Each tutorial page also includes a direct link to open that same tutorial in a separate tab.
- When final tutorial HTML is ready, replace the matching file in `docs/assets/tutorials/`.

## Build

```bash
mkdocs serve
```

```bash
mkdocs build
```

## Deployment

GitHub Pages is configured to build and publish the MkDocs site from this repository.
