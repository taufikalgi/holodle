# Third-Party Notices

The MIT license in [LICENSE](LICENSE) covers the source code in this repository.
It does not cover the items below. This file is documentation, not a license:
edit it whenever a dependency, font or image source changes.

## Fonts

**Albert Sans** is loaded through `next/font/google` (`src/app/layout.tsx`) and
embedded into the production build as self-hosted font files.

- Copyright 2021 The Albert Sans Project Authors (https://github.com/usted/Albert-Sans)
- Licensed under the SIL Open Font License, Version 1.1.
- Full license text: [LICENSES/Albert-Sans-OFL.txt](LICENSES/Albert-Sans-OFL.txt)

The OFL requires its notice and license text to accompany the font files when
they are redistributed. A build produced from this repository redistributes
those files, so keep `LICENSES/` with any build you hand to someone else.

## Runtime imagery

The application displays images that are **not** stored in this repository and
are fetched at runtime, allow-listed in `next.config.js`:

| Host | Owner / terms |
| --- | --- |
| `hololive.hololivepro.com` | COVER Corporation — Hololive talent imagery |
| `lh3.googleusercontent.com` | Google — user avatars from Google sign-in |
| `*.mzstatic.com` | Apple — artwork served through the iTunes catalogue |

These images remain the property of their owners and are governed by their own
terms. The MIT license grants no rights over them.

## Trademarks

Hololive, Hololive Production and the names and likenesses of its talents are
trademarks or copyrighted material of COVER Corporation. "Holodle" is the name
of this unofficial fan project. No trademark rights are granted by the MIT
license, and none are claimed here.

## Backend

The frontend talks to a separate, private API repository. That code is not part
of this repository and is not covered by the MIT license. The API endpoints,
responses and any data served through them remain the project owner's.

## Dependencies

Runtime dependencies are `next`, `react` and `react-dom`, all MIT-licensed.
Development dependencies (TypeScript, ESLint, Prettier, Tailwind CSS, PostCSS
and their type packages) are MIT or ISC. No copyleft dependency is bundled.

## Updating this file

Add a row or section when you introduce a new font, icon set, stock image or
remote image host. Remove the corresponding entry only when the asset no longer
ships with, or is no longer fetched by, the application — deleting a notice for
something the build still redistributes is a license violation, not cleanup.
