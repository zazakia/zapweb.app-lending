# Claude Memory File

## Project Context
- **Project Name**: Lending Melanin Proposal
- **Working Directory**: `/home/b/Documents/cursor/lending melanProposal`
- **Git Repository**: Not initialized
- **Platform**: Linux 6.14.0-23-generic
- **Date Created**: 2025-07-05

## Project Overview
**Melann Lending Management System** - A modern web-based lending and microfinance management system built with Next.js 14 and Supabase, migrated from a legacy VB6 desktop application.

## Important Notes
- Migrating from VB6 + MS Access to Next.js + Supabase PostgreSQL
- Original system: "MELANN LENDING INVESTOR CORP."
- Legacy database: JCashdb.mdb with password protection
- Modern tech stack with TypeScript, Tailwind CSS, and Radix UI
- **Database Schema**: Uses `lending1` schema instead of default `public` schema

## Commands & Scripts
- `npm run dev` - Start development server (runs on localhost:3000)
- `npm install` - Install dependencies
- Database schema available in `database-schema.sql`

## Key Files & Locations
- **Main Dashboard**: `/melann-lending/src/app/page.tsx` (mirrors VB6 MDI main form)
- **Database Schema**: `/database-schema.sql` (PostgreSQL migration from Access)
- **Supabase Config**: `/melann-lending/src/lib/supabase.ts`
- **UI Components**: `/melann-lending/src/components/ui/`
- **Utils**: `/melann-lending/src/lib/utils.ts` (business logic helpers)

## VB6 System Analysis
**Original System Architecture:**
- Main Form: `brayan MDIForm1.frm` (dashboard with KPIs and navigation)
- Customer Management: `frm_Customer.frm` (dual ID validation, credit scoring)
- Loan Processing: `frm_Loan.frm` (multiple loan types, amortization)
- Payment Collection: `frm_payment.frm` (real-time collection, late fees)
- Database: `db.bas` (ADO connections to Access database)

**Core Business Logic:**
- Flat rate interest calculation (6% default)
- Sunday-excluding business day calculations
- Credit scoring with late payment tracking
- Rate of return = Total Payments / Total Principal × 100
- Multiple loan types: 1mo, 1.5mo, 2mo, 2.5mo, 3mo, 45-day emergency

## Current Progress
### ✅ Completed:
1. **Database Schema** - Complete PostgreSQL migration from Access
2. **Project Structure** - Next.js 14 with TypeScript setup
3. **Main Dashboard** - Replicates VB6 main form functionality
4. **UI Foundation** - Radix UI components and Tailwind CSS
5. **Business Logic** - Utility functions for calculations
6. **Authentication System** - Login/logout with role-based access control
7. **Customer Management** - Complete customer registration form with KYC
8. **Protected Routes** - Role-based navigation and access control
9. **Navigation System** - Modern routing between modules

### 🚧 In Progress:
- Loan processing workflows
- Payment collection interface

### 📋 Next Steps:
- Implement loan processing logic
- Create payment collection interface
- Develop reporting system
- Connect to real Supabase database
- Data migration from VB6 system

## Development Environment
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + API)
- **UI**: Radix UI primitives, Lucide React icons
- **Running**: http://localhost:3000

## Recent Context
- Project initialized on 2025-07-05
- VB6 source code analyzed from `/media/b/065A32625A324EA5/Users/cyber/Documents/dev/melan/`
- Modern dashboard successfully created and running
- Ready for next phase: authentication and form development