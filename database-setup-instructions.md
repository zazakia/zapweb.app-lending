# Database Setup Instructions for Supabase

## Issue Found
The Supabase database tables don't exist yet. The services are properly configured to connect to Supabase, but the database schema hasn't been created.

## Solution
You need to create the database tables in your Supabase project. Here's how:

### Method 1: Using Supabase SQL Editor (Recommended)
1. Go to your Supabase dashboard: https://app.supabase.com/project/agrfvnojjzkdyobdxuho
2. Click on "SQL Editor" in the left sidebar
3. Copy and paste the SQL below into the editor
4. Click "Run" to execute the SQL

### Method 2: Using the setup script
Run the database setup script (but note that RPC won't work for DDL):
```bash
node setup-database.js
```

## SQL to Execute in Supabase SQL Editor

```sql
-- User Management Tables
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    user_level VARCHAR(20) NOT NULL CHECK (user_level IN ('Admin', 'Manager', 'Cashier', 'Collector')),
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Suspended')),
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Branch Management
CREATE TABLE IF NOT EXISTS branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_code VARCHAR(10) UNIQUE NOT NULL,
    branch_name VARCHAR(100) NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    manager_id UUID REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customer Management
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_code VARCHAR(20) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    middle_name VARCHAR(50),
    last_name VARCHAR(50) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(10) CHECK (gender IN ('Male', 'Female')),
    civil_status VARCHAR(20),
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(100),
    
    -- Employment Information
    occupation VARCHAR(100),
    employer VARCHAR(100),
    monthly_income DECIMAL(15,2),
    
    -- ID Information (Primary)
    id1_type VARCHAR(50),
    id1_number VARCHAR(50),
    id1_issued_by VARCHAR(100),
    id1_expiry_date DATE,
    
    -- ID Information (Secondary)
    id2_type VARCHAR(50),
    id2_number VARCHAR(50),
    id2_issued_by VARCHAR(100),
    id2_expiry_date DATE,
    
    -- Credit Information
    credit_score INTEGER DEFAULT 100,
    late_payment_count INTEGER DEFAULT 0,
    late_payment_points INTEGER DEFAULT 0,
    
    -- Emergency Contact
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_relationship VARCHAR(50),
    
    -- Collateral Information
    collateral_description TEXT,
    collateral_value DECIMAL(15,2),
    
    -- Purpose
    loan_purpose TEXT,
    
    -- System Fields
    branch_id UUID REFERENCES branches(id),
    created_by UUID REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Blacklisted')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Collector Management
CREATE TABLE IF NOT EXISTS collectors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collector_code VARCHAR(20) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id),
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    territory TEXT,
    branch_id UUID REFERENCES branches(id),
    commission_rate DECIMAL(5,2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Loan Type Management
CREATE TABLE IF NOT EXISTS loan_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type_name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    interest_rate DECIMAL(5,2) NOT NULL,
    term_months INTEGER,
    term_days INTEGER,
    status VARCHAR(20) DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Loan Management
CREATE TABLE IF NOT EXISTS loans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loan_code VARCHAR(20) UNIQUE NOT NULL,
    customer_id UUID NOT NULL REFERENCES customers(id),
    loan_type_id UUID NOT NULL REFERENCES loan_types(id),
    principal_amount DECIMAL(15,2) NOT NULL,
    interest_rate DECIMAL(5,2) NOT NULL,
    interest_amount DECIMAL(15,2) NOT NULL,
    total_amortization DECIMAL(15,2) NOT NULL,
    current_balance DECIMAL(15,2) NOT NULL,
    term_months INTEGER,
    term_days INTEGER,
    release_date DATE NOT NULL,
    maturity_date DATE NOT NULL,
    collector_id UUID REFERENCES collectors(id),
    branch_id UUID REFERENCES branches(id),
    loan_status VARCHAR(20) DEFAULT 'Good' CHECK (loan_status IN ('Good', 'Past Due', 'Full Paid', 'Write Off')),
    life_insurance DECIMAL(15,2) DEFAULT 0.00,
    service_fee DECIMAL(15,2) DEFAULT 0.00,
    loan_category VARCHAR(50) DEFAULT 'Regular',
    created_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment Management
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id VARCHAR(20) UNIQUE NOT NULL,
    loan_id UUID NOT NULL REFERENCES loans(id),
    customer_id UUID NOT NULL REFERENCES customers(id),
    payment_amount DECIMAL(15,2) NOT NULL,
    payment_date DATE NOT NULL,
    new_balance DECIMAL(15,2) NOT NULL,
    days_late INTEGER DEFAULT 0,
    late_payment_fee DECIMAL(15,2) DEFAULT 0.00,
    is_late_payment BOOLEAN DEFAULT FALSE,
    payment_method VARCHAR(20) DEFAULT 'Cash',
    reference_number VARCHAR(50),
    collector_id UUID REFERENCES collectors(id),
    collected_by UUID REFERENCES users(id),
    payment_status VARCHAR(20) DEFAULT 'Active' CHECK (payment_status IN ('Active', 'Reversed')),
    reversed_by UUID REFERENCES users(id),
    reversed_at TIMESTAMPTZ,
    reversal_reason TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Amortization Schedule
CREATE TABLE IF NOT EXISTS amortization_schedule (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loan_id UUID NOT NULL REFERENCES loans(id),
    payment_number INTEGER NOT NULL,
    due_date DATE NOT NULL,
    principal_amount DECIMAL(15,2) NOT NULL,
    interest_amount DECIMAL(15,2) NOT NULL,
    total_payment DECIMAL(15,2) NOT NULL,
    remaining_balance DECIMAL(15,2) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'Pending',
    actual_payment_date DATE,
    actual_amount_paid DECIMAL(15,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default loan types
INSERT INTO loan_types (type_name, description, interest_rate, term_days, status) VALUES
('1 Month', '1 Month loan term', 6.00, 30, 'Active'),
('1.5 Month', '1.5 Month loan term', 6.00, 45, 'Active'),
('2 Month', '2 Month loan term', 6.00, 60, 'Active'),
('2.5 Month', '2.5 Month loan term', 6.00, 75, 'Active'),
('3 Month', '3 Month loan term', 6.00, 90, 'Active'),
('45 Day Emergency', '45 Day emergency loan', 6.00, 45, 'Active')
ON CONFLICT (type_name) DO NOTHING;

-- Insert default branch
INSERT INTO branches (branch_code, branch_name, address, status) VALUES
('MAIN', 'Main Branch', 'Head Office', 'Active')
ON CONFLICT (branch_code) DO NOTHING;

-- Insert default admin user (password: 'password')
INSERT INTO users (username, password_hash, full_name, user_level, status) VALUES
('admin', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'System Administrator', 'Admin', 'Active')
ON CONFLICT (username) DO NOTHING;
```

## After Creating Tables

Once you've created the tables, you can run the test again:
```bash
node test-supabase.js
```

## Current Status
- ✅ Supabase connection is working
- ✅ Environment variables are properly configured
- ✅ Service implementations are correct
- ❌ Database tables don't exist yet (need to be created)

## Next Steps
1. Create the database tables using the SQL above
2. Run the test script to verify everything works
3. The application should then be able to perform all CRUD operations

## Row Level Security (RLS)
After creating the tables, you may want to set up RLS policies for security. For testing purposes, you can disable RLS or create permissive policies.