# 🚨 نظام إدخال المخالفات الأمنية - القدية (Qiddiya Violations System)

نظام ويب متطور ومؤمن بالكامل لإنشاء وإدارة وتصدير نماذج المخالفات الأمنية والميدانية في مشروع القدية، يدعم اتجاهات القراءة اليمين إلى اليسار (RTL) بشكل كامل مع لوحة إدارية للتحكم وتتبع بيانات الموظفين والمشرفين.

A high-performance, responsive, and secure web application to record, manage, and export official Site Security Violation Forms at Qiddiya. Built with a futuristic RTL-first Arabic interface.

---

## 🎨 المميزات الأساسية / Core Features

- **واجهة مستخدم احترافية بالكامل باللغة العربية (RTL-First):** مستوحاة من الهوية البصرية للقدية، ومدعومة بخط **IBM Plex Arabic** لتقديم أعلى درجات وضوح النصوص.
- **مولد ملفات PDF عالي الجودة والوضوح:** تصدير فوري ومباشر لنماذج المخالفات الرسمية المعتمدة بتنسيق A4 بدقة متناهية مع دمج كامل للصور والمرفقات الملتقطة ميدانياً.
- **نظام حفظ المسودات التلقائي (Offline Autosave):** حفظ تقدم العمل في المتصفح تلقائياً كل 15 ثانية لحماية البيانات من الضياع، مع إمكانية الاستعادة الفورية بنقرة زر.
- **بحث فوري مدعوم بنظام الإكمال التلقائي (Typeahead Search):** للبحث السريع عن المخالفين أو ضباط الأمن أو المشرفين من قاعدة بيانات Supabase مع توفير خيار المحاكاة المحلية (Mock fallback) في غياب مفاتيح الربط.
- **لوحة إدارية متكاملة للموظفين (Workers CRUD Panel):** محمية ببوابة رقمية PIN للتحكم وإضافة وتعديل بيانات طواقم الأمن والعمل.
- **معالجة محلية بالكامل للصور والمرفقات (Local Media Compression):** معالجة الصور وضغطها محلياً لتقليص أحجام ملفات الـ PDF المخرجة.

---

## 🛠️ التقنيات المستخدمة / Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Radix UI Primitives (Headless Dialog, Select, Checkbox)
- **Database / Backend:** Supabase (PostgreSQL)
- **PDF Engine:** jsPDF + html2canvas

---

## 🚀 البدء والتشغيل محلياً / Local Development Setup

### 1. تثبيت الحزم والمكتبات / Install Dependencies
قم بتهيئة وتثبيت حزم المطورين والاعتماديات الأساسية:
```bash
npm install
```

### 2. إعداد المتغيرات البيئية / Setup Environment Variables
قم بنسخ ملف المتغيرات البيئية وتعبئة الحقول ببيانات مشروع Supabase الخاص بك:
```bash
cp .env.example .env.local
```
محتوى ملف `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=رابط_مشروع_سوبابيس
NEXT_PUBLIC_SUPABASE_ANON_KEY=مفتاح_سوبابيس_المعلن
NEXT_PUBLIC_ADMIN_PIN=1234
```

### 3. إعداد قاعدة البيانات في Supabase / Database Schema Setup
قم بتشغيل الكود التالي في محرر SQL الخاص بـ Supabase لتهيئة جدول الموظفين وحزم البيانات التجريبية:
```sql
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

-- Allow CRUD policies for operations
CREATE POLICY "Allow read" ON employees FOR SELECT USING (true);
CREATE POLICY "Allow insert" ON employees FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update" ON employees FOR UPDATE USING (true);
CREATE POLICY "Allow delete" ON employees FOR DELETE USING (true);

-- Insert sample seed data
INSERT INTO employees (name, employee_number, nationality, organization, phone, id_number, role) VALUES
('أحمد محمد العمري', 'EMP001', 'سعودي', 'إدارة أمن القدية', '0501234567', '1234567890', 'employee'),
('محمد عبدالله الشهري', 'EMP002', 'سعودي', 'إدارة أمن القدية', '0507654321', '0987654321', 'employee'),
('خالد سعد المطيري', 'SUP001', 'سعودي', 'إدارة أمن القدية', '0509876543', '1122334455', 'supervisor'),
('فهد عبدالرحمن الدوسري', 'SUP002', 'سعودي', 'إدارة أمن القدية', '0503456789', '5566778899', 'supervisor');
```

### 4. تشغيل خادم التطوير المحلي / Run Local Dev Server
```bash
npm run dev
```
افتح الرابط التالي في المتصفح لرؤية التطبيق: [http://localhost:3000](http://localhost:3000)

---

## 🌐 النشر على منصة Vercel / Production Deployment

1. قم برفع المستودع على حسابك في GitHub.
2. توجه إلى لوحة تحكم [Vercel](https://vercel.com).
3. اضغط على **Add New...** ثم اختر **Project**.
4. استورد المستودع (Import GitHub Repository).
5. في قسم **Environment Variables**، قم بإدخال المتغيرات البيئية التالية:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_ADMIN_PIN` (اختياري، الافتراضي هو 1234)
6. اضغط على **Deploy** للاكتمال.
7. **هام جداً:** لا تنسَ إضافة رابط موقع الـ Vercel المخرج إلى قائمة النطاقات المسموحة (Origins) في إعدادات Supabase API لضمان استقرار الاتصالات.

---

## 📋 قائمة اختبارات ما قبل النشر / Deployment Test Checklist
تأكد من فحص البنود التالية قبل بدء نشر النظام للتأكد من سلامة التشغيل:
- [x] ظهور الواجهة الرئيسية بالاتجاه الصحيح RTL وخط عربي واضح ومقروء.
- [x] عمل البحث في الموظفين بشكل سليم (سواء بسحب البيانات من سوبابيس أو من قاعدة الماك المؤقتة).
- [x] إمكانية تحميل الصور وإظهار المعاينة بشكل صحيح.
- [x] إمكانية اختيار نوع مخالفة واحدة على الأقل.
- [x] توليد ملف الـ PDF بنجاح شاملاً كافة التفاصيل والبيانات والصور.
- [x] تنزيل ملف الـ PDF بالتسمية الصحيحة المعتمدة `مخالفة_[رقم_الصادر]_[التاريخ].pdf`.
- [x] تصفير النموذج وإفراغ الحقول فور اكتمال تنزيل الملف بنجاح.
- [x] عمل بوابة الـ PIN الخاصة بلوحة التحكم وحماية البيانات.
- [x] إمكانية إضافة وتعديل وحذف الموظفين وحفظها محلياً أو في سوبابيس.
- [x] توافق النصوص وحقول المدخلات لتناسب شاشات الهواتف دون وجود شريط تمرير أفقي (بحد أدنى 375px عرض).

---

## 🔧 إعدادات ما بعد النشر في Supabase / Post-Deployment Config
بعد انتهاء نشر موقعك على Vercel، توجه إلى لوحة تحكم Supabase لتفادي مشكلات الاتصال أو الـ CORS:
1. اذهب إلى **Settings** ثم **API**.
2. ابحث عن قسم **Additional Allowed Origins** (أو النطاقات المسموحة الإضافية).
3. أضف رابط الموقع الجديد الخاص بك على Vercel بالتنسيق التالي: `https://your-project.vercel.app`.

---

## 🔒 ترخيص الاستخدام / License
مخصص للاستخدام الداخلي بمشروع القدية لإدارة عمليات أمن الموقع (Site Security Operations).
# Security-Violation-Forms-System
# Security-Violation-Forms-System
