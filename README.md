# Melann Lending Management System

A modern lending and microfinance management system built with Next.js 14 and Supabase, migrated from a legacy VB6 system.

## 🚀 Features

### Core Functionality
- **Customer Management** - Complete KYC with dual ID validation
- **Loan Processing** - Multiple loan types with flexible terms
- **Payment Collection** - Real-time payment processing and tracking
- **Credit Scoring** - Automated credit assessment and late payment tracking
- **Collection Management** - Territory-based collector assignment
- **Financial Reporting** - Comprehensive reporting and analytics

### Dashboard & Analytics
- Real-time KPI monitoring
- Rate of return calculations
- Active vs past-due loan tracking
- Daily cash reports (DCR)
- Collection sheets (CS)

### Modern Features
- Responsive web design
- Real-time data synchronization
- Mobile-friendly interface
- Advanced analytics and reporting
- Audit trail and activity logging

## 🛠 Tech Stack

- **Frontend**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI primitives
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **Icons**: Lucide React

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd melann-lending
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Copy `.env.local` and configure your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

4. **Set up the database**
   Run the database schema in your Supabase project:
   ```bash
   # Copy the contents of database-schema.sql to your Supabase SQL editor
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🗃 Database Schema

The system uses a comprehensive PostgreSQL schema with the following main tables:

### Core Tables
- `users` - System users and authentication
- `customers` - Customer information and KYC data
- `loans` - Loan records and terms
- `payments` - Payment transactions
- `collectors` - Field collection staff
- `loan_types` - Loan product configuration

### Supporting Tables
- `branches` - Multi-branch operations
- `cash_on_hand` / `cash_on_bank` - Treasury management
- `expenses` - Operating cost tracking
- `audit_logs` - System activity tracking
- `collection_data` - Field collection operations

## 🔧 Configuration

### Loan Types
The system supports multiple loan types:
- Regular 1 Month (30 days)
- Regular 1.5 Month (45 days)
- Regular 2 Month (60 days)
- Regular 2.5 Month (75 days)
- Regular 3 Month (90 days)
- Emergency 45 Days

### Interest Calculation
- Flat rate system (not reducing balance)
- Default rate: 6% per term
- Interest = Principal × Rate
- Total Amortization = Principal + Interest

### Business Rules
- Sunday exclusion for business day calculations
- Grace period for late payments
- Automatic credit score adjustments
- Real-time balance updates

## 📊 Key Features Migrated from VB6

### Dashboard (MDI Main Form)
- Real-time KPI display
- Company branding and date/time
- Quick access toolbar
- Rate of return calculation

### Customer Management (frm_Customer)
- Comprehensive customer registration
- Dual ID validation system
- Credit scoring integration
- Emergency contact management

### Loan Processing (frm_Loan)
- Multiple loan types and terms
- Automatic amortization calculation
- Maturity date computation
- Collector assignment

### Payment Processing (frm_payment)
- Real-time payment collection
- Late payment detection
- Balance calculations
- Payment reversal capabilities

### Reporting System
- Daily Cash Report (DCR)
- Collection Sheets (CS)
- Statement of Account (SOA)
- Various financial reports

## 🔐 Security Features

- Row Level Security (RLS) in Supabase
- Role-based access control
- Audit logging for all transactions
- Encrypted sensitive data storage
- Session management and timeout

## 🚦 Development Status

### ✅ Completed
- [x] Database schema design
- [x] Basic project structure
- [x] Main dashboard interface
- [x] UI component library setup
- [x] TypeScript configuration

### 🚧 In Progress
- [ ] Authentication system
- [ ] Customer management forms
- [ ] Loan processing workflows
- [ ] Payment collection interface

### 📋 Planned
- [ ] Reporting system
- [ ] Data migration tools
- [ ] Mobile responsiveness
- [ ] Performance optimization
- [ ] Testing suite

## 📱 Mobile Support

The application is designed to be mobile-friendly for field collectors:
- Responsive design for tablets and phones
- Touch-friendly interfaces
- Offline capability (planned)
- GPS integration for field operations (planned)

## 🔄 Migration from VB6

This system replaces a legacy VB6 application with the following improvements:

### Technical Modernization
- Web-based instead of desktop application
- Cloud database instead of local Access files
- Modern UI instead of Windows forms
- Real-time updates instead of file-based sync

### Business Improvements
- Enhanced reporting and analytics
- Better user experience
- Mobile accessibility
- Improved security and audit trails
- Scalable architecture

### Data Migration
The migration process preserves all existing data while upgrading the structure:
- Customer records and history
- Loan portfolios and payment records
- User accounts and permissions
- Configuration settings

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For technical support or questions about the lending system:
- Create an issue in the repository
- Contact the development team
- Refer to the user manual (coming soon)

## 🔮 Future Enhancements

- Integration with credit bureaus
- SMS notifications for payments
- Mobile app for collectors
- Advanced analytics and reporting
- API for third-party integrations
- Multi-currency support