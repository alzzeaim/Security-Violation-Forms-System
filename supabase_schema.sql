-- Employees table (includes both workers and supervisors)
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  employee_number TEXT UNIQUE NOT NULL,
  nationality TEXT,
  organization TEXT,
  phone TEXT,
  id_number TEXT,
  role TEXT NOT NULL CHECK (role IN ('employee', 'supervisor')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Allow read/write for everyone (no auth required for this internal tool)
CREATE POLICY "Allow read" ON employees FOR SELECT USING (true);
CREATE POLICY "Allow insert" ON employees FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update" ON employees FOR UPDATE USING (true);
CREATE POLICY "Allow delete" ON employees FOR DELETE USING (true);

-- Insert sample data
INSERT INTO employees (name, employee_number, nationality, organization, phone, id_number, role) VALUES
('أحمد محمد العمري', 'EMP001', 'سعودي', 'إدارة أمن القدية', '0501234567', '1234567890', 'employee'),
('محمد عبدالله الشهري', 'EMP002', 'سعودي', 'إدارة أمن القدية', '0507654321', '0987654321', 'employee'),
('خالد سعد المطيري', 'SUP001', 'سعودي', 'إدارة أمن القدية', '0509876543', '1122334455', 'supervisor'),
('فهد عبدالرحمن الدوسري', 'SUP002', 'سعودي', 'إدارة أمن القدية', '0503456789', '5566778899', 'supervisor');
