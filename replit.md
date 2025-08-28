# Overview

This is a merchant-volunteer assignment application built with React frontend and Express backend. The application allows volunteers to view available merchants, assign themselves to merchants, and track their assignments. It features a modern UI built with shadcn/ui components, Tailwind CSS, and includes integration with Google Sheets for merchant data management.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter for client-side routing
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query for server state and React hooks for local state
- **Build Tool**: Vite with TypeScript configuration

## Backend Architecture
- **Runtime**: Node.js with Express server
- **Language**: TypeScript with ES modules
- **Data Layer**: Drizzle ORM for database operations
- **Storage**: PostgreSQL database with in-memory fallback for development
- **API Design**: RESTful endpoints for merchants, volunteers, and assignments

## Database Schema
- **Merchants Table**: Business information including name, category, address, contact details, status, and assignment tracking
- **Volunteers Table**: Volunteer profiles with contact information and role management
- **Relationships**: Simple assignment tracking through volunteer names in merchant records

## Authentication & Authorization
- No authentication system implemented - open access application
- Role-based structure exists in volunteer schema but not enforced

## Development & Build Pipeline
- **Development**: Hot reload with Vite dev server
- **Build**: TypeScript compilation with esbuild for production
- **Database**: Drizzle migrations for schema management
- **Deployment**: Production build creates static assets and bundled server