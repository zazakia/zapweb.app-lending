# Melann Lending Management System - API Documentation

## Overview
This document provides comprehensive API documentation for the Melann Lending Management System, including service interfaces, data models, and integration guidelines.

## Table of Contents
- [Authentication](#authentication)
- [Customer Service API](#customer-service-api)
- [Loan Service API](#loan-service-api)
- [Payment Service API](#payment-service-api)
- [Error Handling](#error-handling)
- [Data Models](#data-models)
- [Performance Optimization](#performance-optimization)

## Authentication

### Overview
The system uses Supabase authentication with role-based access control.

### User Roles
- **Collector**: Can view and collect payments
- **Cashier**: Can process payments and basic transactions
- **Manager**: Can manage loans and view reports
- **Admin**: Full system access including configuration

### Authentication Flow
```typescript
// Login
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
})

// Get current user
const { data: { user } } = await supabase.auth.getUser()

// Logout
await supabase.auth.signOut()
```

## Customer Service API

### Interface
```typescript
interface CustomerService {
  getCustomers(limit?: number, offset?: number): Promise<Customer[]>
  getCustomersCount(): Promise<number>
  getCustomerById(id: string): Promise<Customer | null>
  searchCustomers(searchTerm: string, limit?: number): Promise<Customer[]>
  getCustomersMinimal(): Promise<Pick<Customer, 'id' | 'customer_code' | 'first_name' | 'last_name'>[]>
  createCustomer(customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>): Promise<Customer>
  updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer>
  deleteCustomer(id: string): Promise<boolean>
}
```

### Methods

#### `getCustomers(limit?, offset?)`
Retrieves paginated list of customers.

**Parameters:**
- `limit` (optional): Maximum number of customers to return (default: 50)
- `offset` (optional): Number of customers to skip for pagination

**Returns:** `Promise<Customer[]>`

**Example:**
```typescript
// Get first 20 customers
const customers = await customerService.getCustomers(20, 0)

// Get next 20 customers
const nextCustomers = await customerService.getCustomers(20, 20)
```

#### `searchCustomers(searchTerm, limit?)`
Searches customers by name, customer code, phone, or email.

**Parameters:**
- `searchTerm`: String to search for
- `limit` (optional): Maximum results (default: 50)

**Returns:** `Promise<Customer[]>`

**Example:**
```typescript
const results = await customerService.searchCustomers('john', 10)
```

#### `createCustomer(customer)`
Creates a new customer record.

**Parameters:**
- `customer`: Customer data without id, created_at, updated_at

**Returns:** `Promise<Customer>`

**Example:**
```typescript
const newCustomer = await customerService.createCustomer({
  customer_code: 'CUST001',
  first_name: 'John',
  last_name: 'Doe',
  email: 'john@example.com',
  phone: '+1234567890',
  credit_score: 750,
  late_payment_count: 0,
  late_payment_points: 0,
  status: 'active'
})
```

## Loan Service API

### Interface
```typescript
interface LoanService {
  getLoans(customerId?: string): Promise<Loan[]>
  getLoanById(id: string): Promise<Loan | null>
  getLoansSummary(): Promise<LoanSummary>
  createLoan(loan: CreateLoanRequest): Promise<Loan>
  updateLoan(id: string, updates: Partial<Loan>): Promise<Loan>
  approveLoan(id: string): Promise<Loan>
  rejectLoan(id: string, reason: string): Promise<Loan>
  calculateAmortization(principal: number, rate: number, term: number): AmortizationSchedule[]
}
```

### Methods

#### `getLoansSummary()`
Returns aggregated loan statistics.

**Returns:** `Promise<LoanSummary>`

**Response:**
```typescript
interface LoanSummary {
  totalLoans: number
  totalPrincipal: number
  activeLoans: number
  pastDueLoans: number
  averageInterestRate: number
  totalOutstanding: number
}
```

#### `calculateAmortization(principal, rate, term)`
Calculates loan amortization schedule.

**Parameters:**
- `principal`: Loan amount
- `rate`: Annual interest rate (as percentage)
- `term`: Loan term in months

**Returns:** `Promise<AmortizationSchedule[]>`

**Example:**
```typescript
const schedule = await loanService.calculateAmortization(100000, 6, 12)
// Returns monthly payment breakdown
```

## Payment Service API

### Interface
```typescript
interface PaymentService {
  getPayments(loanId?: string): Promise<Payment[]>
  getPaymentById(id: string): Promise<Payment | null>
  getPaymentSummary(): Promise<PaymentSummary>
  recordPayment(payment: CreatePaymentRequest): Promise<Payment>
  getDailyCollectionReport(date: string): Promise<DailyCollectionReport>
  getOverduePayments(): Promise<Payment[]>
}
```

### Methods

#### `recordPayment(payment)`
Records a new payment.

**Parameters:**
```typescript
interface CreatePaymentRequest {
  loan_id: string
  payment_amount: number
  payment_date: string
  payment_method: 'cash' | 'check' | 'bank_transfer' | 'online'
  collector_id?: string
  notes?: string
}
```

**Returns:** `Promise<Payment>`

#### `getDailyCollectionReport(date)`
Generates daily collection report.

**Parameters:**
- `date`: Date in YYYY-MM-DD format

**Returns:** `Promise<DailyCollectionReport>`

**Response:**
```typescript
interface DailyCollectionReport {
  date: string
  totalCollected: number
  totalTransactions: number
  collectionsByMethod: Record<string, number>
  collectorSummary: CollectorSummary[]
  overdueCollection: number
}
```

## Error Handling

### Standard Error Response
```typescript
interface APIError {
  code: string
  message: string
  details?: any
  timestamp: string
}
```

### Common Error Codes
- `INVALID_INPUT`: Invalid request parameters
- `NOT_FOUND`: Resource not found
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `VALIDATION_ERROR`: Data validation failed
- `DATABASE_ERROR`: Database operation failed
- `NETWORK_ERROR`: Network connectivity issue

### Error Handling Example
```typescript
try {
  const customer = await customerService.getCustomerById('123')
} catch (error) {
  if (error.code === 'NOT_FOUND') {
    console.log('Customer not found')
  } else if (error.code === 'UNAUTHORIZED') {
    // Redirect to login
  } else {
    console.error('Unexpected error:', error.message)
  }
}
```

## Data Models

### Customer
```typescript
interface Customer {
  id: string
  customer_code: string
  first_name: string
  middle_name?: string
  last_name: string
  date_of_birth?: string
  gender?: 'Male' | 'Female' | 'Other'
  civil_status?: 'Single' | 'Married' | 'Divorced' | 'Widowed'
  address?: string
  phone?: string
  email?: string
  occupation?: string
  employer?: string
  monthly_income?: number
  
  // ID Information
  id1_type?: string
  id1_number?: string
  id1_issued_by?: string
  id1_expiry_date?: string
  id2_type?: string
  id2_number?: string
  id2_issued_by?: string
  id2_expiry_date?: string
  
  // Credit Information
  credit_score: number
  late_payment_count: number
  late_payment_points: number
  
  // Emergency Contact
  emergency_contact_name?: string
  emergency_contact_phone?: string
  emergency_contact_relationship?: string
  
  // Collateral
  collateral_description?: string
  collateral_value?: number
  
  // Loan Information
  loan_purpose?: string
  
  // System Fields
  branch_id?: string
  created_by?: string
  status: 'active' | 'inactive' | 'suspended'
  created_at: string
  updated_at: string
}
```

### Loan
```typescript
interface Loan {
  id: string
  customer_id: string
  loan_type_id: string
  application_date: string
  principal_amount: number
  interest_rate: number
  term_months: number
  payment_frequency: 'weekly' | 'bi-weekly' | 'monthly'
  first_payment_date: string
  maturity_date: string
  loan_purpose: string
  collateral_description?: string
  collateral_value?: number
  loan_status: 'pending' | 'approved' | 'active' | 'paid' | 'defaulted' | 'rejected'
  approval_date?: string
  approved_by?: string
  disbursement_date?: string
  disbursement_amount?: number
  current_balance: number
  total_payments_made: number
  last_payment_date?: string
  next_payment_date?: string
  next_payment_amount: number
  total_amortization: number
  created_by: string
  created_at: string
  updated_at: string
}
```

### Payment
```typescript
interface Payment {
  id: string
  loan_id: string
  payment_amount: number
  payment_date: string
  payment_method: 'cash' | 'check' | 'bank_transfer' | 'online'
  reference_number?: string
  collector_id?: string
  is_late_payment: boolean
  late_payment_fee?: number
  principal_payment: number
  interest_payment: number
  remaining_balance: number
  payment_status: 'pending' | 'completed' | 'failed' | 'reversed'
  notes?: string
  created_by: string
  created_at: string
  updated_at: string
}
```

## Performance Optimization

### Caching
The system implements intelligent caching for frequently accessed data:

```typescript
// Auto-cached with 5-minute TTL
const dashboardData = await useDashboardData()

// Manual cache control
NavigationOptimizer.prefetchData('/api/customers', fetchCustomers)
```

### Pagination
All list endpoints support pagination:

```typescript
// Get customers with pagination
const customers = await customerService.getCustomers(50, 0)
const total = await customerService.getCustomersCount()
```

### Search Optimization
Search endpoints use optimized queries with limited field selection:

```typescript
// Optimized search with minimal fields
const results = await customerService.searchCustomers('john', 20)
```

### Rate Limiting
API endpoints are rate-limited to prevent abuse:
- 100 requests per minute for authenticated users
- 10 requests per minute for unauthenticated users

## Testing

### Unit Tests
```bash
npm run test
```

### Performance Tests
```bash
npm run test:performance
```

### API Integration Tests
```bash
npm run test:api
```

## Environment Configuration

### Development
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NODE_ENV=development
```

### Production
```env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_supabase_anon_key
NODE_ENV=production
```

## Security Considerations

### Data Protection
- All sensitive data is encrypted at rest
- PII is masked in logs and error messages
- Database access uses row-level security (RLS)

### Authentication Security
- JWT tokens expire after 1 hour
- Refresh tokens are rotated on each use
- Failed login attempts are rate-limited

### API Security
- All endpoints require authentication
- CORS is configured for specific domains
- Input validation on all parameters
- SQL injection protection via parameterized queries

## Support and Troubleshooting

### Common Issues

1. **Authentication Failures**
   - Check token expiration
   - Verify user permissions
   - Check network connectivity

2. **Performance Issues**
   - Enable caching
   - Use pagination for large datasets
   - Check database indexes

3. **Data Consistency**
   - Use transactions for multi-step operations
   - Implement optimistic locking
   - Handle concurrent access properly

### Getting Help
- Check error logs in the Error Monitor
- Review performance metrics
- Contact development team for system issues