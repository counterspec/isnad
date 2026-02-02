# ISNAD Mobile Responsiveness Plan

Analysis of current issues and fixes needed for mobile-friendly design.

---

## 1. Header / Navigation

**Current:** Horizontal nav with 5 links + Connect button, no mobile handling

**Issues:**
- Links overflow on screens < 900px
- No hamburger menu
- Connect dropdown may overflow screen edge

**Fixes:**
```tsx
// Add mobile hamburger menu
- Hide nav links on mobile (md:flex hidden)
- Add hamburger icon button (flex md:hidden)
- Slide-out or dropdown menu for mobile
- Connect button should remain visible
```

**Breakpoint:** `md` (768px)

---

## 2. Home Page (`/`)

### Hero Section
**Current:** `text-6xl`, fixed button layout

**Fixes:**
```tsx
// Heading
- text-6xl → text-3xl md:text-5xl lg:text-6xl

// Subheading  
- text-xl → text-lg md:text-xl

// Buttons
- flex gap-4 → flex flex-col sm:flex-row gap-3 sm:gap-4
- Full-width buttons on mobile
```

### Resource Types Grid
**Current:** `grid-cols-2`

**Fix:** `grid-cols-1 sm:grid-cols-2`

### Problem Cards Grid
**Current:** `grid-cols-2`

**Fix:** `grid-cols-1 sm:grid-cols-2`

### Stats Grid (Inscriptions section)
**Current:** `grid-cols-3`

**Fix:** `grid-cols-1 sm:grid-cols-3` or `grid-cols-3` with smaller text

### Reason Cards Grid
**Current:** `grid-cols-2`

**Fix:** `grid-cols-1 md:grid-cols-2`

### Code Blocks
**Current:** `<pre>` with no overflow handling

**Fix:** Add `overflow-x-auto` and reduce font size on mobile

---

## 3. About Page (`/about`)

### Hero Section
**Current:** `text-[180px]` Arabic text

**Fixes:**
```tsx
// Arabic heading
- text-[180px] → text-[80px] sm:text-[120px] md:text-[180px]

// Hero height
- h-[70vh] → h-[50vh] sm:h-[60vh] md:h-[70vh]
```

### Editorial Sections
**Current:** `grid-cols-[280px_1fr]` two-column layout

**Fix:**
```tsx
grid-cols-1 md:grid-cols-[200px_1fr] lg:grid-cols-[280px_1fr]
```

The left label column should stack above content on mobile.

### Problem Cards
**Current:** `grid-cols-2`

**Fix:** `grid-cols-1 sm:grid-cols-2`

### Stats Grid
**Current:** `grid-cols-3`

**Fix:** `grid-cols-3` with smaller values or `grid-cols-1 sm:grid-cols-3`

---

## 4. Stake Page (`/stake`)

**Likely issues:**
- Form inputs may be cramped
- Multi-step UI needs mobile consideration
- Lock duration selector

**Fixes:**
- Full-width inputs on mobile
- Larger touch targets (min 44px)
- Stack form sections vertically

---

## 5. Check Page (`/check`)

**Likely issues:**
- Results display
- Resource info cards

**Fixes:**
- Stack cards vertically on mobile
- Scrollable code/hash displays

---

## 6. Docs Pages (`/docs/*`)

**Likely issues:**
- Sidebar navigation (if any)
- Code blocks overflow
- Tables

**Fixes:**
- Collapsible sidebar or top nav on mobile
- `overflow-x-auto` on code blocks
- Responsive tables or card view

---

## 7. Leaderboard Page (`/leaderboard`)

**Likely issues:**
- Table layout

**Fixes:**
- Horizontal scroll for table, or
- Card-based layout on mobile

---

## 8. Global CSS Updates

```css
/* globals.css additions */

/* Responsive container padding */
.layout-container {
  padding: 0 16px;
}
@media (min-width: 640px) {
  .layout-container {
    padding: 0 24px;
  }
}

/* Better touch targets */
.btn-primary, .btn-secondary {
  min-height: 44px;
}

/* Code blocks */
pre {
  overflow-x: auto;
  font-size: 12px;
}
@media (min-width: 640px) {
  pre {
    font-size: 14px;
  }
}

/* Cards - slightly less padding on mobile */
.card {
  padding: 16px;
}
@media (min-width: 640px) {
  .card {
    padding: 24px;
  }
}
```

---

## Implementation Order

1. **Header** (critical - navigation broken on mobile)
2. **Home page** (most visible)
3. **About page** (Arabic text overflow)
4. **Global CSS** (affects all pages)
5. **Stake page** (functional page)
6. **Check page** (functional page)
7. **Docs pages**
8. **Leaderboard**

---

## Testing Checklist

- [ ] iPhone SE (375px) - smallest common
- [ ] iPhone 14 (390px)
- [ ] iPad (768px) - tablet breakpoint
- [ ] iPad Pro (1024px)
- [ ] Desktop (1200px+)

---

## Notes

- Use Tailwind's responsive prefixes: `sm:` (640px), `md:` (768px), `lg:` (1024px)
- Mobile-first approach: base styles for mobile, add complexity with breakpoints
- Test with Chrome DevTools device emulation
