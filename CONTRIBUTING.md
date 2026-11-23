# Contributing

## License of contributions

This project is MIT-licensed. By opening a pull request you agree that your
contribution is provided under the same MIT terms (inbound = outbound), and
that you have the right to submit it.

Do not paste code from sources whose license is incompatible with MIT. If you
adapt something, add the attribution in the PR description.

## Assets

Do not commit artwork, character images, screenshots of talent assets or song
audio. Talent imagery is loaded at runtime from their owners' hosts and is not
covered by this project's license — see [NOTICE.md](NOTICE.md). PRs that add
third-party media will be asked to remove it.

## Before opening a PR

Run the same checks CI runs, from the repository root:

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm test
pnpm run typecheck
pnpm build
```

A PR whose checks fail locally will fail in CI.

## Style

- Keep commits focused; one logical change per commit.
- Commit messages follow Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`).
- Match the existing code style; `pnpm format` applies Prettier.
- Explain *why* in the PR description, not just what changed.

## Reporting problems

Open an issue with the game mode, what you expected, what happened, and the
browser. For security issues, contact the maintainer directly instead of filing
a public issue.
