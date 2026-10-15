# Publishing to npm

Publish the package to the public registry: [npmjs.com/package/tradernet-sdk](https://www.npmjs.com/package/tradernet-sdk).

## Prerequisites

1. npm account with 2FA enabled: https://www.npmjs.com/signup
2. Logged in locally:

```bash
npm login
npm whoami
```

3. Confirm the name is still free (or that you own it):

```bash
npm view tradernet-sdk
```

## What gets published

Controlled by `"files"` in `package.json` (+ `.npmignore`):

| Included | Excluded |
|---|---|
| `dist/` (compiled JS + `.d.ts`) | `src/`, `tests/`, `examples/`, `docs/` |
| `README.md`, `LICENSE` | `.env`, `*.ini`, `main.js`, tooling configs |

`prepack` / `prepublishOnly` rebuild `dist/` and run tests before publish.

## Release checklist

```bash
# 1. Working tree clean, secrets not staged
git status

# 2. Build & test
npm run build
npm test

# 3. Inspect tarball contents
npm run pack:check

# 4. Bump version (choose one)
npm version patch   # 0.1.0 → 0.1.1  (creates git tag)
# npm version minor
# npm version major

# 5. Publish
npm publish

# 6. Verify
npm view tradernet-sdk version
```

Install as a consumer:

```bash
npm install tradernet-sdk
```

## Versioning

Follow semver:

- **patch** — bugfixes, docs in README that ship with the package
- **minor** — new backwards-compatible API
- **major** — breaking changes

## After the first publish

- Add a git remote and push tags (`git push --follow-tags`) when the repo is hosted.
- Optionally set `"repository"` / `"bugs.url"` in `package.json` to the real GitHub/GitLab URL.
- For org-owned packages later, transfer ownership on npm or republish as `@tradernet/sdk`.

## Troubleshooting

| Symptom | Fix |
|---|---|
| `ENEEDAUTH` | `npm login` |
| `403` / 2FA | create a granular access token with publish permission |
| `name already taken` | rename or use a scope `@your-org/tradernet-sdk` |
| Empty / stale `dist` | `npm run clean && npm run build` |
