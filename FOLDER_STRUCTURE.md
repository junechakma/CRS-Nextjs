# CRS Folder Structure Documentation

This document explains the folder structure of the Course Review System (CRS) and provides guidelines for maintaining and extending the codebase.

## Overview

The project is organized for long-term maintainability (4-5 years) with clear separation of concerns, scalability, and ease of feature addition/removal.

## Directory Structure

```
crs/
├── app/                          # Next.js App Router directory
│   ├── (auth)/                  # Authentication route group (public)
│   │   ├── login/              # Login page
│   │   └── register/           # Registration pages
│   │
│   ├── (dashboard)/            # Dashboard route group (protected)
│   │   ├── super-admin/       # Super Admin dashboard and features
│   │   │   ├── page.tsx       # Main dashboard
│   │   │   ├── teachers/      # Teacher management
│   │   │   ├── analytics/     # System-wide analytics
│   │   │   ├── question-bank/ # Common question bank management
│   │   │   └── settings/      # System settings
│   │   │
│   │   ├── teacher/           # Teacher dashboard and features
│   │   │   ├── page.tsx       # Main dashboard
│   │   │   ├── courses/       # Course management
│   │   │   ├── sessions/      # Session management
│   │   │   ├── analytics/     # Course analytics
│   │   │   ├── questions/     # Question management
│   │   │   └── profile/       # Profile settings
│   │   │
│   │   └── layout.tsx         # Shared dashboard layout
│   │
│   ├── (public)/              # Public route group
│   │   ├── feedback/          # Anonymous student feedback portal
│   │   └── layout.tsx
│   │
│   ├── api/                   # API routes
│   │   ├── auth/             # Authentication endpoints
│   │   ├── courses/          # Course CRUD endpoints
│   │   ├── sessions/         # Session CRUD endpoints
│   │   ├── feedback/         # Feedback submission endpoints
│   │   └── analytics/        # Analytics endpoints
│   │
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Homepage
│   └── globals.css           # Global styles
│
├── components/               # React components
│   ├── ui/                  # shadcn/ui components (atomic)
│   │   ├── table.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── avatar.tsx
│   │   └── separator.tsx
│   │
│   ├── dashboard/           # Dashboard-specific components
│   │   ├── super-admin/    # Super Admin specific components
│   │   ├── teacher/        # Teacher specific components
│   │   └── shared/         # Shared dashboard components
│   │
│   ├── forms/              # Form components
│   │   ├── course-form.tsx
│   │   ├── session-form.tsx
│   │   └── question-form.tsx
│   │
│   ├── tables/             # Table components
│   │   ├── teachers-table.tsx
│   │   ├── courses-table.tsx
│   │   └── sessions-table.tsx
│   │
│   ├── charts/             # Chart components
│   │   ├── sentiment-chart.tsx
│   │   ├── response-rate-chart.tsx
│   │   └── clo-mapping-chart.tsx
│   │
│   └── layout/             # Layout components
│       ├── header/
│       │   └── header.tsx
│       ├── sidebar/
│       │   └── sidebar.tsx
│       └── footer/
│           └── footer.tsx
│
├── lib/                    # Utility libraries and core logic
│   ├── api/               # API client functions
│   │   ├── auth.ts
│   │   ├── courses.ts
│   │   ├── sessions.ts
│   │   └── analytics.ts
│   │
│   ├── hooks/             # Custom React hooks
│   │   ├── use-auth.ts
│   │   ├── use-courses.ts
│   │   └── use-sessions.ts
│   │
│   ├── types/             # TypeScript type definitions
│   │   └── index.ts
│   │
│   ├── validations/       # Validation schemas (Zod/Yup)
│   │   ├── course.ts
│   │   ├── session.ts
│   │   └── question.ts
│   │
│   ├── services/          # Business logic services
│   │   ├── ai-service.ts
│   │   ├── analytics-service.ts
│   │   └── session-service.ts
│   │
│   └── utils.ts           # Utility functions (cn, etc.)
│
├── public/                # Static assets
│   ├── assets/
│   │   ├── images/
│   │   └── icons/
│   └── fonts/
│
├── legacy/                # Legacy code (to be refactored/removed)
│
└── initial-plan.md        # Project requirements document
```

## Design Principles

### 1. Route Organization (Route Groups)

We use Next.js route groups `(groupName)` to organize routes without affecting the URL structure:

- `(auth)` - Public authentication pages
- `(dashboard)` - Protected dashboard pages
- `(public)` - Public-facing pages

### 2. Component Organization

Components are organized by their purpose and scope:

- **ui/** - Atomic, reusable UI components (shadcn)
- **dashboard/** - Dashboard-specific composed components
- **forms/** - Form components
- **tables/** - Table components
- **charts/** - Chart/visualization components
- **layout/** - Layout components (header, sidebar, footer)

### 3. Code Colocation

Related code should be close together:
- API routes in `app/api/`
- Page-specific components can be colocated in the route folder
- Shared components in `components/`

### 4. TypeScript Types

All types are centralized in `lib/types/` for:
- Consistency across the application
- Easy refactoring
- Single source of truth

## Adding New Features

### Adding a New Dashboard Page

1. Create a new folder in the appropriate dashboard section:
   ```
   app/(dashboard)/teacher/my-feature/page.tsx
   ```

2. Add navigation link in the sidebar:
   ```typescript
   // components/layout/sidebar/sidebar.tsx
   const teacherNavigation = [
     // ... existing items
     { name: "My Feature", href: "/teacher/my-feature", icon: IconName },
   ]
   ```

### Adding a New API Route

1. Create a new folder in `app/api/`:
   ```
   app/api/my-resource/route.ts
   ```

2. Create corresponding service in `lib/services/`:
   ```
   lib/services/my-resource-service.ts
   ```

3. Create API client function in `lib/api/`:
   ```
   lib/api/my-resource.ts
   ```

### Adding a New Component

1. For UI components (atomic):
   ```
   components/ui/my-component.tsx
   ```

2. For feature-specific components:
   ```
   components/dashboard/teacher/my-component.tsx
   ```

## Best Practices

### 1. Component Naming
- Use PascalCase for component files: `MyComponent.tsx`
- Use kebab-case for folders: `my-feature/`

### 2. Type Safety
- Always define proper TypeScript types
- Use types from `lib/types/` instead of inline types
- Export types for reuse

### 3. Responsiveness
- Use Tailwind's responsive classes: `sm:`, `md:`, `lg:`, `xl:`
- Test on mobile, tablet, and desktop
- Hide non-essential columns on mobile tables

### 4. Code Reusability
- Extract common logic into hooks (`lib/hooks/`)
- Extract common UI patterns into components
- Use composition over duplication

### 5. Performance
- Use `"use client"` only when necessary
- Prefer server components for static content
- Implement proper loading states

## Maintenance Guidelines

### Regular Tasks

1. **Monthly Review**
   - Check for unused components/imports
   - Update dependencies
   - Review and clean up legacy code

2. **Feature Addition**
   - Follow the folder structure
   - Update this documentation if adding new patterns
   - Write TypeScript types

3. **Code Quality**
   - Run linting: `npm run lint`
   - Ensure responsive design
   - Test on multiple devices

## Migration Path from Legacy

The `legacy/` folder contains old code. To migrate:

1. Identify reusable logic
2. Refactor into new structure
3. Update imports
4. Remove from legacy folder
5. Test thoroughly

## Questions?

For questions about the structure or best practices, refer to:
- Next.js App Router documentation
- shadcn/ui documentation
- This document

## Future Considerations

As the project grows, consider:
- Implementing feature flags
- Adding E2E testing structure
- Setting up monitoring/analytics
- Creating a component library documentation
- Implementing CI/CD pipelines
