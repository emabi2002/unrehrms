-- ============================================
-- SIMPLE TEST - Run this first to verify
-- ============================================

-- Test 1: Roles (should work - has CONFLICT handling)
INSERT INTO roles (name, description) VALUES
('Budget Officer', 'Test role')
ON CONFLICT (name) DO NOTHING;

-- Test 2: Cost Centres (should work - has CONFLICT handling)
INSERT INTO cost_centres (code, name, type, is_active) VALUES
('TEST', 'Test Centre', 'Department', true)
ON CONFLICT (code) DO NOTHING;

-- Test 3: Budget Lines (should work - NO available_amount)
INSERT INTO budget_lines (
  cost_centre_id,
  budget_year,
  pgas_vote_code,
  pgas_sub_item,
  description,
  category,
  original_amount,
  ytd_expenditure,
  committed_amount,
  is_active
) VALUES
(1, 2025, '9999', '999', 'Test Budget', 'Operating', 1000, 0, 0, true);

-- Verify
SELECT 'Test complete! ✅' as status;
