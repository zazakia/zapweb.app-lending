-- Melann Lending Management System - PostgreSQL Database Schema
-- Migrated from VB6 Access Database to Supabase PostgreSQL

-- Create the Lending1 schema
CREATE SCHEMA IF NOT EXISTS Lending1;

-- Set the search path to use Lending1 schema by default
SET search_path TO Lending1, public;

-- User Management Tables
CREATE TABLE users (
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
CREATE TABLE branches (
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
CREATE TABLE customers (
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
CREATE TABLE collectors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collector_code VARCHAR(20) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id),
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    territory TEXT,
    commission_rate DECIMAL(5,2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'Active',
    branch_id UUID REFERENCES branches(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Loan Types Configuration
CREATE TABLE loan_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type_name VARCHAR(50) NOT NULL,
    description TEXT,
    interest_rate DECIMAL(5,2) NOT NULL,
    term_months INTEGER NOT NULL,
    term_days INTEGER, -- For non-monthly terms like 45 days
    status VARCHAR(20) DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default loan types
INSERT INTO loan_types (type_name, description, interest_rate, term_months, term_days) VALUES
('Regular 1 Month', 'Regular loan with 1 month term', 6.00, 1, 30),
('Regular 1.5 Month', 'Regular loan with 1.5 month term', 6.00, 1, 45),
('Regular 2 Month', 'Regular loan with 2 month term', 6.00, 2, 60),
('Regular 2.5 Month', 'Regular loan with 2.5 month term', 6.00, 2, 75),
('Regular 3 Month', 'Regular loan with 3 month term', 6.00, 3, 90),
('Emergency 45 Days', 'Emergency loan with 45 days term', 6.00, 1, 45);

-- Loan Management
CREATE TABLE loans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loan_code VARCHAR(20) UNIQUE NOT NULL,
    customer_id UUID NOT NULL REFERENCES customers(id),
    loan_type_id UUID NOT NULL REFERENCES loan_types(id),
    
    -- Loan Details
    principal_amount DECIMAL(15,2) NOT NULL,
    interest_rate DECIMAL(5,2) NOT NULL,
    interest_amount DECIMAL(15,2) NOT NULL,
    total_amortization DECIMAL(15,2) NOT NULL,
    current_balance DECIMAL(15,2) NOT NULL,
    
    -- Terms
    term_months INTEGER,
    term_days INTEGER,
    
    -- Dates
    release_date DATE NOT NULL,
    maturity_date DATE NOT NULL,
    
    -- Assignment
    collector_id UUID REFERENCES collectors(id),
    branch_id UUID REFERENCES branches(id),
    
    -- Status
    loan_status VARCHAR(20) DEFAULT 'Good' CHECK (loan_status IN ('Good', 'Past Due', 'Full Paid', 'Reversed', 'Restructured')),
    
    -- Insurance and Fees
    life_insurance DECIMAL(10,2) DEFAULT 0.00,
    service_fee DECIMAL(10,2) DEFAULT 0.00,
    
    -- Loan Classification
    loan_category VARCHAR(20) DEFAULT 'Regular' CHECK (loan_category IN ('Regular', 'Emergency', 'Restructured', 'New')),
    
    -- System Fields
    created_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment Management
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id VARCHAR(20) UNIQUE NOT NULL,
    loan_id UUID NOT NULL REFERENCES loans(id),
    customer_id UUID NOT NULL REFERENCES customers(id),
    
    -- Payment Details
    payment_amount DECIMAL(15,2) NOT NULL,
    payment_date DATE NOT NULL,
    new_balance DECIMAL(15,2) NOT NULL,
    
    -- Late Payment Information
    days_late INTEGER DEFAULT 0,
    late_payment_fee DECIMAL(10,2) DEFAULT 0.00,
    is_late_payment BOOLEAN DEFAULT FALSE,
    
    -- Payment Method
    payment_method VARCHAR(20) DEFAULT 'Cash' CHECK (payment_method IN ('Cash', 'Check', 'Bank Transfer')),
    reference_number VARCHAR(50),
    
    -- Collection Information
    collector_id UUID REFERENCES collectors(id),
    collected_by UUID REFERENCES users(id),
    
    -- Status
    payment_status VARCHAR(20) DEFAULT 'Active' CHECK (payment_status IN ('Active', 'Reversed')),
    reversed_by UUID REFERENCES users(id),
    reversed_at TIMESTAMPTZ,
    reversal_reason TEXT,
    
    -- System Fields
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Amortization Schedule
CREATE TABLE amortization_schedule (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loan_id UUID NOT NULL REFERENCES loans(id),
    payment_number INTEGER NOT NULL,
    due_date DATE NOT NULL,
    principal_amount DECIMAL(15,2) NOT NULL,
    interest_amount DECIMAL(15,2) NOT NULL,
    total_payment DECIMAL(15,2) NOT NULL,
    remaining_balance DECIMAL(15,2) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'Pending' CHECK (payment_status IN ('Pending', 'Paid', 'Partial', 'Overdue')),
    actual_payment_date DATE,
    actual_amount_paid DECIMAL(15,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cash Management
CREATE TABLE cash_on_hand (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    opening_balance DECIMAL(15,2) NOT NULL,
    collections DECIMAL(15,2) DEFAULT 0.00,
    loan_releases DECIMAL(15,2) DEFAULT 0.00,
    expenses DECIMAL(15,2) DEFAULT 0.00,
    deposits_to_bank DECIMAL(15,2) DEFAULT 0.00,
    closing_balance DECIMAL(15,2) NOT NULL,
    branch_id UUID REFERENCES branches(id),
    recorded_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE cash_on_bank (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    bank_name VARCHAR(100) NOT NULL,
    account_number VARCHAR(50),
    opening_balance DECIMAL(15,2) NOT NULL,
    deposits DECIMAL(15,2) DEFAULT 0.00,
    withdrawals DECIMAL(15,2) DEFAULT 0.00,
    bank_charges DECIMAL(15,2) DEFAULT 0.00,
    closing_balance DECIMAL(15,2) NOT NULL,
    branch_id UUID REFERENCES branches(id),
    recorded_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Expense Management
CREATE TABLE chart_of_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_code VARCHAR(20) UNIQUE NOT NULL,
    account_name VARCHAR(100) NOT NULL,
    account_type VARCHAR(50) NOT NULL,
    parent_account_id UUID REFERENCES chart_of_accounts(id),
    status VARCHAR(20) DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expense_date DATE NOT NULL,
    account_id UUID NOT NULL REFERENCES chart_of_accounts(id),
    description TEXT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    reference_number VARCHAR(50),
    branch_id UUID REFERENCES branches(id),
    recorded_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Trail
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(50) NOT NULL,
    table_name VARCHAR(50),
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Activity Logs
CREATE TABLE user_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    activity VARCHAR(100) NOT NULL,
    description TEXT,
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Collection Data (for field operations)
CREATE TABLE collection_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collector_id UUID NOT NULL REFERENCES collectors(id),
    customer_id UUID NOT NULL REFERENCES customers(id),
    loan_id UUID NOT NULL REFERENCES loans(id),
    collection_date DATE NOT NULL,
    amount_due DECIMAL(15,2) NOT NULL,
    amount_collected DECIMAL(15,2) DEFAULT 0.00,
    collection_status VARCHAR(20) DEFAULT 'Pending' CHECK (collection_status IN ('Pending', 'Collected', 'Not Found', 'Refused')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- System Settings
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    data_type VARCHAR(20) DEFAULT 'string',
    updated_by UUID REFERENCES users(id),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, description, data_type) VALUES
('company_name', 'MELANN LENDING INVESTOR CORP.', 'Company name displayed in reports', 'string'),
('default_interest_rate', '6.00', 'Default interest rate percentage', 'decimal'),
('backup_interval_hours', '2', 'Automatic backup interval in hours', 'integer'),
('max_loan_amount', '100000.00', 'Maximum loan amount allowed', 'decimal'),
('late_payment_grace_days', '3', 'Grace period for late payments', 'integer'),
('sunday_business_day', 'false', 'Whether Sunday is considered a business day', 'boolean');

-- Create indexes for performance
CREATE INDEX idx_customers_customer_code ON customers(customer_code);
CREATE INDEX idx_customers_branch_id ON customers(branch_id);
CREATE INDEX idx_loans_customer_id ON loans(customer_id);
CREATE INDEX idx_loans_loan_code ON loans(loan_code);
CREATE INDEX idx_loans_collector_id ON loans(collector_id);
CREATE INDEX idx_loans_maturity_date ON loans(maturity_date);
CREATE INDEX idx_loans_status ON loans(loan_status);
CREATE INDEX idx_payments_loan_id ON payments(loan_id);
CREATE INDEX idx_payments_payment_date ON payments(payment_date);
CREATE INDEX idx_payments_customer_id ON payments(customer_id);
CREATE INDEX idx_amortization_loan_id ON amortization_schedule(loan_id);
CREATE INDEX idx_amortization_due_date ON amortization_schedule(due_date);
CREATE INDEX idx_collection_data_collector_id ON collection_data(collector_id);
CREATE INDEX idx_collection_data_date ON collection_data(collection_date);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Row Level Security (RLS) Policies
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_data ENABLE ROW LEVEL SECURITY;

-- RLS Policies will be defined based on user roles and branch access
-- These will be implemented in the application layer with Supabase Auth