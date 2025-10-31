# Jaki Global Drag-and-Drop Website Builder

## Overview

Jaki Global is a drag-and-drop website builder specifically designed for creating e-commerce storefronts. The platform enables users to visually design product pages using a builder interface and publish them as live shopping experiences. The application integrates with Printify for product catalog management and PayPal for payment processing, providing a complete end-to-end solution for creating online stores.

The system consists of three main user-facing pages:
1. **Builder** - Visual page construction tool with drag-and-drop components
2. **Shop** - Customer-facing storefront displaying products from Printify
3. **Checkout** - PayPal-powered payment processing page

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript, using Vite as the build tool and bundler.

**Routing**: Wouter for client-side routing, providing a lightweight alternative to React Router.

**UI Component Library**: Radix UI primitives styled with Tailwind CSS following the shadcn/ui pattern. The design system implements a "New York" style variant with custom color tokens and spacing scales defined in the Tailwind configuration.

**State Management**: 
- TanStack Query (React Query) for server state management and API caching
- React Context API for shopping cart state, persisted to localStorage and synchronized with backend
- Local component state for UI interactions

**Design System**: Hybrid approach combining Material Design principles for the builder interface with Shopify/Wix-inspired aesthetics for generated storefronts. Typography uses Inter for builder UI and Montserrat for customer-facing storefront content.

### Backend Architecture

**Runtime**: Node.js with Express.js server framework.

**API Design**: RESTful API with JSON payloads, organized into the following categories:
- Page configuration endpoints (`/api/pages/*`) for saving and retrieving builder designs
- Product endpoints (`/api/products/*`) for Printify catalog integration
- Cart endpoints (`/api/cart/*`) for shopping cart persistence
- PayPal integration endpoints (`/order`, `/setup`) for payment processing
- Object storage endpoints (`/api/objects/upload`, `/api/images`, `/objects/*`) for image uploads

**Data Storage**: Currently implements an in-memory storage layer (`MemStorage` class) with interfaces designed for easy migration to PostgreSQL with Drizzle ORM. The schema is defined using Drizzle's PostgreSQL adapter, indicating planned database integration.

**Development Mode**: Vite development server runs in middleware mode, proxying through Express for unified local development experience.

### Data Models

**Page Components**: Each draggable element (text, image, header, button, background, productGrid) is stored as a JSON object containing:
- Type identifier
- Content (text, URL, etc.)
- Styling properties (fonts, colors, spacing)
- Position coordinates
- Render order

**Product Data**: Sourced from Printify API, includes:
- Product metadata (title, description, images)
- Variants with pricing and options (size, color)
- Availability flags

**Shopping Cart**: Persisted both client-side (localStorage) and server-side with:
- Product and variant references
- Quantity tracking
- Price snapshots

### Build and Deployment

**🔒 STABLE BASELINE: "Tailwind Verified / Vercel Clean Deploy" (Oct 31, 2025)**

This configuration is the locked production-ready checkpoint. All future deployments should maintain this setup.

**Deployment Architecture (Split)**:
- **Backend**: Deployed to Render at `https://jaki-global-site.onrender.com`
- **Frontend**: Deployed to Vercel at `https://jaki-global-site.vercel.app`
- **API Proxy**: Vercel rewrites `/api/*` requests to Render backend

**Frontend Build (Vercel)**:
- Location: `/client` folder (Vercel root directory)
- Build tool: Vite 5.4.21
- Build command: `npm run build` (in `/client`)
- Output directory: `client/dist/`
- Framework: React 18 with TypeScript
- Configuration files:
  - `client/vite.config.ts` - Vite config with aliases (@, @assets, @shared)
  - `client/tailwind.config.ts` - **CRITICAL**: Content paths must be relative to `/client`: `["./index.html", "./src/**/*.{js,jsx,ts,tsx}"]`
  - `client/postcss.config.js` - PostCSS with Tailwind and Autoprefixer
  - `client/vercel.json` - Vercel deployment config with API rewrites
  - `client/package.json` - Frontend dependencies only

**Backend Build (Render)**:
- Location: Repository root
- Runtime: Node.js with Express
- Build command: `npm run build` (builds both frontend for dev and backend)
- Start command: `npm run start`
- Environment variables: `PRINTIFY_TOKEN`, PayPal credentials, database URL

**Critical Configuration Notes**:
1. **Tailwind Content Paths**: Must be relative to `/client` folder, not repository root
   - ✅ Correct: `["./index.html", "./src/**/*.{js,jsx,ts,tsx}"]`
   - ❌ Wrong: `["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"]`
2. **Vercel Rewrites**: All `/api/*` calls automatically proxy to Render backend
3. **Build Verification**: CSS file should be ~137-138 KB (confirms Tailwind styles included)
4. **No Code Changes Needed**: API calls work seamlessly via Vercel rewrites

**Environment Configuration**: Requires environment variables for Printify API token, PayPal credentials, and database URL (when migrating from in-memory storage).

**Deployment Workflow**:
1. Develop locally in Replit (full-stack dev server)
2. Push to GitHub main branch
3. Vercel auto-deploys frontend from `/client`
4. Render runs backend independently
5. Frontend and backend communicate via Vercel rewrites

## External Dependencies

### Third-Party Services

**Printify API** (`https://api.printify.com/v1`): Product catalog and fulfillment service. Provides:
- Shop management endpoints
- Product listing and details
- Variant configuration (sizes, colors, pricing)
- Mock data fallback when API token not configured

**PayPal Server SDK** (`@paypal/paypal-server-sdk`): Payment processing integration. Implements:
- OAuth client credentials flow
- Order creation and capture
- Sandbox/Production environment switching
- **CRITICAL**: PayPal integration code in `server/paypal.ts` and `client/src/components/PayPalButton.tsx` must never be modified per embedded warnings

**Replit Object Storage** (Google Cloud Storage backend): Image upload and serving for builder. Provides:
- Direct-to-cloud uploads via presigned URLs (POST `/api/objects/upload`)
- Image URL normalization (PUT `/api/images`)
- Public image serving (GET `/objects/:objectPath`)
- Implemented using `blueprint:javascript_object_storage` with `ObjectUploader` component (Uppy v4)
- Images stored in private directory, served publicly via normalized paths
- Integration in `PropertiesPanel` for image and background component uploads
- Environment variables: `PUBLIC_OBJECT_SEARCH_PATHS`, `PRIVATE_OBJECT_DIR`, `DEFAULT_OBJECT_STORAGE_BUCKET_ID`

### Database

**Planned**: PostgreSQL via Neon serverless driver (`@neondatabase/serverless`)

**ORM**: Drizzle ORM with schema defined for:
- `page_configs` table (id, name, components JSON)
- `carts` table (id, items JSON, timestamps)

**Current State**: In-memory storage with interface abstraction allowing seamless migration to PostgreSQL by implementing `IStorage` interface with database calls.

**Migration Tool**: Drizzle Kit configured for schema migrations with `drizzle.config.ts`.

### UI Libraries

**Radix UI**: Unstyled, accessible component primitives for dialogs, popovers, select menus, tooltips, and other interactive elements.

**Tailwind CSS**: Utility-first styling with custom design tokens for colors, spacing, and typography.

**Additional UI**: 
- `cmdk` for command palette interfaces
- `vaul` for drawer components
- `embla-carousel-react` for carousels
- `react-day-picker` for date selection
- `@uppy/core`, `@uppy/aws-s3`, `@uppy/dashboard`, `@uppy/react` (v4) for file uploads with peer dependencies: `@uppy/drag-drop`, `@uppy/file-input`, `@uppy/progress-bar`, `@uppy/status-bar`, `@uppy/informer`

### Session Management

**Planned**: PostgreSQL session store via `connect-pg-simple` for Express sessions when database is integrated.