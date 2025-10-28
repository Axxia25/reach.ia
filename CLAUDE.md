# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **real-time CRM dashboard for managing automotive sales leads** built with Next.js 14, TypeScript, Supabase, and Tailwind CSS. The system supports multi-user access with role-based authentication (vendedor/gerente/admin) and real-time data synchronization across all connected clients.

## Development Commands

```bash
# Install dependencies
npm install

# Run development server (localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Environment Configuration

Required environment variables in `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Architecture Overview

### Authentication & Authorization Flow

The application uses **Supabase Auth with role-based access control**:

1. **Middleware** (`src/middleware.ts`) intercepts ALL routes and enforces role-based redirects:
   - **VENDEDOR**: Can only access their own dashboard (`/dashboard/vendedor/[nome]`)
   - **GERENTE**: Can access main dashboard + all vendor dashboards (no admin panel)
   - **ADMIN**: Full access to all routes including admin panel (`/dashboard/admin`)

2. **User profiles** are stored in `vendedor_profiles` table with fields:
   - `id` (FK to auth.users)
   - `email`
   - `vendedor_name` (display name for vendor dashboards)
   - `role` (VENDEDOR/GERENTE/ADMIN)

3. The middleware fetches user profile on every protected route access and redirects based on role. This happens BEFORE pages render.

### Real-time Data Architecture

**Critical**: All data updates use Supabase Realtime subscriptions:

1. **useLeads hook** (`src/hooks/useLeads.ts`) is the primary data fetching mechanism:
   - Establishes PostgreSQL change stream subscription to `leads` table
   - Listens for INSERT/UPDATE/DELETE events
   - Automatically refetches all data when changes occur
   - Filters data by period (7/30/90 days) client-side

2. **Data flow**:
   ```
   Database Change → Realtime Channel → useLeads refetch → Component Re-render
   ```

3. When modifying data fetching logic, ensure:
   - Subscriptions are properly cleaned up in useEffect return
   - Period filtering is applied consistently
   - Loading states are managed to prevent UI flicker

### Database Schema

**Main table**: `leads`
- Contains all lead data: nome, telefone, veiculo, vendedor, timestamps
- Has RLS policies requiring authenticated users
- Indexed on: nome, telefone, veiculo, vendedor, created_at

**Views for aggregation**:
- `leads_daily_summary` - Daily metrics (total_leads, vendedores_ativos, veiculos_diferentes)
- `leads_por_vendedor` - Per-vendor stats (total_leads, dias_ativos, ultimo_contato)
- `leads_stats_realtime` - Global statistics

**Database functions**:
- `search_leads(search_term, vendor_filter, period_days)` - Advanced filtering
- `cleanup_old_leads()` - Removes leads older than 6 months
- `update_updated_at_column()` - Auto-updates timestamps

### Component Architecture

**Page structure** (App Router):
- `/` - Login page (Auth component)
- `/dashboard` - Main gerencial dashboard (MetricsCards, LeadsTable, LeadsChart)
- `/dashboard/vendedor/[nome]` - Individual vendor performance
- `/dashboard/metricas/*` - Specialized metric views (comercial, financeiras, produto)
- `/dashboard/admin/usuarios` - User management panel

**Key components**:
- **MetricsCards**: Displays 4 KPI cards with trend indicators (total leads, vendors, vehicles, avg/day)
- **LeadsTable**: Searchable/filterable table with client-side search
- **LeadsChart**: Recharts line chart showing temporal lead distribution
- **FunnelChart**: Sales funnel visualization
- **ConversionMetrics**: 4-card layout for conversion analysis
- **Sidebar**: Navigation with vendor list and role-based menu items

### State Management

**No global state library** - uses React hooks and prop drilling:
- Authentication state: Local state + Supabase session in each page
- Lead data: Managed by `useLeads` hook in parent pages, passed to children
- UI state (period, filters): Local useState in page components

### Styling System

- **Tailwind CSS** with custom configuration
- **Radix UI** for accessible primitives (Avatar, Tooltip, Collapsible, Separator)
- **Lucide React** for icons
- **next-themes** for dark/light mode support
- Responsive design using Tailwind's responsive prefixes (md:, lg:)

## Important Patterns

### Adding New Dashboard Pages

1. Create page in `src/app/dashboard/[route]/page.tsx`
2. Mark as `"use client"` if using hooks
3. Add authentication check with `useEffect` + `supabase.auth.getSession()`
4. Use `useLeads(period)` hook for data
5. Update middleware if route needs role restrictions
6. Add navigation link in Sidebar component

### Modifying Data Fetching

1. **Always modify `useLeads` hook** for shared data needs
2. For page-specific data, create new custom hook in `src/hooks/`
3. Ensure realtime subscription setup follows this pattern:
   ```typescript
   const channel = supabase
     .channel('unique_channel_name')
     .on('postgres_changes', { event: '*', schema: 'public', table: 'table_name' }, (payload) => {
       // Refetch data
     })
     .subscribe()

   // Cleanup in useEffect return
   return () => { supabase.removeChannel(channel) }
   ```

### Database Changes

1. Update schema in Supabase Dashboard SQL Editor
2. If modifying `leads` table, update TypeScript types in `src/lib/supabase.ts`
3. Update RLS policies if changing access patterns
4. Ensure realtime publication includes new tables: `ALTER publication supabase_realtime ADD TABLE table_name;`

### Role-Based Access

When adding features that should be restricted by role:
1. Add logic to `src/middleware.ts` for route-level restrictions
2. Use `userProfile.role` checks in page components for UI-level restrictions
3. Implement RLS policies in Supabase for database-level security

## Supabase Setup

The database is initialized with `setup-supabase.sql` which includes:
- Table creation with proper types and constraints
- RLS policies for authenticated access
- Realtime publication configuration
- Views for aggregated data
- Indexes for performance
- Utility functions for search and cleanup

When setting up a new environment:
1. Create Supabase project
2. Run `setup-supabase.sql` in SQL Editor
3. Create users in Supabase Auth
4. Manually create user profiles in `vendedor_profiles` table
5. Configure Site URL in Auth settings to match deployment URL

## Deployment

### Vercel (Recommended)

**Quick Setup:**
1. Import the repository on [vercel.com](https://vercel.com)
2. Vercel auto-detects Next.js settings
3. Add environment variables in Project Settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

**Configuration:**
- Build command: `npm run build` (auto-detected)
- Output directory: `.next` (auto-detected)
- Install command: `npm install` (auto-detected)
- Node version: 18+ (auto-detected from package.json engines)
- Region: `gru1` (São Paulo - configured in vercel.json)

The `vercel.json` includes:
- Security headers (X-Frame-Options, CSP, etc.)
- Cache optimization for static assets
- Regional deployment settings

**After deployment:**
1. Update Supabase Auth settings:
   - Set Site URL to Vercel domain (e.g., `https://your-app.vercel.app`)
   - Add redirect URLs: `https://your-app.vercel.app/auth/callback`
2. Test authentication flow
3. Verify real-time updates work across clients

### Netlify (Alternative)

Build settings:
- **Build command**: `npm run build`
- **Publish directory**: `.next`
- **Node version**: 20
- Requires `@netlify/plugin-nextjs` plugin (configured in netlify.toml)

Required environment variables (same as local):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

After deployment, update Supabase Auth settings:
- Set Site URL to Netlify domain
- Add redirect URLs if needed

## Common Gotchas

1. **Middleware runs on every request** - Keep logic lightweight to avoid performance issues
2. **Client components** (`"use client"`) are required for hooks - pages using useLeads must be client components
3. **Realtime subscriptions** persist across component unmounts - always clean up in useEffect return
4. **RLS policies** are enforced at database level - test with different user roles when modifying data access
5. **Period filtering** happens client-side in useLeads - changing this to server-side requires modifying the query
6. **Vendor names in URLs** are encoded - use `encodeURIComponent()` for names with special characters
