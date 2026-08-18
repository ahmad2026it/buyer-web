# Untitled UI PRO v4.0 — Design System

Extracted from Figma file `LI5N9OVI1Q0ycL1YfjeWay` on 2026-07-16.
Source: [Untitled UI PRO](https://www.untitledui.com)

---

## File Structure

```
design-system/
├── tokens/
│   ├── colors.ts          18 hues × 11 stops + semantic mappings
│   ├── typography.ts      Font family, sizes, line heights, text styles
│   ├── spacing.ts         4px grid, container widths, breakpoints
│   ├── radii.ts           Border radius scale
│   ├── shadows.ts         Elevation + focus ring shadows
│   └── index.ts           Re-exports all tokens
├── components/
│   ├── index.ts           Single entry point for all components
│   │
│   ├── — SHARED COMPONENTS —
│   ├── Button.tsx
│   ├── Badge.tsx
│   ├── Input.tsx
│   ├── Tooltip.tsx
│   ├── Avatar.tsx
│   ├── ButtonGroup.tsx
│   ├── Tag.tsx
│   ├── Dropdown.tsx
│   ├── Progress.tsx
│   ├── Slider.tsx
│   │
│   ├── — APPLICATION LAYOUT —
│   ├── Tabs.tsx
│   ├── Table.tsx
│   ├── Pagination.tsx
│   ├── Breadcrumb.tsx
│   ├── PageHeader.tsx
│   ├── Navigation.tsx
│   │
│   ├── — APPLICATION OVERLAYS —
│   ├── Modal.tsx
│   ├── Slideout.tsx
│   ├── Alert.tsx
│   ├── CommandMenu.tsx
│   │
│   ├── — APPLICATION CONTENT —
│   ├── Metrics.tsx
│   ├── ActivityFeed.tsx
│   ├── Messaging.tsx
│   ├── EmptyState.tsx
│   ├── ProgressSteps.tsx
│   │
│   └── — APPLICATION UTILITIES —
│       ├── DatePicker.tsx
│       ├── FileUpload.tsx
│       ├── LoadingIndicator.tsx
│       ├── ContentDivider.tsx
│       ├── CodeSnippet.tsx
│       └── InlineCTA.tsx
├── tailwind.config.ts
└── design-system.md       ← this file
```

---

## Design Tokens

### Brand Color

Primary: **`#7F56D9`** (brand-600 / Purple). All components reference brand tokens — swap colors via `tokens/colors.ts`.

**Custom brand color rule:** When a user provides a hex color, treat it as brand-500 and generate a complete 11-stop palette. Present the palette for approval before replacing token values anywhere.

### Color Scale

11-stop scale per hue: 25, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950.

| Token Group | Primary stop | Usage |
|---|---|---|
| `brand` | 600 = `#7F56D9` | All CTAs, focus rings, active states |
| `gray` | 900 = `#101828` | Text, borders, backgrounds |
| `error` | 600 = `#D92D20` | Destructive actions, form errors |
| `warning` | 600 = `#DC6803` | Warning alerts |
| `success` | 600 = `#079455` | Success states |

#### Semantic Mappings (from `tokens/colors.ts`)

```
Foreground primary    → gray-900   (#101828)
Foreground secondary  → gray-700   (#344054)
Foreground tertiary   → gray-600   (#475467)
Foreground disabled   → gray-400   (#98A2B3)
Foreground placeholder → gray-500  (#667085)

Background primary    → base white  (#FFFFFF)
Background secondary  → gray-50    (#F9FAFB)
Background tertiary   → gray-100   (#F2F4F7)

Border primary        → gray-200   (#EAECF0)
Border secondary      → gray-300   (#D0D5DD)
```

### Typography

Font: **Inter** (variable, system fallback: `system-ui, sans-serif`)

| Token | Size | Line Height | Weight | Usage |
|---|---|---|---|---|
| `text-xs` | 12px | 18px | 400–600 | Labels, captions |
| `text-sm` | 14px | 20px | 400–600 | Body, buttons, nav |
| `text-md` | 16px | 24px | 400–600 | Body, inputs |
| `text-lg` | 18px | 28px | 400–600 | Card titles |
| `text-xl` | 20px | 30px | 400–700 | Section headers |
| `text-2xl` | 24px | 32px | 600–700 | Page sub-headings |
| `text-3xl` | 30px | 38px | 600–700 | Page titles (H1) |
| `text-4xl` | 36px | 44px | 600–700 | Metric values |
| `display-sm` | 30px | 38px | 600–700 | Marketing |
| `display-md` | 36px | 44px | 600–700 | Marketing |
| `display-lg` | 48px | 60px | 600–700 | Marketing hero |
| `display-xl` | 60px | 72px | 600–700 | Hero |
| `display-2xl` | 72px | 90px | 600–700 | Hero |

### Spacing

4px base grid. Key stops:

| Token | Value | Usage |
|---|---|---|
| `1` | 4px | Micro gaps |
| `2` | 8px | Icon-to-label, tight gaps |
| `3` | 12px | Input padding Y (sm) |
| `4` | 16px | Card padding, section gaps |
| `5` | 20px | Larger padding |
| `6` | 24px | Card padding, page padding |
| `8` | 32px | Section padding |
| `10` | 40px | Large section gaps |
| `12` | 48px | Page-level spacing |

### Border Radius

| Token | Value | Usage |
|---|---|---|
| `xs` | 4px | Tags, chips |
| `sm` | 6px | Badges, tab pills |
| `md` | 8px | Inputs, small buttons |
| `lg` | 10px | Icons in buttons |
| `xl` | 12px | Cards, dropdowns, modals |
| `2xl` | 16px | Large cards |
| `3xl` | 20px | CTAs |
| `4xl` | 24px | Modals (outer) |
| `full` | 9999px | Pills, avatars, toggles |

### Shadows

| Token | Value | Usage |
|---|---|---|
| `xs` | `0 1px 2px rgba(16,24,40,0.05)` | Buttons, inputs |
| `sm` | `0 1px 3px rgba(16,24,40,.1), 0 1px 2px rgba(16,24,40,.06)` | Cards |
| `md` | `0 4px 8px -2px rgba(16,24,40,.1)` | Dropdowns |
| `lg` | `0 12px 16px -4px rgba(16,24,40,.08)` | Modals, popovers |
| `xl` | `0 20px 24px -4px rgba(16,24,40,.08)` | Slideouts |
| `focus-brand` | `0 0 0 4px #F4EBFF` | Brand focus ring |
| `focus-error` | `0 0 0 4px #FEE4E2` | Error focus ring |

---

## Component Reference

### Shared Components

#### Button (`Button.tsx`)

Props: `size` (sm/md/lg/xl/2xl) · `hierarchy` (primary/secondary-color/secondary-gray/tertiary-color/tertiary-gray/link-color/link-gray) · `iconVariant` (default/dot-leading/only) · `destructive` · `loading` · `disabled` · `onClick` · `leadingIcon` · `trailingIcon`

Also exports: `CloseButton` · `SocialButton` (google/apple/facebook/twitter/github/figma) · `AppStoreBadge` (app-store/google-play/web/windows/figma)

```tsx
<Button size="md" hierarchy="primary">Save changes</Button>
<Button size="md" hierarchy="secondary-gray" destructive>Delete</Button>
<Button size="md" iconVariant="only" leadingIcon={<PlusIcon />} />
```

#### Badge (`Badge.tsx`)

Props: `label` · `size` (sm/md/lg) · `color` (18 colors) · `badgeStyle` (filled/outline/pill-filled/pill-outline) · `dot` · `leadingIcon` · `trailingIcon` · `onRemove`

Also exports: `NotificationBadge` (count bubble) · `AlertBadge` (pill with icon + action)

```tsx
<Badge label="New" color="brand" badgeStyle="pill-filled" dot />
<Badge label="Error" color="error" badgeStyle="filled" onRemove={() => {}} />
```

#### Input (`Input.tsx`)

Exports: `Input` · `Textarea` · `OTPInput` · `Checkbox` · `Radio` · `Toggle` · `Select`

Props: `size` (sm/md) · `label` · `hint` · `errorMessage` · `leadingIcon` · `trailingIcon` · `leadingText` · `trailingText` · `disabled` · `state` (default/focused/error/disabled)

```tsx
<Input label="Email" type="email" placeholder="you@company.com" hint="We'll never share your email." />
<Toggle size="md" checked={on} onChange={setOn} label="Notifications" />
<OTPInput length={6} onComplete={(code) => verify(code)} />
```

#### Tooltip (`Tooltip.tsx`)

Props: `content` · `supportingText` · `placement` (12 positions) · `theme` (dark/light) · `delay` · `children`

```tsx
<Tooltip content="Helpful tip" placement="top" theme="dark">
  <button>Hover me</button>
</Tooltip>
```

#### Avatar (`Avatar.tsx`)

Props: `src` · `initials` · `name` · `size` (xs/sm/md/lg/xl/2xl) · `status` (online/offline/away/busy) · `verified` · `squared`

Also exports: `AvatarGroup`

```tsx
<Avatar src="/user.jpg" size="md" status="online" />
<AvatarGroup avatars={users} max={3} size="sm" />
```

#### ButtonGroup (`ButtonGroup.tsx`)

Props: `items` (key/label/icon) · `selected` (key or key[]) · `onSelect` · `size` · `multiSelect`

Also exported as: `SegmentedControl`

```tsx
<ButtonGroup
  items={[{ key: 'list', label: 'List' }, { key: 'grid', label: 'Grid' }]}
  selected={view}
  onSelect={setView}
  size="md"
/>
```

#### Tag (`Tag.tsx`)

Props: `label` · `size` (sm/md/lg) · `color` (6 colors) · `selected` · `onSelect` · `onRemove` · `leadingIcon` · `disabled`

Also exports: `TagGroup`

```tsx
<TagGroup
  tags={[{ key: 'react', label: 'React' }]}
  selected={new Set(['react'])}
  onSelect={(key) => toggle(key)}
/>
```

#### Dropdown (`Dropdown.tsx`)

Props: `trigger` · `items` (sections with items) · `open` · `onOpenChange`

Per item: `label` · `icon` · `trailingIcon` · `description` · `shortcut` · `destructive` · `disabled` · `href` · `onClick`

```tsx
<Dropdown
  trigger={<Button>Actions</Button>}
  items={[{ label: 'Edit', icon: <PencilIcon />, onClick: edit }, { label: 'Delete', destructive: true, onClick: del }]}
/>
```

#### Progress (`Progress.tsx`)

Exports: `ProgressBar` · `CircularProgress` · `Spinner`

```tsx
<ProgressBar value={65} size="md" color="brand" label="Uploading" showValue />
<Spinner size="md" color="brand" />
```

#### Slider (`Slider.tsx`)

Exports: `Slider` · `RangeSlider`

```tsx
<Slider value={50} onChange={setVal} min={0} max={100} />
<RangeSlider low={20} high={80} onChange={([l, h]) => setRange([l, h])} />
```

---

### Application Layout

#### Tabs (`Tabs.tsx`)

Props: `items` (key/label/icon/badge/disabled/content) · `activeKey` · `defaultActiveKey` · `onChange` · `variant` (underline/pills/pills-gray/enclosed) · `size` (sm/md/lg) · `fullWidth`

```tsx
<Tabs
  variant="underline"
  items={[{ key: 'overview', label: 'Overview', content: <Overview /> }, { key: 'activity', label: 'Activity', badge: 3 }]}
  defaultActiveKey="overview"
/>
```

#### Table (`Table.tsx`)

Props: `columns` (key/header/accessor/render/width/align/sortable) · `data` · `keyExtractor` · `loading` · `emptyState` · `onRowClick` · `selectable` · `selectedKeys` · `onSelectChange` · `sortKey` · `sortDir` · `onSort` · `stickyHeader` · `striped` · `compact`

```tsx
<Table
  columns={[{ key: 'name', header: 'Name', accessor: 'name', sortable: true }, { key: 'status', header: 'Status', render: (_, row) => <Badge label={row.status} /> }]}
  data={users}
  keyExtractor={(u) => u.id}
  selectable
/>
```

#### Pagination (`Pagination.tsx`)

Props: `page` · `total` · `perPage` · `onChange` · `siblingCount` · `variant` (default/simple/minimal)

```tsx
<Pagination page={currentPage} total={totalPages} onChange={setPage} variant="default" />
```

#### Breadcrumb (`Breadcrumb.tsx`)

Props: `items` (label/href/icon/onClick) · `separator` · `maxItems`

First item auto-gets a Home icon. Collapses to `…` when `maxItems` is exceeded.

```tsx
<Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Settings', href: '/settings' }, { label: 'Profile' }]} />
```

#### PageHeader (`PageHeader.tsx`)

Exports: `PageHeader` · `CardHeader` · `SectionHeader` · `SectionFooter` · `Card`

```tsx
<PageHeader
  title="Users"
  description="Manage your team members and their roles."
  breadcrumb={<Breadcrumb items={[...]} />}
  actions={<Button>Add user</Button>}
  tabs={<Tabs items={[...]} />}
/>

<Card
  header={<CardHeader title="Recent activity" actions={<Button hierarchy="tertiary-gray">See all</Button>} />}
  footer={<SectionFooter><Button hierarchy="secondary-gray">Load more</Button></SectionFooter>}
>
  Content here
</Card>
```

#### Navigation (`Navigation.tsx`)

Exports: `SidebarNav` · `TopNav`

`SidebarNav` props: `items` (NavItem with optional children) · `activeKey` · `onSelect` · `collapsed` · `logo` · `footerItems` · `userProfile`

```tsx
<SidebarNav
  items={navItems}
  activeKey={route}
  onSelect={navigate}
  userProfile={{ name: 'John Doe', email: 'john@co.com', initials: 'JD' }}
/>
```

---

### Application Overlays

#### Modal (`Modal.tsx`)

Props: `open` · `onClose` · `size` (xs/sm/md/lg/xl/2xl/full) · `title` · `description` · `icon` · `iconVariant` (brand/error/warning/success/gray) · `children` · `footer` · `closeOnBackdrop` · `showClose`

Closes on Escape key. Locks body scroll while open.

```tsx
<Modal
  open={showDelete}
  onClose={() => setShowDelete(false)}
  size="sm"
  title="Delete account"
  description="This action cannot be undone."
  iconVariant="error"
  footer={
    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
      <Button hierarchy="secondary-gray" onClick={() => setShowDelete(false)}>Cancel</Button>
      <Button hierarchy="primary" destructive onClick={deleteAccount}>Delete</Button>
    </div>
  }
/>
```

#### Slideout (`Slideout.tsx`)

Props: `open` · `onClose` · `title` · `description` · `side` (right/left) · `size` (sm/md/lg/xl/full) · `children` · `footer` · `closeOnBackdrop` · `showClose`

```tsx
<Slideout open={showPanel} onClose={() => setShowPanel(false)} title="Edit profile" size="md">
  <ProfileForm />
</Slideout>
```

#### Alert (`Alert.tsx`)

Exports: `Alert` · `ToastStack`

`Alert` props: `title` · `message` · `color` (brand/gray/error/warning/success) · `variant` (inline/toast/banner) · `icon` · `actions` · `onClose`

```tsx
<Alert color="success" title="Saved!" message="Your changes have been saved." onClose={dismiss} />

<ToastStack toasts={toasts} onDismiss={(id) => remove(id)} position="top-right" />
```

#### CommandMenu (`CommandMenu.tsx`)

Props: `open` · `onClose` · `items` (id/label/description/icon/shortcut/group/onSelect/disabled) · `placeholder` · `emptyMessage`

Keyboard: Arrow up/down to navigate, Enter to select, Escape to close. Items can be grouped.

```tsx
<CommandMenu
  open={showCmd}
  onClose={() => setShowCmd(false)}
  items={[
    { id: 'new', label: 'New document', icon: <PlusIcon />, shortcut: ['⌘', 'N'], group: 'Create' },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon />, group: 'Navigate' },
  ]}
/>
```

---

### Application Content

#### Metrics (`Metrics.tsx`)

Exports: `MetricCard` · `MetricGrid`

`MetricCard` props: `title` · `value` · `change` · `trend` (up/down/neutral) · `icon` · `badge` · `description` · `chart`

```tsx
<MetricGrid
  columns={4}
  metrics={[
    { title: 'Total Revenue', value: '$45.2K', change: '+20.1%', trend: 'up', description: 'vs last month' },
    { title: 'Active Users', value: '2,350', change: '-4.3%', trend: 'down' },
  ]}
/>
```

#### ActivityFeed (`ActivityFeed.tsx`)

Props: `items` (id/user/icon/content/timestamp/action/isLast) · `showConnector`

```tsx
<ActivityFeed items={[
  { id: '1', user: { name: 'Alice', initials: 'AL' }, content: 'created a new project', timestamp: '2h ago' },
  { id: '2', icon: <CheckIcon />, iconBg: '#ECFDF3', iconColor: '#079455', content: 'Deployment completed', timestamp: '4h ago' },
]} />
```

#### Messaging (`Messaging.tsx`)

Props: `messages` (id/content/sender/timestamp/isSelf/status/attachments) · `onSend` · `placeholder`

```tsx
<Messaging messages={thread} onSend={(msg) => sendMessage(msg)} style={{ height: '600px' }} />
```

#### EmptyState (`EmptyState.tsx`)

Props: `icon` · `title` · `description` · `actions` · `size` (sm/md/lg)

```tsx
<EmptyState
  title="No results found"
  description="Try adjusting your search or filters."
  actions={<Button>Clear filters</Button>}
/>
```

#### ProgressSteps (`ProgressSteps.tsx`)

Props: `steps` (id/label/description/status: complete/current/upcoming/icon) · `orientation` (horizontal/vertical) · `variant` (dots/numbered/icons)

```tsx
<ProgressSteps
  orientation="horizontal"
  variant="numbered"
  steps={[
    { id: '1', label: 'Account', status: 'complete' },
    { id: '2', label: 'Profile', status: 'current' },
    { id: '3', label: 'Billing', status: 'upcoming' },
  ]}
/>
```

---

### Application Utilities

#### DatePicker (`DatePicker.tsx`)

Props: `value` · `onChange` · `minDate` · `maxDate` · `placeholder` · `disabled` · `label` · `hint` · `error`

Built-in calendar popup. Closes on outside click and date select.

```tsx
<DatePicker label="Start date" value={date} onChange={setDate} minDate={new Date()} />
```

#### FileUpload (`FileUpload.tsx`)

Props: `onFiles` · `accept` · `multiple` · `maxSizeMB` · `files` (UploadedFile[]) · `onRemove` · `disabled` · `label` · `hint`

`UploadedFile`: `id` · `name` · `size` · `type` · `progress` · `status` (uploading/done/error) · `error` · `url`

```tsx
<FileUpload
  label="Upload documents"
  accept=".pdf,.docx"
  multiple
  maxSizeMB={10}
  files={uploadedFiles}
  onFiles={(files) => handleUpload(files)}
  onRemove={(id) => removeFile(id)}
/>
```

#### LoadingIndicator (`LoadingIndicator.tsx`)

Exports: `Skeleton` · `SkeletonText` · `SkeletonCard` · `SkeletonTable` · `PageLoader`

```tsx
<Skeleton width="200px" height="16px" />
<SkeletonCard />
<SkeletonTable rows={5} cols={4} />
<PageLoader message="Loading your workspace…" fullScreen />
```

#### ContentDivider (`ContentDivider.tsx`)

Props: `label` · `orientation` (horizontal/vertical) · `align` (left/center/right) · `color`

```tsx
<ContentDivider label="or" align="center" />
<ContentDivider orientation="vertical" />
```

#### CodeSnippet (`CodeSnippet.tsx`)

Exports: `CodeSnippet` · `InlineCode`

Props: `code` · `language` · `title` · `showLineNumbers` · `showCopy`

```tsx
<CodeSnippet code={`const x = 1;`} language="typescript" showCopy showLineNumbers />
<p>Set the <InlineCode>NODE_ENV</InlineCode> variable.</p>
```

#### InlineCTA (`InlineCTA.tsx`)

Props: `title` · `description` · `primaryAction` · `secondaryAction` · `icon` · `image` · `variant` (banner/card/strip) · `color` (brand/gray/dark) · `onClose`

```tsx
<InlineCTA
  title="Upgrade to Pro"
  description="Get access to all features and components."
  primaryAction={{ label: 'Get started', onClick: openUpgrade }}
  secondaryAction={{ label: 'Learn more', href: '/pricing' }}
  variant="card"
  color="brand"
  onClose={dismissBanner}
/>
```

---

## Quick-Start Rules for Claude Code

When building UIs with this design system:

1. **Import from index**: `import { Button, Input, Modal } from './design-system/components'`
2. **Tokens**: `import { colors, spacing, radii } from './design-system/tokens'`
3. **Tailwind**: Extend via `tailwind.config.ts` — all tokens are mapped
4. **Brand color**: Currently `#7F56D9` (brand-600). To change brand: provide any hex → get palette for approval → replace tokens
5. **Spacing**: Always use 4px grid multiples (4, 8, 12, 16, 20, 24, 32, 40, 48)
6. **Typography**: Use `Inter` only. Match size + weight to token scale
7. **Focus rings**: All interactive elements use `box-shadow: 0 0 0 4px #F4EBFF` for brand focus
8. **Hover states**: `#F9FAFB` for gray hover, `#F4EBFF` for brand hover
9. **No external deps**: All components use React inline styles — zero CSS-in-JS library required
10. **Accessible**: All interactive elements have `aria-*` attributes; keyboard navigation on Dropdown, CommandMenu, Tabs, OTPInput

---

## Icon Library

Icons: Untitled UI icon set (`design-system/` Figma page). Categories:

- General UI (arrows, chevrons, close, check, dots)
- Files & media (upload, download, attachment, image)
- Actions (edit, delete, copy, share, search, filter)
- Navigation (home, menu, grid, list, settings)
- Data (chart, table, metric, calendar)
- Communication (mail, chat, bell, phone)
- User & auth (user, users, lock, key, shield)
- Brand logos (social platforms, stores)

Recommended icon size: 16px (sm), 20px (md), 24px (lg). Stroke width: 1.5–2px.
