# ui-monorepo

React UI monorepo managed with [npm workspaces](https://docs.npmjs.com/cli/using-npm/workspaces).

## Structure

```
apps/
  web/            # Vite + React app (consumes @ui-monorepo/ui)
packages/
  ui/             # Shared React component library (@ui-monorepo/ui)
tsconfig.base.json  # Shared TypeScript config
```

## Getting started

```bash
npm install        # install all workspace dependencies
npm run dev         # start the web app at http://localhost:5173
```

## Scripts (run from the repo root)

| Command             | Description                                   |
| ------------------- | --------------------------------------------- |
| `npm run dev`       | Start the `web` app dev server                |
| `npm run build`     | Build every workspace                         |
| `npm run typecheck` | Type-check every workspace                    |

## Adding a package

Create a folder under `packages/` (library) or `apps/` (application) with its
own `package.json`. Name shared packages `@ui-monorepo/<name>` and depend on
them with `"@ui-monorepo/<name>": "*"`.
