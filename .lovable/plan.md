
## Mobile-First Dashboard Redesign

### Problems to Fix

**`Dashboard.tsx` (layout shell)**
- Sidebar is always rendered even on mobile — takes up space and there's no mobile toggle
- `flex h-screen` with a fixed sidebar doesn't work on narrow screens
- Header has no hamburger/sidebar toggle for mobile
- Content padding `p-6` is too large on mobile
- CommandBar bottom bar needs tighter padding on mobile

**`DashboardGrid.tsx` (chart grid)**
- `grid-cols-4` as the base grid — has no `grid-cols-1` mobile base, relies on overrides that conflict
- `col-span-4 md:col-span-3` pattern is applied on top of `col-span-X` from `colSpan()`, creating class conflicts
- `auto-rows-[minmax(220px,auto)]` is too tall on mobile
- Stat grid `grid-cols-2 sm:grid-cols-4` is okay but can be tighter

**`DataSidebar.tsx`**
- Uses `motion.aside` with fixed pixel width — on mobile this eats the full viewport
- No overlay/drawer pattern for mobile — sidebar blocks the main content
- Collapse button works for desktop but mobile needs a full-sheet/drawer

---

### Solution Architecture

**Mobile breakpoint strategy**: `< md` (768px) = mobile, `md+` = desktop

#### 1. `DataSidebar.tsx` — Mobile drawer pattern
- Add `useIsMobile()` hook usage
- On mobile: render as an off-canvas drawer triggered by a button (slide from left, with overlay). Hidden by default
- On desktop: keep existing collapsible sidebar behavior unchanged
- Accept an `isOpen`/`onClose` prop pair for mobile control

#### 2. `Dashboard.tsx` — Mobile-aware shell
- Move sidebar open state up into Dashboard
- On mobile: hide sidebar completely from normal flow; show hamburger `Menu` icon in the header
- Header: on mobile show hamburger + title; on desktop show existing layout
- Content padding: `p-3 sm:p-6`
- CommandBar bottom bar: `py-3 px-3 sm:py-4`
- Empty state: reduce padding `p-6 sm:p-12`, suggestion grid `grid-cols-2` on mobile (already done, good)

#### 3. `DashboardGrid.tsx` — True mobile-first grid
- Base grid: `grid-cols-1` (mobile: single column)
- Breakpoints: `sm:grid-cols-2 lg:grid-cols-4`
- Remove conflicting `colSpan()` function overrides — replace with responsive class map:
  - `cols >= 3` → `col-span-1 sm:col-span-2 lg:col-span-3`
  - `cols === 2` → `col-span-1 sm:col-span-2`
  - `cols === 1` → `col-span-1`
- `auto-rows-[minmax(200px,auto)]` (slightly reduced)
- Stat grid already has `grid-cols-2 sm:grid-cols-4` — fine

#### 4. `ChartRenderer.tsx` — Smaller chart minimum heights on mobile
- Inner chart div: `style={{ minHeight: ... }}` stays but reduce from 120→100 on single-row
- Padding: `p-3 sm:p-5` for the card wrapper

#### 5. `StatCard.tsx` — Compact mobile stat
- Font size `text-3xl` → `text-2xl sm:text-3xl` for the value

### Files to Change
1. `src/components/DataSidebar.tsx` — mobile drawer with overlay
2. `src/pages/Dashboard.tsx` — hamburger, mobile state, tighter spacing
3. `src/components/DashboardGrid.tsx` — mobile-first grid cols
4. `src/components/charts/ChartRenderer.tsx` — responsive padding/height
5. `src/components/charts/StatCard.tsx` — responsive text sizes
