# Contributing

Thanks for your interest in Expiry Manager!

## Development

```bash
git clone https://github.com/sahilium/expiry-manager.git
cd expiry-manager
npm install
npm run dev
```

## Pull Requests

- Keep changes focused and small.
- Run `npm run lint` and `npm run test` before submitting.
- Update tests if you change business logic in `src/`.
- Update `CHANGELOG.md` under the `Unreleased` section.
- Use conventional commit messages (`feat:`, `fix:`, `chore:`, `docs:`, etc.).

## Code style

- TypeScript with strict mode.
- No semicolons, single quotes, two-space indents (`.editorconfig` handles this).
- `main.ts` stays minimal — keep logic in dedicated modules.
- No comments in code unless explaining a non-obvious decision.

## Release process

Maintainers:

1. Update `manifest.json` version and `versions.json`.
2. Commit: `chore: bump to vX.Y.Z`.
3. Tag: `git tag X.Y.Z && git push origin X.Y.Z`.
4. GitHub Actions creates a draft release — publish it.
