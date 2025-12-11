# 🚀 Deploy AAP Schema V2 (Unique Names)

**File**: `aap-schema-v2-unique-names.sql`
**Status**: ✅ Ready to deploy - Won't conflict with existing triggers!

---

## ✅ What's Different in V2?

This version uses **unique trigger and function names** so it won't conflict:

**Old Names** → **New Names (V2)**:
- `trg_aap_line_update_header_total` → `trg_aap_line_update_total_v2`
- `trg_ge_line_validate_budget` → `trg_ge_line_budget_check_v2`
- `update_aap_header_total()` → `update_aap_header_total_v2()`
- `validate_budget_before_ge()` → `validate_budget_before_ge_v2()`

**This will deploy successfully!** ✅

---

## 📝 Deployment Steps

### 1. Open Supabase SQL Editor

👉 **https://app.supabase.com/project/nuyitrqibxdsyfxulrvr/sql**

Click **"New query"**

---

### 2. Copy the V2 Schema

**File**: `unre/.same/aap-schema-v2-unique-names.sql`

Open this file in your code editor:
- **Select all** (Ctrl+A or Cmd+A)
- **Copy** (Ctrl+C or Cmd+C)

---

### 3. Paste & Run

1. **Paste** into Supabase SQL Editor
2. **Click RUN** (bottom right)
3. **Wait 30-60 seconds**

---

## ✅ Expected Success Output

```
CREATE TABLE
CREATE TABLE
... (14 times)
CREATE VIEW
CREATE VIEW
CREATE FUNCTION
CREATE FUNCTION
CREATE TRIGGER
CREATE TRIGGER
INSERT 0 3
INSERT 0 2
... (sample data inserts)
Success. No rows returned
```

---

## 🧪 Test After Deployment

1. **Open**: http://localhost:3000/dashboard/aap
2. **Should load** without errors
3. **Click**: "Create New AAP"
4. **Dropdowns** should populate with data

---

**Ready to deploy? Copy from `aap-schema-v2-unique-names.sql`** 🚀
