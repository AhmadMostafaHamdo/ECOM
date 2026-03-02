# Dashboard Quick Reference

## 🎨 New Dashboard Structure

```
┌─────────────────────────────────────────────────────────────┐
│  ╔═══════════════╗  ┌──────────────────────────────────┐   │
│  ║   SIDEBAR     ║  │      MAIN CONTENT AREA           │   │
│  ║   (Dark)      ║  │                                  │   │
│  ╠═══════════════╣  │  ┌────────────────────────────┐  │   │
│  ║ 🏠 Dashboard  ║  │  │  Page Header               │  │   │
│  ║ 👥 Users      ║  │  │  - Kicker                  │  │   │
│  ║ 📦 Products   ║  │  │  - Title                   │  │   │
│  ║ 📁 Categories ║  │  │  - Description             │  │   │
│  ║ ⭐ Reviews    ║  │  └────────────────────────────┘  │   │
│  ║ 📊 Statistics ║  │                                  │   │
│  ╚═══════════════╝  │  ┌──────┐ ┌──────┐ ┌──────┐    │   │
│                      │  │ Card │ │ Card │ │ Card │    │   │
│                      │  │  📈  │ │  👥  │ │  ⭐  │    │   │
│                      │  └──────┘ └──────┘ └──────┘    │   │
│                      │                                  │   │
│                      │  ┌──────────────────────────┐   │   │
│                      │  │  Content Section         │   │   │
│                      │  │  (Tables, Forms, etc)    │   │   │
│                      │  └──────────────────────────┘   │   │
│                      └──────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 CSS Classes Reference

### Layout
```css
.admin_dashboard_shell      /* Main container */
.admin_sidebar              /* Dark sidebar */
.admin_dashboard_content    /* Main content area */
.admin_page                 /* Page wrapper */
```

### Components
```css
/* Cards */
.admin_stat_card           /* Stat card with hover effects */
.admin_form_card           /* Form container */
.admin_form_card.compact   /* Smaller padding */

/* Tables */
.admin_table_container     /* Table wrapper with border */
.admin_table               /* Table element */
.admin_table thead         /* Table header */
.admin_table tbody tr      /* Table rows with hover */

/* Badges */
.admin_badge               /* Base badge */
.admin_badge.success       /* Green badge */
.admin_badge.warning       /* Orange badge */
.admin_badge.error         /* Red badge */
.admin_badge.info          /* Blue badge */

/* Buttons */
.admin_btn                 /* Primary button */
.admin_btn.secondary       /* Secondary button */
.admin_btn.danger          /* Danger button */

/* Navigation */
.admin_nav_link            /* Sidebar nav link */
.admin_nav_link.active     /* Active nav link */
.admin_action_link         /* Quick action link */
```

### Page Elements
```css
.admin_page_header         /* Page header section */
.admin_page_kicker         /* Small uppercase label */
.admin_stats_grid          /* Stats cards grid */
.admin_quick_actions       /* Quick actions grid */
```

---

## 🎨 Color Usage Guide

### Stat Card Icons
```javascript
const colors = {
    users: "hsl(220, 90%, 56%)",      // Blue
    admins: "hsl(280, 70%, 60%)",     // Purple
    categories: "hsl(142, 71%, 45%)", // Green
    products: "hsl(38, 92%, 50%)",    // Orange
    cart: "hsl(199, 89%, 48%)",       // Light Blue
    reviews: "hsl(340, 82%, 52%)",    // Pink
    trending: "hsl(38, 92%, 50%)",    // Orange
    rating: "hsl(45, 100%, 51%)"      // Gold
};
```

### Badge Colors
```css
/* Success - Green */
background: hsl(142, 71%, 95%);
color: hsl(142, 71%, 35%);

/* Warning - Orange */
background: hsl(38, 92%, 95%);
color: hsl(38, 92%, 35%);

/* Error - Red */
background: hsl(0, 84%, 95%);
color: hsl(0, 84%, 45%);

/* Info - Blue */
background: hsl(199, 89%, 95%);
color: hsl(199, 89%, 35%);
```

---

## 📱 Responsive Behavior

### Desktop (> 1024px)
- Sidebar: Fixed, always visible
- Content: Margin-left 280px
- Grid: Auto-fit columns

### Tablet (768px - 1024px)
- Sidebar: Hidden, toggle button appears
- Content: Full width
- Grid: Auto-fit with min 250px

### Mobile (< 768px)
- Sidebar: Hidden, overlay when open
- Content: Full width, reduced padding
- Grid: Single column
- Tables: Horizontal scroll

---

## 🔧 Component Templates

### Stat Card with Icon
```jsx
<article className="admin_stat_card">
    <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 'var(--space-3)',
        marginBottom: 'var(--space-3)'
    }}>
        <div style={{
            width: '48px',
            height: '48px',
            borderRadius: 'var(--radius-lg)',
            background: 'hsl(220, 90%, 56%)15',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <Icon style={{ color: 'hsl(220, 90%, 56%)', fontSize: '24px' }} />
        </div>
    </div>
    <h3>Label</h3>
    <p>Value</p>
</article>
```

### Table Row with Badge
```jsx
<tr>
    <td>Name</td>
    <td>
        <span className="admin_badge success">
            <CheckIcon fontSize="small" />
            Approved
        </span>
    </td>
    <td>
        <button className="admin_btn secondary">
            Edit
        </button>
    </td>
</tr>
```

### Page Header
```jsx
<header className="admin_page_header">
    <p className="admin_page_kicker">Section</p>
    <h1>Page Title</h1>
    <p>Page description text</p>
</header>
```

---

## 🎯 Navigation Structure

```
/dashboard
├── /                    → DashboardHome
├── /users              → UsersManagement
├── /products           → ProductsManagement
├── /categories         → CategoriesManagement
├── /reviews            → ReviewManagement ⭐ NEW
└── /statistics         → StatisticsPage
```

---

## ✨ Animation Classes

### From design-tokens.css
```css
.animate-fade-in        /* Fade in animation */
.animate-slide-up       /* Slide up animation */
.hover-lift             /* Lift on hover */
.hover-scale            /* Scale on hover */
```

---

## 📊 Stats Available

### Dashboard Home
1. Total Users (👥)
2. Admin Accounts (🔐)
3. Categories (📁)
4. Products (📦)
5. Cart Items (🛒)
6. Total Reviews (⭐) - NEW
7. Pending Reviews (⏳) - NEW with badge
8. Average Rating (⭐) - NEW

---

## 🚀 Quick Start

### 1. View Dashboard
```
Navigate to: /dashboard
```

### 2. Manage Reviews
```
Navigate to: /dashboard/reviews
Filter by: All | Pending | Approved | Rejected
Actions: Approve | Reject
```

### 3. Check Stats
```
Navigate to: /dashboard/statistics
Refresh: Click "Refresh Statistics" button
```

---

## 💡 Tips

### Custom Icon Color
```jsx
<Icon style={{ color: 'hsl(220, 90%, 56%)', fontSize: '24px' }} />
```

### Custom Badge
```jsx
<span className="admin_badge" style={{ 
    background: 'custom-color-light',
    color: 'custom-color-dark'
}}>
    Custom
</span>
```

### Inline Spacing
```jsx
style={{ 
    marginBottom: 'var(--space-4)',
    padding: 'var(--space-3)'
}}
```

---

## 🎨 Design Tokens Used

```css
/* Spacing */
var(--space-1) to var(--space-20)

/* Colors */
var(--color-primary)
var(--color-secondary)
var(--color-success)
var(--color-warning)
var(--color-error)
var(--color-background)
var(--color-surface)
var(--color-border)
var(--color-text-primary)
var(--color-text-secondary)

/* Radius */
var(--radius-sm) to var(--radius-2xl)
var(--radius-full)

/* Shadows */
var(--shadow-sm) to var(--shadow-2xl)

/* Transitions */
var(--transition-fast)
var(--transition-base)
var(--transition-slow)

/* Z-index */
var(--z-fixed)
```

---

This quick reference provides all the essential information for working with the new dashboard design! 🎉
