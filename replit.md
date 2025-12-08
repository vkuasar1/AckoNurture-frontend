# Acko Insurance App - Nurture (Mother & Baby Care)

## Overview

This project is a mobile-first insurance application that includes a specialized "Nurture" module for comprehensive mother and baby care. The application aims to provide a unified platform for insurance product exploration and dedicated wellness support. The "Nurture" module offers features like vaccine tracking, growth charts, developmental milestones, and AI assistance for babies, alongside postpartum recovery, mental health, and lactation guidance for mothers. The application adheres to Acko's design system, prioritizing a mobile-first, user-friendly experience.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend

- **Framework & Build:** React 18+ with TypeScript, Vite, Wouter for routing, and React Query for server state management.
- **UI:** shadcn/ui with "new-york" style, Radix UI primitives, and Tailwind CSS for styling. Custom CSS variables and Acko brand colors (purple, dark charcoal, white) are used for theming.
- **Design:** Mobile-first responsive design with consistent spacing and Inter-like typography.
- **State Management:** React Query for server state with custom API utilities.

### Backend

- **Framework:** Express.js with TypeScript and Node's built-in HTTP module.
- **Routing:** `/api` prefix for API routes, static file serving, and SPA fallback.
- **Development:** Vite middleware integration, HMR, and Replit-specific plugins.

### Data Storage

- **ORM & Database:** Drizzle ORM for type-safe operations with PostgreSQL (Neon serverless driver). Schema defined in `shared/schema.ts` and Drizzle Kit for migrations.
- **Schema Design:** UUID primary keys for users, unique username constraint, and Zod schemas for validation.
- **Development Storage:** In-memory storage (`MemStorage`) with an `IStorage` interface for abstraction.

### Build & Deployment

- **Production Build:** Custom esbuild script for server bundling (CommonJS output) and Vite for client-side assets.
- **Environment:** `NODE_ENV` and `DATABASE_URL` for configuration.

### Core Features

- **Nurture Module:**
    - **Baby Care:** Vaccine tracking, growth charts, developmental milestones, AI Nanny.
    - **Mother Care:** Postpartum recovery, mental health support, lactation guidance, Mother AI assistant.
    - **Resources:** Interactive wellness guide with multi-step flow for pain relief, nutrition, energy, sleep, and stress management. Recommends exercises with video content and nutrition tips. Includes "Consult a Doctor" fallback for specialist bookings (physiotherapist, nutritionist, general physician).
- **Plan Management:** Multi-step plan selection (Child Wellness, Mother Wellness, Combo packages) with localStorage persistence for prototyping, and dashboard integration.
- **Milestones:** Redesigned with age filters, two-state toggles, photo memory capture, and non-judgmental language.
- **Onboarding:** Flexible onboarding flows for "Baby Care," "My Wellness," or both:
    - Baby-only mode: Skips caregiver form, starts directly at baby details, no confirmation step.
    - Caregiver-only mode: Shows caregiver form, then navigates to home with mother tab active.
    - Both mode: Shows caregiver form, baby form, then confirmation.
- **Caregiver Profile Management:** Uses `caregiverStore.ts` (localStorage) to track caregiver setup state. Home page shows placeholder tile with pitch dialog when caregiver not set up.
- **Authentication:** Basic user management, session management, and foundation for passport.js integration.

## External Dependencies

### Third-Party UI Libraries

- **Radix UI:** Comprehensive component primitives for UI.
- **React Hook Form:** Form management and validation.
- **date-fns:** Date manipulation utility.
- **Embla Carousel:** Carousel functionality.
- **cmdk:** Command palette utility.
- **vaul:** Drawer components.

### Backend Services

- **Neon:** Serverless PostgreSQL database.
- **connect-pg-simple:** PostgreSQL session store for Express sessions.

### Development Tools

- **TypeScript:** Type checking.
- **ESBuild:** Fast server bundling.
- **PostCSS:** With Tailwind CSS and Autoprefixer for styling.

### Utility Libraries

- **clsx, tailwind-merge:** For conditional CSS class names.
- **class-variance-authority:** Component variant management.
- **Zod:** Schema validation.
- **nanoid:** ID generation.