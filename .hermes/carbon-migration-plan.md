# Carbon Design System Migration Plan

## Goal
Replace shadcn/ui with IBM Carbon Design System (@carbon/react) across the Processing project.

## Key Differences from shadcn
- **SCSS-based**, not Tailwind utility classes
- Requires `sass` devDependency
- Components import from `@carbon/react` — no local `components/ui/` files
- Styles via `@use '@carbon/react/scss/...'` in a global SCSS file
- Theme tokens: `theme.$background`, `theme.$text-primary`, `theme.$interactive`, etc.
- Dark mode: `@include theme.theme(themes.$g100)`
- Next.js config: `sassOptions: { quietDeps: true }`

## Steps

### 1. Install & Configure
- `pnpm add @carbon/react`
- `pnpm add -D sass`
- Update `next.config.ts` with `sassOptions: { quietDeps: true }`
- Create `app/globals.scss` with Carbon imports (replaces `globals.css`)
- Update `layout.tsx` to import `./globals.scss`

### 2. Remove shadcn
- Delete `app/components/ui/` directory (button, card, badge, dialog, tabs, input, textarea, label, avatar, separator)
- Delete `components.json`
- Remove `class-variance-authority`, `clsx`, `tailwind-merge`, Radix packages from package.json
- Remove `tailwindcss` and `@tailwindcss/postcss` (Carbon uses SCSS, not Tailwind)
- Remove `postcss.config.mjs`
- Delete `app/lib/utils.ts` cn() function (Carbon uses `classnames`)

### 3. Rewrite Components (use Carbon components)
- **Nav** → `@carbon/react` `Header`, `HeaderName`, `HeaderNavigation`, `HeaderMenuItem` (UIShell)
- **FileCard** → `@carbon/react` `Tile` or plain div with Carbon classes
- **StageBadge** → `@carbon/react` `Tag` with custom kinds
- **StageSelector** → `@carbon/react` `Dropdown` or `Select`
- **TaskList** → `@carbon/react` `DataTable` or custom list with Carbon styles
- **TimelineItem** → Custom with Carbon typography/icon tokens
- **AddTaskDialog** → `@carbon/react` `Modal` or `ComposedModal`
- **AddNoteForm** → `@carbon/react` `Form`, `TextInput`, `TextArea`
- **CompleteTaskButton** → `@carbon/react` `Checkbox` or `IconButton`

### 4. Rewrite Pages
- **Dashboard** (`app/page.tsx`) — Carbon Grid, tiles, DataTable for tasks
- **File Detail** (`app/files/[fileId]/page.tsx`) — Carbon Grid, Tabs, DataTable, structured list
- **All Files** (`app/files/page.tsx`) — Carbon DataTable or grid of tiles
- **Sale Dates** (`app/sales/page.tsx`) — Carbon tiles/list

### 5. Theme
- Use Carbon's white/g10 (light) theme as default
- Map stages to Carbon tag colors (red, magenta, purple, blue, cyan, teal, green, gray)
- Priority colors: High=red tag, Medium=yellow tag, Low=gray tag

### 6. Keep Tailwind for utility classes?
Carbon is SCSS-based but we can keep Tailwind for layout utilities (flex, grid, padding, etc.)
if we want fast iteration. OR go pure Carbon. Decision: **Keep Tailwind** — use it for layout
utilities only, Carbon components for actual UI components. This avoids fighting Carbon's
design system while keeping development speed.

### 7. Test & Commit