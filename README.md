# UNRE GE Request & Budget Control System

**Comprehensive General Expenditure Request and Budget Management System for the University of Natural Resources & Environment of PNG**

---

## 🎯 Overview

The UNRE GE Request System is a complete enterprise solution designed to modernize and streamline the General Expenditure request and approval workflow at the University of Natural Resources & Environment (UNRE) of Papua New Guinea. This system eliminates paper-based processes, prevents lost forms, ensures budget compliance, and integrates seamlessly with the PGAS AAP budget system.

### Key Objectives

- ✅ **Eliminate Paper Trail**: Replace paper GE forms with digital workflows
- ✅ **Prevent Budget Overruns**: Real-time budget validation and commitment tracking
- ✅ **Ensure Accountability**: Complete audit trail for every transaction
- ✅ **Streamline Approvals**: Multi-level approval workflows with automated routing
- ✅ **PGAS Integration**: Seamless sync with AAP budget for real-time spending visibility
- ✅ **Manager Dashboards**: Full visibility into budget utilization by cost centre

---

## 🏗️ System Architecture

### Technology Stack

- **Frontend**: Next.js 14 (App Router) with TypeScript
- **UI Framework**: Tailwind CSS + shadcn/ui components
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage
- **Deployment**: Netlify / Vercel (or on-premise)

### Core Modules

1. **User & Role Management** - Multi-role system with granular permissions
2. **GE Request Management** - Create, track, and manage GE requests
3. **Approval Workflow Engine** - Configurable multi-level approval routing
4. **Budget Tracking** - Real-time budget vs actual vs commitment tracking
5. **PGAS Integration** - Import/sync AAP budget and expenditure data
6. **Commitment Management** - Track commitments against budget lines
7. **Payment Processing** - Payment voucher generation and tracking
8. **Document Management** - Upload and manage supporting documents
9. **Reporting & Analytics** - Comprehensive dashboards and reports
10. **Audit & Compliance** - Complete audit trail for all transactions

---

## 👥 User Roles

### 1. **Requestor** (Staff)
- Create GE requests
- Upload supporting documents
- Track request status
- View own requests and cost centre budget

### 2. **Head of Department (HOD)**
- Approve/reject requests from department
- View department budget status
- First-level approval authority

### 3. **Dean / Director**
- Approve requests from faculty/division
- Second-level approval for amounts > K5,000
- View faculty-wide budget utilization

### 4. **Bursar / Finance Manager**
- Review budget availability
- Approve/reject based on funds
- Manage commitments
- Third-level approval

### 5. **Registrar / Vice Chancellor**
- Final approval for large amounts (> K20,000)
- Strategic expenditure approvals
- University-wide budget oversight

### 6. **Bursary Clerk**
- Process payment vouchers
- Record payment details
- Mark payments as paid
- Generate payment reports

### 7. **Budget Officer**
- Manage AAP budget lines
- Import PGAS data
- Configure budget mappings
- Monitor budget utilization

### 8. **System Administrator**
- User account management
- Role assignments
- Workflow configuration
- System settings

### 9. **Auditor**
- Read-only access
- View complete audit trail
- Generate compliance reports
- Verify approval authenticity

---

## 🔄 Workflow Overview

### GE Request Lifecycle

```
1. CREATE REQUEST
   ↓
2. HOD APPROVAL (Auto-route based on amount)
   ↓
3. DEAN APPROVAL (If > K5,000)
   ↓
4. BUDGET CHECK (PGAS integration)
   ↓
5. BURSAR APPROVAL (Budget validation)
   ↓
6. REGISTRAR/VC APPROVAL (If > K20,000)
   ↓
7. COMMITMENT CREATED (Lock budget)
   ↓
8. PURCHASE ORDER ISSUED (Optional)
   ↓
9. GOODS/SERVICES RECEIVED (GRN)
   ↓
10. PAYMENT VOUCHER CREATED
    ↓
11. PAYMENT PROCESSED
    ↓
12. PGAS UPDATED
```

### Approval Routing Logic

| Amount Range | Workflow Path |
|--------------|---------------|
| K0 - K5,000 | HOD → Bursar |
| K5,001 - K20,000 | HOD → Dean → Bursar |
| K20,001 - K100,000 | HOD → Dean → Bursar → Registrar |
| > K100,000 or Capital | HOD → Dean → Bursar → Registrar → VC |

---

## 💾 Database Schema

### Core Tables

#### User Management
- `user_profiles` - Extended user information
- `roles` - System roles (HOD, Dean, Bursar, etc.)
- `user_roles` - User-to-role assignments with cost centre mapping

#### Organizational Structure
- `cost_centres` - Faculties, Schools, Divisions, Projects
- `budget_lines` - AAP budget lines linked to PGAS votes

#### GE Requests
- `ge_requests` - Main GE request table
- `ge_request_items` - Line items for each request
- `expense_types` - Categories of expenses
- `suppliers` - Supplier master data

#### Workflow
- `ge_approvals` - Approval history for each request
- `approval_workflows` - Configurable workflow rules

#### Financial
- `commitments` - Budget commitments from approved requests
- `payment_vouchers` - Payment processing records
- `purchase_orders` - PO generation (optional)
- `goods_received_notes` - GRN tracking

#### System
- `attachments` - Document storage metadata
- `notifications` - User notifications
- `audit_logs` - Complete audit trail
- `system_config` - System configuration

---

## 🔧 Installation & Setup

### Prerequisites

- Node.js 18+ / Bun
- PostgreSQL database (or Supabase account)
- Git

### Local Development Setup

```bash
# Clone the repository
git clone <repository-url>
cd unre-ge-system

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run database migrations
# Execute the SQL in .same/database-schema.sql in your Supabase SQL editor

# Start development server
bun run dev
```

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_APP_NAME="UNRE GE Request System"
NEXT_PUBLIC_CURRENCY=PGK
NEXT_PUBLIC_FINANCIAL_YEAR=2025
```

### Database Setup

1. Create a new Supabase project
2. Navigate to SQL Editor
3. Execute the complete schema from `.same/database-schema.sql`
4. Verify all tables, functions, triggers, and policies are created
5. Insert sample data for testing (optional)

---

## 📊 PGAS Integration

### Integration Methods

#### 1. **CSV/Excel Import** (Current - Phase 1)

**Process:**
1. Export budget and expenditure report from PGAS
2. Navigate to Dashboard → PGAS Sync
3. Upload CSV/Excel file with required columns
4. System validates and imports data
5. Budget lines and YTD expenditure updated

**Required Columns:**
- Cost Centre Code
- PGAS Vote Code
- PGAS Sub-Item (optional)
- AAP Code
- Description
- Original Budget Amount
- YTD Expenditure
- Budget Year

**Sample CSV:**
```csv
Cost Centre Code,PGAS Vote Code,AAP Code,Description,Original Budget,YTD Expenditure,Budget Year
AGR,AGR-001,2025-AGR-OP-TRAV,Operating - Travel,250000,120000,2025
SCI,SCI-001,2025-SCI-OP-MAINT,Operating - Maintenance,350000,180000,2025
```

#### 2. **Direct Database Connection** (Planned - Phase 2)

- Read-only access to PGAS database
- Scheduled automatic sync (daily/weekly)
- Real-time budget queries

#### 3. **API Integration** (Future - Phase 3)

- RESTful API connection to PGAS
- Bi-directional data sync
- Event-driven updates

### Budget Mapping

AAP Budget Lines in this system map to PGAS vote codes:

```
GE System Budget Line ← → PGAS Vote Code
2025-AGR-OP-TRAV     ← → AGR-001
2025-SCI-CAP-EQUIP   ← → SCI-002
```

---

## 📱 Features & Usage

### Creating a GE Request

1. **Login** to the system
2. Navigate to **Dashboard → GE Requests → New Request**
3. Select **Cost Centre** and **Budget Line**
4. Choose **Expense Type** and Supplier (optional)
5. Add **Line Items** (description, quantity, unit price)
6. Write **Justification** for the expenditure
7. **Upload Documents** (quotes, invoices, memos)
8. **Check Budget Availability** (real-time validation)
9. **Submit for Approval** or **Save as Draft**

### Approving Requests

1. Navigate to **Dashboard → My Approvals**
2. View **Pending Requests** awaiting your approval
3. Click request to see:
   - Full details and line items
   - Budget impact analysis
   - Supporting documents
   - Approval history
4. Choose action:
   - **Approve** - Forward to next approver
   - **Reject** - Reject with mandatory reason
   - **Return** - Send back for clarification
5. Add **Comments** and confirm

### Budget Tracking

1. Navigate to **Dashboard → Budget Overview**
2. View **Overall Budget Summary**:
   - Total Budget (AAP)
   - YTD Expenditure (from PGAS)
   - Committed (from GE requests)
   - Available Balance
3. Filter by **Cost Centre** and **Category**
4. Drill down into individual budget lines
5. View **Budget Alerts** for lines exceeding thresholds
6. Export reports to Excel/PDF

### Payment Processing

1. Navigate to **Dashboard → Payments**
2. View **Approved & Committed** requests ready for payment
3. Create **Payment Voucher**:
   - Select payment method (EFT/Cheque/Cash)
   - Enter payment details
   - Upload invoice and receipts
4. **Process Payment** and mark as paid
5. System updates commitment and generates payment record
6. Export for PGAS ledger update

---

## 🔒 Security & Compliance

### Row-Level Security (RLS)

- Implemented on all sensitive tables
- Users only see data relevant to their role and cost centres
- HODs see only their department data
- Auditors have read-only access to everything

### Audit Trail

Every action is logged with:
- **User ID** - Who performed the action
- **Timestamp** - When it occurred
- **Action Type** - CREATE, UPDATE, APPROVE, REJECT, etc.
- **Old/New Data** - Before/after values (JSONB)
- **IP Address** - Request origin
- **User Agent** - Device/browser information

### Data Integrity

- **No Deletions** of approved transactions
- All changes tracked via triggers
- Commitment amounts auto-calculated
- Budget validation on every submission
- Duplicate request prevention

---

## 📈 Reporting & Analytics

### Manager Dashboard

- Budget vs Actual vs Committed
- Spending trends by month
- Cost centre comparisons
- Top expense categories
- Pending approvals summary

### Bursary Dashboard

- Commitments aging report
- Payment processing queue
- Cash flow forecast
- Supplier payment summary

### Audit Reports

- Complete GE request register
- Approval trail verification
- Exception reports (overrides, rejections)
- User activity logs
- Budget variance analysis

### Export Options

- **Excel** - Detailed data exports
- **PDF** - Formatted reports
- **CSV** - Data integration

---

## 🚀 Deployment

### Netlify Deployment

```bash
# Build the project
bun run build

# Deploy to Netlify
# (Use the Same.New deploy button or Netlify CLI)
```

### Environment Setup

1. Set environment variables in Netlify dashboard
2. Configure database connection
3. Set up custom domain (optional)
4. Enable automatic deployments from Git

### On-Premise Deployment

1. Set up Node.js server
2. Configure PostgreSQL database
3. Set environment variables
4. Build and run:
   ```bash
   bun run build
   bun run start
   ```
5. Set up Nginx reverse proxy
6. Configure SSL certificates

---

## 🛠️ Customization & Configuration

### Approval Workflows

Edit `approval_workflows` table to customize routing:

```sql
INSERT INTO approval_workflows (name, min_amount, max_amount, approval_sequence)
VALUES ('Custom Workflow', 0, 10000, '[
  {"level": 1, "role": "HOD"},
  {"level": 2, "role": "Custom_Role"}
]'::jsonb);
```

### Expense Types

Add new expense categories in `expense_types` table.

### Budget Categories

Customize budget line categories in `budget_lines` table.

---

## 📞 Support & Maintenance

### System Administration

- **User Management**: Add/disable users via Dashboard → Users
- **Role Assignment**: Assign roles and cost centres
- **Workflow Configuration**: Adjust approval thresholds
- **Budget Updates**: Regular PGAS sync
- **Backup**: Daily database backups recommended

### Common Issues

**Issue**: Request not routing correctly
- **Solution**: Check approval workflow configuration for amount ranges

**Issue**: Budget not syncing from PGAS
- **Solution**: Verify CSV format matches template, check cost centre codes

**Issue**: User cannot see requests
- **Solution**: Verify role assignment and cost centre mapping

---

## 🎓 Training Resources

### For Staff/Requestors
1. System login and navigation
2. Creating GE requests
3. Tracking request status
4. Uploading documents

### For Approvers
1. Understanding the approval workflow
2. Reviewing requests and budget impact
3. Approval/rejection process
4. Using comments effectively

### For Bursary
1. PGAS data import
2. Commitment management
3. Payment processing
4. Report generation

---

## 📋 Roadmap

### Phase 1 (Current) ✅
- [x] Core GE request management
- [x] Multi-level approval workflow
- [x] Budget tracking
- [x] CSV/Excel PGAS import
- [x] Basic reporting
- [x] Audit trail

### Phase 2 (Q2 2025)
- [ ] Direct PGAS database integration
- [ ] Advanced analytics and forecasting
- [ ] Mobile app (iOS/Android)
- [ ] Email notifications
- [ ] SMS alerts for urgent approvals
- [ ] Budget virement workflow

### Phase 3 (Q3 2025)
- [ ] API integration with PGAS
- [ ] Purchase order automation
- [ ] Supplier portal
- [ ] Contract management
- [ ] Asset register integration
- [ ] AI-powered spending insights

---

## 👨‍💻 Development Team

**System Architect**: Same.New AI Assistant
**Client**: University of Natural Resources & Environment (UNRE)
**Project Lead**: Emmanuel Saliki
**Technology**: Next.js, TypeScript, Supabase, Tailwind CSS

---

## 📄 License

Proprietary system developed for the University of Natural Resources & Environment of Papua New Guinea.

---

## 🙏 Acknowledgments

This comprehensive system addresses the critical needs identified by UNRE:
- Eliminating paper trail challenges
- Preventing misplaced forms
- Reducing delayed endorsements
- Providing real-time budget visibility
- Integrating with PGAS AAP budget system

**Developed with precision and care to serve UNRE's mission of excellence in natural resources education and research.**

---

## 📧 Contact

For technical support or questions:
- **IT Support**: itsupport@unre.ac.pg
- **Bursary**: bursary@unre.ac.pg
- **System Admin**: admin@unre.ac.pg

---

**Version**: 1.0.0
**Last Updated**: January 2025
**System Status**: Production Ready ✅
