-- ============================================
-- AAP (ANNUAL ACTIVITY PLAN) & BUDGET MONITORING SYSTEM
-- Complete Database Schema for UNRE - V4 FINAL
-- Safe to run multiple times - drops triggers before creating
-- ============================================

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

CREATE INDEX IF NOT EXISTS idx_program_division ON program(division_id);

-- 1.5 Activity / Project
CREATE TABLE IF NOT EXISTS activity_project (
    activity_id BIGSERIAL PRIMARY KEY,
    program_id BIGINT REFERENCES program(program_id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(program_id, code)
);

COMMENT ON TABLE activity_project IS 'Activities/Projects with vote codes e.g. 515-2610-2614';

CREATE INDEX IF NOT EXISTS idx_activity_program ON activity_project(program_id);
CREATE INDEX IF NOT EXISTS idx_activity_code ON activity_project(code);

-- 1.6 Chart of Accounts (PGAS)
CREATE TABLE IF NOT EXISTS chart_of_accounts (
    account_id BIGSERIAL PRIMARY KEY,
    account_code TEXT UNIQUE NOT NULL,
    account_name TEXT NOT NULL,
    economic_item_code TEXT,
    economic_item_name TEXT,
    pgas_category TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE chart_of_accounts IS 'PGAS Chart of Accounts with economic item codes';

CREATE INDEX IF NOT EXISTS idx_coa_account_code ON chart_of_accounts(account_code);
CREATE INDEX IF NOT EXISTS idx_coa_economic_item ON chart_of_accounts(economic_item_code);

-- 1.7 Supplier / Payee
CREATE TABLE IF NOT EXISTS supplier (
    supplier_id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    tin TEXT,
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
    head_of_activity TEXT,
    manager TEXT,
    telephone TEXT,
    fax TEXT,
    status TEXT DEFAULT 'Draft',
    submitted_date TIMESTAMPTZ,
    approved_date TIMESTAMPTZ,
    approved_by UUID REFERENCES user_profiles(id),
    total_proposed_cost NUMERIC(18,2) DEFAULT 0,
    created_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(year_id, division_id, program_id, activity_id)
);

COMMENT ON TABLE aap_header IS 'AAP header - one per Division/Program/Activity per fiscal year';

CREATE INDEX IF NOT EXISTS idx_aap_year ON aap_header(year_id);
CREATE INDEX IF NOT EXISTS idx_aap_division ON aap_header(division_id);
CREATE INDEX IF NOT EXISTS idx_aap_program ON aap_header(program_id);
CREATE INDEX IF NOT EXISTS idx_aap_activity ON aap_header(activity_id);
CREATE INDEX IF NOT EXISTS idx_aap_status ON aap_header(status);

-- 2.2 AAP Line (Project Activities)
CREATE TABLE IF NOT EXISTS aap_line (
    aap_line_id BIGSERIAL PRIMARY KEY,
    aap_id BIGINT REFERENCES aap_header(aap_id) ON DELETE CASCADE NOT NULL,
    item_no TEXT NOT NULL,
    activity_description TEXT NOT NULL,
    specific_output TEXT,
    target_output TEXT,
    proposed_cost NUMERIC(18,2) NOT NULL DEFAULT 0,
    economic_item_code TEXT,
    account_id BIGINT REFERENCES chart_of_accounts(account_id),
    manpower_months NUMERIC(10,2),
    achievement TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(aap_id, item_no)
);

COMMENT ON TABLE aap_line IS 'AAP line items - individual activities within an AAP';

CREATE INDEX IF NOT EXISTS idx_aap_line_aap ON aap_line(aap_id);
CREATE INDEX IF NOT EXISTS idx_aap_line_account ON aap_line(account_id);
CREATE INDEX IF NOT EXISTS idx_aap_line_economic_item ON aap_line(economic_item_code);

-- 2.3 AAP Line Schedule (Monthly Implementation)
CREATE TABLE IF NOT EXISTS aap_line_schedule (
    aap_line_schedule_id BIGSERIAL PRIMARY KEY,
    aap_line_id BIGINT REFERENCES aap_line(aap_line_id) ON DELETE CASCADE NOT NULL,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    planned_quantity NUMERIC(10,2),
    planned_cost NUMERIC(18,2),
    is_scheduled BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(aap_line_id, month)
);

COMMENT ON TABLE aap_line_schedule IS 'Monthly implementation schedule for AAP lines (Jan-Dec)';

CREATE INDEX IF NOT EXISTS idx_aap_schedule_line ON aap_line_schedule(aap_line_id);

-- ============================================
-- DOMAIN 3: BUDGET (GOVERNMENT APPROPRIATION)
-- ============================================

-- 3.1 Budget Version
CREATE TABLE IF NOT EXISTS budget_version (
    budget_version_id BIGSERIAL PRIMARY KEY,
    year_id INTEGER REFERENCES fiscal_year(year_id) NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT FALSE,
    approved_date TIMESTAMPTZ,
    approved_by UUID REFERENCES user_profiles(id),
    created_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(year_id, name)
);

COMMENT ON TABLE budget_version IS 'Budget versions: Original, Revised, Supplementary';

CREATE INDEX IF NOT EXISTS idx_budget_version_year ON budget_version(year_id);
CREATE INDEX IF NOT EXISTS idx_budget_version_active ON budget_version(is_active);

-- 3.2 Budget Line (Approved Allocations)
CREATE TABLE IF NOT EXISTS budget_line (
    budget_line_id BIGSERIAL PRIMARY KEY,
    budget_version_id BIGINT REFERENCES budget_version(budget_version_id) ON DELETE CASCADE NOT NULL,
    aap_line_id BIGINT REFERENCES aap_line(aap_line_id) NOT NULL,
    account_id BIGINT REFERENCES chart_of_accounts(account_id) NOT NULL,
    approved_amount NUMERIC(18,2) NOT NULL DEFAULT 0,
    fund_source TEXT DEFAULT 'GoPNG',
    status TEXT DEFAULT 'Active',
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(budget_version_id, aap_line_id, account_id)
);

COMMENT ON TABLE budget_line IS 'Budget allocations from government appropriation linked to AAP lines';

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
    ge_number TEXT UNIQUE NOT NULL,
    year_id INTEGER REFERENCES fiscal_year(year_id) NOT NULL,
    division_id BIGINT REFERENCES division(division_id) NOT NULL,
    department_id BIGINT REFERENCES department(department_id),
    activity_id BIGINT REFERENCES activity_project(activity_id),
    aap_line_id BIGINT REFERENCES aap_line(aap_line_id),
    request_date DATE NOT NULL DEFAULT CURRENT_DATE,
    ge_date DATE NOT NULL,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'Requested',
    approved_date TIMESTAMPTZ,
    approved_by UUID REFERENCES user_profiles(id),
    created_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE ge_header IS 'GE transaction headers (requisitions and payments)';

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
    line_no INTEGER NOT NULL,
    budget_line_id BIGINT REFERENCES budget_line(budget_line_id) NOT NULL,
    account_id BIGINT REFERENCES chart_of_accounts(account_id) NOT NULL,
    payee_id BIGINT REFERENCES supplier(supplier_id),
    detail TEXT NOT NULL,
    cheque_batch_no TEXT,
    amount NUMERIC(18,2) NOT NULL DEFAULT 0,
    currency TEXT DEFAULT 'PGK',
    is_posted_to_pgas BOOLEAN DEFAULT FALSE,
    pgas_reference TEXT,
    pgas_posted_date DATE,
    remark TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(ge_id, line_no)
);

COMMENT ON TABLE ge_line IS 'GE transaction line items - each line charges a budget line';

CREATE INDEX IF NOT EXISTS idx_ge_line_ge ON ge_line(ge_id);
CREATE INDEX IF NOT EXISTS idx_ge_line_budget ON ge_line(budget_line_id);
CREATE INDEX IF NOT EXISTS idx_ge_line_account ON ge_line(account_id);
CREATE INDEX IF NOT EXISTS idx_ge_line_payee ON ge_line(payee_id);
CREATE INDEX IF NOT EXISTS idx_ge_line_pgas_posted ON ge_line(is_posted_to_pgas);

-- ============================================
-- DOMAIN 5: MONITORING VIEWS
-- ============================================

-- Drop views if they exist
DROP VIEW IF EXISTS vw_budget_vs_actual_by_aap_line CASCADE;
DROP VIEW IF EXISTS vw_ge_transactions_by_aap_line CASCADE;

-- 5.1 Budget vs Actual by AAP Line
CREATE VIEW vw_budget_vs_actual_by_aap_line AS
SELECT
    fy.year_id,
    d.code AS division_code,
    d.name AS division_name,
    dept.code AS department_code,
    dept.name AS department_name,
    p.main_program_name,
    p.program_name,
    ap.code AS activity_code,
    ap.name AS activity_name,
    al.aap_line_id,
    al.item_no,
    al.activity_description,
    al.specific_output,
    al.target_output,
    al.proposed_cost,
    al.achievement,
    COALESCE(SUM(bl.approved_amount), 0) AS approved_budget,
    COALESCE(SUM(gl.amount), 0) AS total_expense,
    COALESCE(SUM(bl.approved_amount), 0) - COALESCE(SUM(gl.amount), 0) AS balance,
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
    LEFT JOIN budget_line bl ON al.aap_line_id = bl.aap_line_id AND bl.status = 'Active'
    LEFT JOIN ge_line gl ON bl.budget_line_id = gl.budget_line_id
GROUP BY
    fy.year_id, d.code, d.name, dept.code, dept.name,
    p.main_program_name, p.program_name,
    ap.code, ap.name,
    al.aap_line_id, al.item_no, al.activity_description,
    al.specific_output, al.target_output, al.proposed_cost, al.achievement;

-- 5.2 GE Transactions by AAP Line
CREATE VIEW vw_ge_transactions_by_aap_line AS
SELECT
    al.aap_line_id,
    al.item_no,
    al.activity_description,
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
    bl.approved_amount AS budget_amount
FROM ge_line gl
    INNER JOIN ge_header gh ON gl.ge_id = gh.ge_id
    INNER JOIN budget_line bl ON gl.budget_line_id = bl.budget_line_id
    INNER JOIN aap_line al ON bl.aap_line_id = al.aap_line_id
    INNER JOIN chart_of_accounts coa ON gl.account_id = coa.account_id
    LEFT JOIN supplier s ON gl.payee_id = s.supplier_id
WHERE gh.status = 'Posted'
ORDER BY al.aap_line_id, gh.ge_date, gl.line_no;

-- ============================================
-- TRIGGERS & FUNCTIONS
-- ============================================

-- Drop existing triggers first
DROP TRIGGER IF EXISTS trg_aap_line_update_total_v2 ON aap_line;
DROP TRIGGER IF EXISTS trg_ge_line_budget_check_v2 ON ge_line;

-- Drop existing functions
DROP FUNCTION IF EXISTS update_aap_header_total_v2() CASCADE;
DROP FUNCTION IF EXISTS validate_budget_before_ge_v2() CASCADE;

-- Function to update aap_header.total_proposed_cost
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

-- Create trigger
CREATE TRIGGER trg_aap_line_update_total_v2
AFTER INSERT OR UPDATE OR DELETE ON aap_line
FOR EACH ROW
EXECUTE FUNCTION update_aap_header_total_v2();

-- Function to validate budget before GE posting
CREATE OR REPLACE FUNCTION validate_budget_before_ge_v2()
RETURNS TRIGGER AS $$
DECLARE
    v_approved_budget NUMERIC(18,2);
    v_total_expense NUMERIC(18,2);
    v_available NUMERIC(18,2);
BEGIN
    SELECT approved_amount INTO v_approved_budget
    FROM budget_line
    WHERE budget_line_id = NEW.budget_line_id
    AND status = 'Active';

    SELECT COALESCE(SUM(amount), 0) INTO v_total_expense
    FROM ge_line
    WHERE budget_line_id = NEW.budget_line_id
    AND (TG_OP = 'INSERT' OR ge_line_id != NEW.ge_line_id);

    v_available := v_approved_budget - v_total_expense;

    IF NEW.amount > v_available THEN
        RAISE EXCEPTION 'Insufficient budget. Available: %, Requested: %',
            v_available, NEW.amount
        USING HINT = 'Budget line has insufficient funds for this transaction';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
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

-- Insert divisions
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
FROM division d WHERE d.code = 'FBS'
ON CONFLICT DO NOTHING;

INSERT INTO program (division_id, main_program_name, program_name, description)
SELECT d.division_id, 'Academic', 'ICT Services', 'ICT support services'
FROM division d WHERE d.code = 'ASS'
ON CONFLICT DO NOTHING;

-- Insert activities
INSERT INTO activity_project (program_id, code, name, description)
SELECT p.program_id, '515-2810-2814', 'Coordinate & Implement Activities', 'Coordinate and implement procurement activities'
FROM program p WHERE p.program_name = 'Procurement'
ON CONFLICT (program_id, code) DO NOTHING;

INSERT INTO activity_project (program_id, code, name, description)
SELECT p.program_id, '515-2610-2614', 'Coordinate & Implement Activities', 'Coordinate and implement ICT activities'
FROM program p WHERE p.program_name = 'ICT Services'
ON CONFLICT (program_id, code) DO NOTHING;

-- Insert chart of accounts
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
-- SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '
    ========================================
    ✅ AAP SCHEMA DEPLOYMENT SUCCESSFUL!
    ========================================

    Tables Created: 15
    Views Created: 2
    Functions Created: 2
    Triggers Created: 2
    Sample Data: 20+ rows

    Next Steps:
    1. Deploy budget_commitments table
    2. Verify tables in Table Editor
    3. Test AAP pages

    ========================================
    ';
END $$;
