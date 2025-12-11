-- ============================================
-- AAP (ANNUAL ACTIVITY PLAN) & BUDGET MONITORING SYSTEM
-- Complete Database Schema for UNRE
-- ============================================

-- Based on requirements analysis of:
-- 1. AAP Template (Planning bottom-up)
-- 2. PGAS Government Budget (Appropriation)
-- 3. GE Execution (Actuals)
-- 4. Monitoring & Evaluation Reports

-- ============================================
-- DOMAIN 1: CORE MASTER DATA
-- ============================================

-- 1.1 Fiscal Year
CREATE TABLE IF NOT EXISTS fiscal_year (
    year_id INTEGER PRIMARY KEY,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE fiscal_year IS 'Fiscal years for AAP and budget planning';
COMMENT ON COLUMN fiscal_year.year_id IS 'Fiscal year e.g. 2025';
COMMENT ON COLUMN fiscal_year.is_active IS 'Only one fiscal year should be active at a time';

-- 1.2 Division
CREATE TABLE IF NOT EXISTS division (
    division_id BIGSERIAL PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE division IS 'Top-level organizational units e.g. Finance & Business Services, Academic Support Services';

-- Index
CREATE INDEX IF NOT EXISTS idx_division_code ON division(code);

-- 1.3 Department / Section
CREATE TABLE IF NOT EXISTS department (
    department_id BIGSERIAL PRIMARY KEY,
    division_id BIGINT REFERENCES division(division_id) ON DELETE CASCADE,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE department IS 'Departments/Sections within divisions e.g. ICT Services, Purchasing';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_department_division ON department(division_id);
CREATE INDEX IF NOT EXISTS idx_department_code ON department(code);

-- 1.4 Program
CREATE TABLE IF NOT EXISTS program (
    program_id BIGSERIAL PRIMARY KEY,
    division_id BIGINT REFERENCES division(division_id) ON DELETE CASCADE,
    main_program_name TEXT NOT NULL,
    program_name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE program IS 'Programs within divisions e.g. Main: Academic Support, Program: ICT Services';

-- Index
CREATE INDEX IF NOT EXISTS idx_program_division ON program(division_id);

-- 1.5 Activity / Project
CREATE TABLE IF NOT EXISTS activity_project (
    activity_id BIGSERIAL PRIMARY KEY,
    program_id BIGINT REFERENCES program(program_id) ON DELETE CASCADE,
    code TEXT NOT NULL, -- Activity/Project Vote e.g. 515-2610-2614
    name TEXT NOT NULL, -- e.g. "Coordinate and Implement Activities"
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(program_id, code)
);

COMMENT ON TABLE activity_project IS 'Activities/Projects with vote codes e.g. 515-2610-2614';
COMMENT ON COLUMN activity_project.code IS 'Activity/Project Vote code from PGAS';

-- Index
CREATE INDEX IF NOT EXISTS idx_activity_program ON activity_project(program_id);
CREATE INDEX IF NOT EXISTS idx_activity_code ON activity_project(code);

-- 1.6 Chart of Accounts (PGAS)
CREATE TABLE IF NOT EXISTS chart_of_accounts (
    account_id BIGSERIAL PRIMARY KEY,
    account_code TEXT UNIQUE NOT NULL, -- e.g. 1000688041
    account_name TEXT NOT NULL,
    economic_item_code TEXT, -- e.g. 121, 123, 128
    economic_item_name TEXT, -- e.g. Travel & Subsistence, Office Materials
    pgas_category TEXT, -- Additional PGAS classification
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE chart_of_accounts IS 'PGAS Chart of Accounts with economic item codes';
COMMENT ON COLUMN chart_of_accounts.economic_item_code IS 'Economic item codes: 121=Travel, 123=Office Materials, etc.';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_coa_account_code ON chart_of_accounts(account_code);
CREATE INDEX IF NOT EXISTS idx_coa_economic_item ON chart_of_accounts(economic_item_code);

-- 1.7 Supplier / Payee
CREATE TABLE IF NOT EXISTS supplier (
    supplier_id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    tin TEXT, -- Tax Identification Number
    address TEXT,
    phone TEXT,
    email TEXT,
    bank_name TEXT,
    bank_account TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE supplier IS 'Suppliers/Payees e.g. Swift IT Solution, Islands Petroleum';

-- Index
CREATE INDEX IF NOT EXISTS idx_supplier_name ON supplier(name);

-- ============================================
-- DOMAIN 2: AAP (ANNUAL ACTIVITY PLAN)
-- ============================================

-- 2.1 AAP Header
CREATE TABLE IF NOT EXISTS aap_header (
    aap_id BIGSERIAL PRIMARY KEY,
    year_id INTEGER REFERENCES fiscal_year(year_id) NOT NULL,
    division_id BIGINT REFERENCES division(division_id) NOT NULL,
    department_id BIGINT REFERENCES department(department_id),
    program_id BIGINT REFERENCES program(program_id) NOT NULL,
    activity_id BIGINT REFERENCES activity_project(activity_id) NOT NULL,

    -- Header information from AAP template
    head_of_activity TEXT, -- Manager/Head name
    manager TEXT,
    telephone TEXT,
    fax TEXT,

    -- Status and workflow
    status TEXT DEFAULT 'Draft', -- Draft / Submitted / Approved / Rejected
    submitted_date TIMESTAMPTZ,
    approved_date TIMESTAMPTZ,
    approved_by UUID REFERENCES user_profiles(id),

    -- Computed totals (for convenience)
    total_proposed_cost NUMERIC(18,2) DEFAULT 0,

    -- Tracking
    created_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Ensure one AAP per year/division/program/activity
    UNIQUE(year_id, division_id, program_id, activity_id)
);

COMMENT ON TABLE aap_header IS 'AAP header - one per Division/Program/Activity per fiscal year';
COMMENT ON COLUMN aap_header.status IS 'Draft, Submitted, Approved, Rejected';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_aap_year ON aap_header(year_id);
CREATE INDEX IF NOT EXISTS idx_aap_division ON aap_header(division_id);
CREATE INDEX IF NOT EXISTS idx_aap_program ON aap_header(program_id);
CREATE INDEX IF NOT EXISTS idx_aap_activity ON aap_header(activity_id);
CREATE INDEX IF NOT EXISTS idx_aap_status ON aap_header(status);

-- 2.2 AAP Line (Project Activities)
CREATE TABLE IF NOT EXISTS aap_line (
    aap_line_id BIGSERIAL PRIMARY KEY,
    aap_id BIGINT REFERENCES aap_header(aap_id) ON DELETE CASCADE NOT NULL,

    -- Line details
    item_no TEXT NOT NULL, -- e.g. 221, 223, 224
    activity_description TEXT NOT NULL, -- e.g. "Travel & Subsistence", "Office Stationaries"
    specific_output TEXT, -- e.g. "Staff Travel", "Purchase Supplies"
    target_output TEXT, -- e.g. "4 x Travel", "300 bales"

    -- Financial
    proposed_cost NUMERIC(18,2) NOT NULL DEFAULT 0, -- Proposed budget amount

    -- PGAS Classification
    economic_item_code TEXT, -- Links to chart_of_accounts
    account_id BIGINT REFERENCES chart_of_accounts(account_id),

    -- Manpower
    manpower_months NUMERIC(10,2), -- Manpower required in months

    -- Achievement tracking
    achievement TEXT, -- Qualitative achievement notes

    -- Tracking
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(aap_id, item_no)
);

COMMENT ON TABLE aap_line IS 'AAP line items - individual activities within an AAP';
COMMENT ON COLUMN aap_line.item_no IS 'Item number within AAP e.g. 221, 223';
COMMENT ON COLUMN aap_line.proposed_cost IS 'Proposed cost from AAP in PNG Kina';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_aap_line_aap ON aap_line(aap_id);
CREATE INDEX IF NOT EXISTS idx_aap_line_account ON aap_line(account_id);
CREATE INDEX IF NOT EXISTS idx_aap_line_economic_item ON aap_line(economic_item_code);

-- 2.3 AAP Line Schedule (Monthly Implementation)
CREATE TABLE IF NOT EXISTS aap_line_schedule (
    aap_line_schedule_id BIGSERIAL PRIMARY KEY,
    aap_line_id BIGINT REFERENCES aap_line(aap_line_id) ON DELETE CASCADE NOT NULL,

    -- Month (1-12 for Jan-Dec)
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),

    -- Planned implementation
    planned_quantity NUMERIC(10,2), -- Monthly quantity/output
    planned_cost NUMERIC(18,2), -- Monthly cost (optional)
    is_scheduled BOOLEAN DEFAULT TRUE, -- Whether activity planned for this month

    -- Notes
    notes TEXT,

    -- Tracking
    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(aap_line_id, month)
);

COMMENT ON TABLE aap_line_schedule IS 'Monthly implementation schedule for AAP lines (Jan-Dec)';
COMMENT ON COLUMN aap_line_schedule.month IS 'Month number: 1=Jan, 2=Feb, ..., 12=Dec';
COMMENT ON COLUMN aap_line_schedule.is_scheduled IS 'Corresponds to colored cells in AAP template';

-- Index
CREATE INDEX IF NOT EXISTS idx_aap_schedule_line ON aap_line_schedule(aap_line_id);

-- ============================================
-- DOMAIN 3: BUDGET (GOVERNMENT APPROPRIATION)
-- ============================================

-- 3.1 Budget Version
CREATE TABLE IF NOT EXISTS budget_version (
    budget_version_id BIGSERIAL PRIMARY KEY,
    year_id INTEGER REFERENCES fiscal_year(year_id) NOT NULL,
    name TEXT NOT NULL, -- e.g. "Original 2025", "Revised 1", "Supplementary 1"
    description TEXT,
    is_active BOOLEAN DEFAULT FALSE, -- Only one version active at a time per year

    -- Approval
    approved_date TIMESTAMPTZ,
    approved_by UUID REFERENCES user_profiles(id),

    -- Tracking
    created_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(year_id, name)
);

COMMENT ON TABLE budget_version IS 'Budget versions: Original, Revised, Supplementary';
COMMENT ON COLUMN budget_version.is_active IS 'Only one budget version should be active per fiscal year';

-- Index
CREATE INDEX IF NOT EXISTS idx_budget_version_year ON budget_version(year_id);
CREATE INDEX IF NOT EXISTS idx_budget_version_active ON budget_version(is_active);

-- 3.2 Budget Line (Approved Allocations)
CREATE TABLE IF NOT EXISTS budget_line (
    budget_line_id BIGSERIAL PRIMARY KEY,
    budget_version_id BIGINT REFERENCES budget_version(budget_version_id) ON DELETE CASCADE NOT NULL,
    aap_line_id BIGINT REFERENCES aap_line(aap_line_id) NOT NULL, -- Links to planned activity
    account_id BIGINT REFERENCES chart_of_accounts(account_id) NOT NULL, -- PGAS account

    -- Financial
    approved_amount NUMERIC(18,2) NOT NULL DEFAULT 0, -- Government approved amount

    -- Funding source
    fund_source TEXT DEFAULT 'GoPNG', -- GoPNG, Donor, Internal Revenue, etc.

    -- Status
    status TEXT DEFAULT 'Active', -- Active, Frozen, Reallocated, etc.

    -- Notes
    remarks TEXT,

    -- Tracking
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(budget_version_id, aap_line_id, account_id)
);

COMMENT ON TABLE budget_line IS 'Budget allocations from government appropriation linked to AAP lines';
COMMENT ON COLUMN budget_line.approved_amount IS 'Approved budget amount (may differ from AAP proposed cost)';
COMMENT ON COLUMN budget_line.fund_source IS 'Source of funds: GoPNG, Donor, Internal Revenue, etc.';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_budget_line_version ON budget_line(budget_version_id);
CREATE INDEX IF NOT EXISTS idx_budget_line_aap ON budget_line(aap_line_id);
CREATE INDEX IF NOT EXISTS idx_budget_line_account ON budget_line(account_id);
CREATE INDEX IF NOT EXISTS idx_budget_line_status ON budget_line(status);

-- ============================================
-- DOMAIN 4: GE EXECUTION (ACTUALS/TRANSACTIONS)
-- ============================================

-- 4.1 GE Header (Requisition/Payment Header)
CREATE TABLE IF NOT EXISTS ge_header (
    ge_id BIGSERIAL PRIMARY KEY,
    ge_number TEXT UNIQUE NOT NULL, -- e.g. 38322, 38324
    year_id INTEGER REFERENCES fiscal_year(year_id) NOT NULL,

    -- Organizational
    division_id BIGINT REFERENCES division(division_id) NOT NULL,
    department_id BIGINT REFERENCES department(department_id),
    activity_id BIGINT REFERENCES activity_project(activity_id),
    aap_line_id BIGINT REFERENCES aap_line(aap_line_id), -- Direct link to AAP item

    -- Dates
    request_date DATE NOT NULL DEFAULT CURRENT_DATE,
    ge_date DATE NOT NULL, -- Posting date (Date column in monitoring sheet)

    -- Description
    description TEXT NOT NULL,

    -- Status
    status TEXT DEFAULT 'Requested', -- Requested / Approved / Posted / Cancelled

    -- Approval workflow (extends existing GE workflow)
    approved_date TIMESTAMPTZ,
    approved_by UUID REFERENCES user_profiles(id),

    -- Tracking
    created_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE ge_header IS 'GE transaction headers (requisitions and payments)';
COMMENT ON COLUMN ge_header.ge_number IS 'GE reference number e.g. 38322';
COMMENT ON COLUMN ge_header.ge_date IS 'Transaction/posting date';
COMMENT ON COLUMN ge_header.aap_line_id IS 'Links GE to specific AAP activity';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ge_header_number ON ge_header(ge_number);
CREATE INDEX IF NOT EXISTS idx_ge_header_year ON ge_header(year_id);
CREATE INDEX IF NOT EXISTS idx_ge_header_division ON ge_header(division_id);
CREATE INDEX IF NOT EXISTS idx_ge_header_activity ON ge_header(activity_id);
CREATE INDEX IF NOT EXISTS idx_ge_header_aap_line ON ge_header(aap_line_id);
CREATE INDEX IF NOT EXISTS idx_ge_header_status ON ge_header(status);
CREATE INDEX IF NOT EXISTS idx_ge_header_date ON ge_header(ge_date);

-- 4.2 GE Line (Transaction Line Items)
CREATE TABLE IF NOT EXISTS ge_line (
    ge_line_id BIGSERIAL PRIMARY KEY,
    ge_id BIGINT REFERENCES ge_header(ge_id) ON DELETE CASCADE NOT NULL,
    line_no INTEGER NOT NULL, -- Line number within GE

    -- Budget link (CRITICAL)
    budget_line_id BIGINT REFERENCES budget_line(budget_line_id) NOT NULL,
    account_id BIGINT REFERENCES chart_of_accounts(account_id) NOT NULL,

    -- Payee/Supplier
    payee_id BIGINT REFERENCES supplier(supplier_id),

    -- Transaction details
    detail TEXT NOT NULL, -- e.g. "Toner for printer", "Toiletries for Dorms"
    cheque_batch_no TEXT, -- e.g. 486, 474

    -- Financial
    amount NUMERIC(18,2) NOT NULL DEFAULT 0, -- Payment amount
    currency TEXT DEFAULT 'PGK',

    -- PGAS posting
    is_posted_to_pgas BOOLEAN DEFAULT FALSE,
    pgas_reference TEXT,
    pgas_posted_date DATE,

    -- Remarks
    remark TEXT,

    -- Tracking
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(ge_id, line_no)
);

COMMENT ON TABLE ge_line IS 'GE transaction line items - each line charges a budget line';
COMMENT ON COLUMN ge_line.budget_line_id IS 'CRITICAL: Links actual expense to budget allocation';
COMMENT ON COLUMN ge_line.amount IS 'Transaction amount in PNG Kina';
COMMENT ON COLUMN ge_line.cheque_batch_no IS 'Cheque or batch number';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ge_line_ge ON ge_line(ge_id);
CREATE INDEX IF NOT EXISTS idx_ge_line_budget ON ge_line(budget_line_id);
CREATE INDEX IF NOT EXISTS idx_ge_line_account ON ge_line(account_id);
CREATE INDEX IF NOT EXISTS idx_ge_line_payee ON ge_line(payee_id);
CREATE INDEX IF NOT EXISTS idx_ge_line_pgas_posted ON ge_line(is_posted_to_pgas);

-- ============================================
-- DOMAIN 5: MONITORING VIEWS
-- ============================================

-- 5.1 Budget vs Actual by AAP Line
CREATE OR REPLACE VIEW vw_budget_vs_actual_by_aap_line AS
SELECT
    -- AAP Information
    fy.year_id,
    d.code AS division_code,
    d.name AS division_name,
    dept.code AS department_code,
    dept.name AS department_name,
    p.main_program_name,
    p.program_name,
    ap.code AS activity_code,
    ap.name AS activity_name,

    -- AAP Line Details
    al.aap_line_id,
    al.item_no,
    al.activity_description,
    al.specific_output,
    al.target_output,
    al.proposed_cost,
    al.achievement,

    -- Budget (Approved)
    COALESCE(SUM(bl.approved_amount), 0) AS approved_budget,

    -- Actual (Expenses to date)
    COALESCE(SUM(gl.amount), 0) AS total_expense,

    -- Balance
    COALESCE(SUM(bl.approved_amount), 0) - COALESCE(SUM(gl.amount), 0) AS balance,

    -- Percentage utilized
    CASE
        WHEN COALESCE(SUM(bl.approved_amount), 0) > 0
        THEN (COALESCE(SUM(gl.amount), 0) / SUM(bl.approved_amount) * 100)
        ELSE 0
    END AS utilization_percent

FROM aap_line al
    INNER JOIN aap_header ah ON al.aap_id = ah.aap_id
    INNER JOIN fiscal_year fy ON ah.year_id = fy.year_id
    INNER JOIN division d ON ah.division_id = d.division_id
    LEFT JOIN department dept ON ah.department_id = dept.department_id
    INNER JOIN program p ON ah.program_id = p.program_id
    INNER JOIN activity_project ap ON ah.activity_id = ap.activity_id

    -- Budget allocations
    LEFT JOIN budget_line bl ON al.aap_line_id = bl.aap_line_id AND bl.status = 'Active'

    -- Actual expenses
    LEFT JOIN ge_line gl ON bl.budget_line_id = gl.budget_line_id

GROUP BY
    fy.year_id, d.code, d.name, dept.code, dept.name,
    p.main_program_name, p.program_name,
    ap.code, ap.name,
    al.aap_line_id, al.item_no, al.activity_description,
    al.specific_output, al.target_output, al.proposed_cost, al.achievement;

COMMENT ON VIEW vw_budget_vs_actual_by_aap_line IS 'Budget vs Actual report - left side of Monitoring sheet';

-- 5.2 GE Transactions by AAP Line
CREATE OR REPLACE VIEW vw_ge_transactions_by_aap_line AS
SELECT
    -- AAP Line reference
    al.aap_line_id,
    al.item_no,
    al.activity_description,

    -- Transaction details (Accounts Records - right side of monitoring sheet)
    gl.ge_line_id,
    gl.line_no AS no,
    gh.ge_date AS date,
    gh.ge_number AS ge_no,
    coa.account_code AS account,
    coa.account_name,
    s.name AS payee,
    gl.detail,
    gl.cheque_batch_no,
    gl.amount,
    gl.remark,

    -- Running balance (computed in report)
    bl.approved_amount AS budget_amount

FROM ge_line gl
    INNER JOIN ge_header gh ON gl.ge_id = gh.ge_id
    INNER JOIN budget_line bl ON gl.budget_line_id = bl.budget_line_id
    INNER JOIN aap_line al ON bl.aap_line_id = al.aap_line_id
    INNER JOIN chart_of_accounts coa ON gl.account_id = coa.account_id
    LEFT JOIN supplier s ON gl.payee_id = s.supplier_id

WHERE gh.status = 'Posted'

ORDER BY
    al.aap_line_id,
    gh.ge_date,
    gl.line_no;

COMMENT ON VIEW vw_ge_transactions_by_aap_line IS 'GE transactions detail - right side of Monitoring sheet';

-- ============================================
-- TRIGGERS & FUNCTIONS
-- ============================================

-- Trigger to update aap_header.total_proposed_cost
CREATE OR REPLACE FUNCTION update_aap_header_total_v2()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE aap_header
    SET total_proposed_cost = (
        SELECT COALESCE(SUM(proposed_cost), 0)
        FROM aap_line
        WHERE aap_id = COALESCE(NEW.aap_id, OLD.aap_id)
    ),
    updated_at = NOW()
    WHERE aap_id = COALESCE(NEW.aap_id, OLD.aap_id);

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_aap_line_update_total_v2
AFTER INSERT OR UPDATE OR DELETE ON aap_line
FOR EACH ROW
EXECUTE FUNCTION update_aap_header_total_v2();

-- Trigger to validate budget before GE posting
CREATE OR REPLACE FUNCTION validate_budget_before_ge_v2()
RETURNS TRIGGER AS $$
DECLARE
    v_approved_budget NUMERIC(18,2);
    v_total_expense NUMERIC(18,2);
    v_available NUMERIC(18,2);
BEGIN
    -- Get approved budget for this budget line
    SELECT approved_amount INTO v_approved_budget
    FROM budget_line
    WHERE budget_line_id = NEW.budget_line_id
    AND status = 'Active';

    -- Get total expenses so far (excluding current line if update)
    SELECT COALESCE(SUM(amount), 0) INTO v_total_expense
    FROM ge_line
    WHERE budget_line_id = NEW.budget_line_id
    AND (TG_OP = 'INSERT' OR ge_line_id != NEW.ge_line_id);

    -- Calculate available
    v_available := v_approved_budget - v_total_expense;

    -- Check if sufficient budget
    IF NEW.amount > v_available THEN
        RAISE EXCEPTION 'Insufficient budget. Available: %, Requested: %',
            v_available, NEW.amount
        USING HINT = 'Budget line has insufficient funds for this transaction';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_ge_line_budget_check_v2
BEFORE INSERT OR UPDATE ON ge_line
FOR EACH ROW
EXECUTE FUNCTION validate_budget_before_ge_v2();

-- ============================================
-- INITIAL DATA / SAMPLE DATA
-- ============================================

-- Insert fiscal years
INSERT INTO fiscal_year (year_id, start_date, end_date, description, is_active)
VALUES
    (2024, '2024-01-01', '2024-12-31', 'Fiscal Year 2024', FALSE),
    (2025, '2025-01-01', '2025-12-31', 'Fiscal Year 2025', TRUE),
    (2026, '2026-01-01', '2026-12-31', 'Fiscal Year 2026', FALSE)
ON CONFLICT (year_id) DO NOTHING;

-- Insert divisions (from spreadsheets)
INSERT INTO division (code, name, description)
VALUES
    ('FBS', 'Finance & Business Services', 'Finance and business support services'),
    ('ASS', 'Academic Support Services', 'Academic support and ICT services')
ON CONFLICT (code) DO NOTHING;

-- Insert departments
INSERT INTO department (division_id, code, name, description)
SELECT d.division_id, 'SP', 'Stores & Purchasing', 'Procurement and stores management'
FROM division d WHERE d.code = 'FBS'
ON CONFLICT (code) DO NOTHING;

INSERT INTO department (division_id, code, name, description)
SELECT d.division_id, 'ICT', 'ICT Services', 'Information and Communications Technology'
FROM division d WHERE d.code = 'ASS'
ON CONFLICT (code) DO NOTHING;

-- Insert programs
INSERT INTO program (division_id, main_program_name, program_name, description)
SELECT d.division_id, 'Stores & Purchasing', 'Procurement', 'Procurement services'
FROM division d WHERE d.code = 'FBS';

INSERT INTO program (division_id, main_program_name, program_name, description)
SELECT d.division_id, 'Academic', 'ICT Services', 'ICT support services'
FROM division d WHERE d.code = 'ASS';

-- Insert activities
INSERT INTO activity_project (program_id, code, name, description)
SELECT p.program_id, '515-2810-2814', 'Coordinate & Implement Activities', 'Coordinate and implement procurement activities'
FROM program p WHERE p.program_name = 'Procurement';

INSERT INTO activity_project (program_id, code, name, description)
SELECT p.program_id, '515-2610-2614', 'Coordinate & Implement Activities', 'Coordinate and implement ICT activities'
FROM program p WHERE p.program_name = 'ICT Services';

-- Insert chart of accounts (economic items from spreadsheets)
INSERT INTO chart_of_accounts (account_code, account_name, economic_item_code, economic_item_name)
VALUES
    ('1000688041', 'Operating Account', '121', 'Travel & Subsistence'),
    ('1000688042', 'Operating Account', '123', 'Office Stationaries & Supplies'),
    ('1000688043', 'Operating Account', '124', 'Computer Software & Supplies'),
    ('1000688044', 'Operating Account', '128', 'Equipment & Furniture Maintenance'),
    ('1000688045', 'Operating Account', '135', 'Licensing & Subscriptions'),
    ('1000688046', 'Operating Account', '141', 'Internet & Communications'),
    ('1000688047', 'Operating Account', '142', 'Telecommunications'),
    ('1000688048', 'Operating Account', '221', 'Capital Equipment')
ON CONFLICT (account_code) DO NOTHING;

-- Insert sample suppliers
INSERT INTO supplier (name, tin, address, phone)
VALUES
    ('Swift IT Solution', 'TIN001', 'Port Moresby', '325-1234'),
    ('Islands Petroleum', 'TIN002', 'Port Moresby', '325-5678'),
    ('Office Supplies Ltd', 'TIN003', 'Lae', '472-9999')
ON CONFLICT DO NOTHING;

-- ============================================
-- END OF SCHEMA
-- ============================================

-- Grant permissions (adjust as needed)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
-- GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
