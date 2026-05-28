# JrVenture Web App

A React 19 frontend for the JrVenture platform — a management system covering students, classes, activities, participation, notices, letters, and user settings.

## Scripts

| Command | Description |
|---|---|
| `yarn dev` | Start Vite dev server with HMR |
| `yarn build` | Type-check (`tsc -b`) then build for production |
| `yarn lint` | Run ESLint across the project |
| `yarn preview` | Preview the production build locally |
| `yarn openapi:generate-client` | Regenerate `src/__generated__/web-api-client` from the OpenAPI spec |

## Tech Stack

| Concern | Library |
|---|---|
| UI framework | React 19 + React Compiler (babel plugin) |
| Component library | Fluent UI v9 (`@fluentui/react-components`) + `handy-fluentui` (local yalc package) |
| State management | Jotai |
| Routing | React Router v7 |
| Forms + validation | React Hook Form + Zod |
| Internationalisation | i18next / react-i18next (en, zh-Hant, zh-Hans) |
| HTTP client | Axios via `@hey-api/client-axios` |

## Project Structure

```
src/
  __generated__/      # auto-generated OpenAPI client (do not edit by hand)
  components/         # shared UI components and HOCs
  hooks/              # shared custom hooks
  i18n/               # locale files (en, zh-Hant, zh-Hans) and AppTranslations type
  pages/              # page components, one directory per domain
  stores/             # Jotai atoms, one directory per domain
```

### Path Aliases

| Alias | Resolves to |
|---|---|
| `@component/*` | `src/components/*` |
| `@hook/*` | `src/hooks/*` |
| `@i18n/*` | `src/i18n/*` |
| `@openapi/*` | `src/__generated__/web-api-client/*` |
| `@page/*` | `src/pages/*` |
| `@store/*` | `src/stores/*` |

Always use these aliases for cross-directory imports. Never import directly from `@openapi/*` inside pages — import domain types from `@store/<domain>/<domain>-types` instead.

## State Management — BLoC Pattern with Jotai

Each domain in `src/stores/<domain>/` exports two atoms:

- **`<domain>StateAtom`** — a plain `atom<State>` holding the current status and data.
- **`<domain>ActionAtom`** — a write-only `atom(null, async (get, set, action) => { ... })` that acts as a reducer/dispatcher.

Components read state with `useAtomValue(stateAtom)` and dispatch actions with `useSetAtom(actionAtom)`.

The state shape uses a discriminated-union-like `status` field: `'idle' | 'loading' | 'success' | 'invalid' | 'error'`.

The `'invalid'` status signals stale data. `MaintenanceSearchLayout` watches for it and auto-triggers a refresh. After a successful create or update, dispatch `{ type: 'INVALIDATE' }` to the corresponding list bloc.

### Global Loading and Error State

- `src/stores/loading-atom.ts` aggregates loading state across all blocs. Register new blocs here.
- `src/stores/latest-api-error-atom.ts` surfaces the first non-null `error` from all registered bloc state atoms. Register new blocs here too.
- `src/hooks/use-api-error-toast.ts` watches the latest error atom and fires a toast once per new error (keyed on the error's UUID). `ApiErrorToastController` in `app.tsx` activates this globally.

### API Error Handling

Blocs use `toApiError(err)` from `src/stores/api-error.ts` to normalise raw errors into `ApiError`. Error messages resolve in priority order:
1. `t('apiError.<code>', { defaultValue: error.message, ... })` — locale-specific message for the error code
2. Falls back to `error.message` from the API response

Add known error codes to the `apiError` namespace in `src/i18n/types.ts` and all three locale files.

## UI Patterns

### CRUD Pages (Maintenance Pattern)

CRUD pages are composed with `withMaintenancePage(ListPage, EditPage, { entityName })`. This HOC:
- Derives the current mode (`list` | `add` | `edit` | `view`) from the URL.
- Bootstraps the breadcrumb trail, preventing child effects from running before it's seeded.
- Passes `onCancel`/`onSave` callbacks that navigate back.

Routes for a domain must use explicit `key` props to force remount on navigation (see `app.tsx`).

### Forms

All forms use React Hook Form + Zod:
- Schema defined inside `useMemo([t])` so error messages rebuild on language change.
- Non-native inputs (all `Fui*` / `JrVc*` components) require `<Controller>` — they expose `value`/`onChange(typedValue)`, not native events.
- Error messages use `t('validation.*')` keys.

### Mobile vs Desktop

`useIsMobile()` drives responsive behaviour:
- **Desktop**: filter panels render as an inline drawer; detail or selection UI uses a popup or inline panel.
- **Mobile**: filter panels navigate to a dedicated `/<domain>/filter` route (guarded by `location.state.fromSearch`); secondary UI uses a separate full page or bottom-sheet drawer.

## Coding Conventions

- **Arrow functions everywhere** — `const Foo = () => {}` for components, handlers, and utilities.
- **Exports at the bottom** — define types and components first, then export in a single block at the end of the file.
- **No comments by default** — only add a comment when the *why* is non-obvious (hidden constraint, subtle invariant, workaround).
- **No manual `useMemo`/`useCallback`** — the React Compiler handles memoisation automatically.
- **Import order** — builtin → external → internal aliases → relative, alphabetised within groups (enforced by ESLint).
- **JSX props** — sorted alphabetically (enforced by ESLint).
- **Filenames** — `.ts`/`.tsx` files must be `kebab-case`.
