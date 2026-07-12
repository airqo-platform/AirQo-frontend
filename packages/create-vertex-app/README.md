# create-vertex-app

Scaffold a [Vertex](../../src/vertex-template/README.md) IoT dashboard app — a configurable, mock-first device management UI built with Next.js. The generated app runs on **mock data out of the box**: no backend, credentials, or `.env` file required.

## Usage

```bash
npm create @airqo/vertex-app@latest my-app
# or
pnpm create @airqo/vertex-app my-app
# or
npx @airqo/create-vertex-app my-app
```

Answer a few prompts (organization name, theme color, map tiles), then:

```bash
cd my-app
npm install
npm run dev
```

### Non-interactive

```bash
npm create @airqo/vertex-app@latest my-app -- --yes \
  --org-name "KCCA Air Quality" --short-name KCCA \
  --color "#00A86B" --tiles openstreetmap
```

| Flag | Description |
| --- | --- |
| `-y, --yes` | Skip prompts, accept defaults |
| `--org-name` | Organization name (titles, footer, metadata) |
| `--short-name` | Short name for compact UI spots |
| `--color` | Primary theme color (hex) |
| `--tiles` | `openstreetmap` (no token) or `mapbox` |
| `--git` / `--no-git` | Initialize a git repository (default: yes) |

All further customization — feature flags, links, auth, adapters — lives in the generated `vertex.config.ts` (see `vertex.config.example.ts` in the project for the annotated reference).

## How it works

The CLI ships a snapshot of [`src/vertex-template`](../../src/vertex-template) inside the npm package, copied in at publish time by the `prepack` hook ([scripts/sync-template.mjs](scripts/sync-template.mjs)). Scaffolding is therefore offline-capable and deterministic: a given CLI version always produces the same project.

Because npm strips `.gitignore` files from published tarballs, the sync script stores it as `_gitignore` and the CLI renames it back when scaffolding.

## Development

```bash
cd packages/create-vertex-app
npm install
npm run sync-template   # copy src/vertex-template into template/
npm run build           # bundle src/ into dist/ with tsup
node dist/index.js /tmp/demo-app   # try it
npm run test:smoke      # full non-interactive end-to-end check
```

`template/` and `dist/` are generated and gitignored; `prepack` rebuilds both, so `npm publish` is always self-consistent with the template source at that commit.
