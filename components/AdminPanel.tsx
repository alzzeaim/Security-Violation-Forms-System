"use client";

import * as React from "react";
import { ArrowRight, Search, Plus, Edit, Trash2, ShieldAlert, KeyRound, Lock, Users, Briefcase } from "lucide-react";
import { Employee, Role } from "../types/violation";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Dialog, DialogContent } from "./ui/Dialog";

// Fallback seed data
const SEED_EMPLOYEES: Employee[] = [
  {
    id: "emp-1",
    name: "أحمد محمد العمري",
    employee_number: "EMP001",
    nationality: "سعودي",
    organization: "إدارة أمن القدية",
    phone: "0501234567",
    id_number: "1234567890",
    role: "employee",
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "emp-2",
    name: "محمد عبدالله الشهري",
    employee_number: "EMP002",
    nationality: "سعودي",
    organization: "إدارة أمن القدية",
    phone: "0507654321",
    id_number: "0987654321",
    role: "employee",
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "sup-1",
    name: "خالد سعد المطيري",
    employee_number: "SUP001",
    nationality: "سعودي",
    organization: "إدارة أمن القدية",
    phone: "0509876543",
    id_number: "1122334455",
    role: "supervisor",
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "sup-2",
    name: "فهد عبدالرحمن الدوسري",
    employee_number: "SUP002",
    nationality: "سعودي",
    organization: "إدارة أمن القدية",
    phone: "0503456789",
    id_number: "5566778899",
    role: "supervisor",
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

export const AdminPanel: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [pin, setPin] = React.useState("");
  const [pinError, setPinError] = React.useState(false);

  const [activeTab, setActiveTab] = React.useState<Role>("employee");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  // Modal States
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [currentEmployee, setCurrentEmployee] = React.useState<Partial<Employee> | null>(null);
  const [formError, setFormError] = React.useState<string | null>(null);

  // Pin verification
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPin = process.env.NEXT_PUBLIC_ADMIN_PIN || "1234";
    if (pin === correctPin) {
      setIsAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
      setPin("");
    }
  };

  // Load employees list
  const loadEmployees = async () => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from("employees")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setEmployees(data || []);
      } else {
        // Load mock from localStorage or initialize with seed data
        const local = localStorage.getItem("qiddiya_employees");
        if (local) {
          setEmployees(JSON.parse(local));
        } else {
          setEmployees(SEED_EMPLOYEES);
          localStorage.setItem("qiddiya_employees", JSON.stringify(SEED_EMPLOYEES));
        }
      }
    } catch (error) {
      console.error(error);
      // Fallback
      setEmployees(SEED_EMPLOYEES);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (isAuthenticated) {
      loadEmployees();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const handleOpenAdd = () => {
    setFormError(null);
    setCurrentEmployee({
      name: "",
      employee_number: "",
      nationality: "سعودي",
      organization: "إدارة أمن القدية",
      phone: "",
      id_number: "",
      role: activeTab,
      is_active: true,
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (emp: Employee) => {
    setFormError(null);
    setCurrentEmployee(emp);
    setIsFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEmployee?.name || !currentEmployee.employee_number) {
      setFormError("الاسم والرقم الوظيفي حقول إجبارية.");
      return;
    }

    setIsLoading(true);
    try {
      if (isSupabaseConfigured) {
        if (currentEmployee.id) {
          // Update
          const { error } = await supabase
            .from("employees")
            .update({
              name: currentEmployee.name,
              employee_number: currentEmployee.employee_number,
              nationality: currentEmployee.nationality,
              organization: currentEmployee.organization,
              phone: currentEmployee.phone,
              id_number: currentEmployee.id_number,
              role: currentEmployee.role,
              is_active: currentEmployee.is_active,
            })
            .eq("id", currentEmployee.id);
          if (error) throw error;
        } else {
          // Insert
          const { error } = await supabase.from("employees").insert([currentEmployee]);
          if (error) throw error;
        }
      } else {
        // Mock state updates
        let updatedList: Employee[];
        if (currentEmployee.id) {
          updatedList = employees.map((emp) =>
            emp.id === currentEmployee.id ? (currentEmployee as Employee) : emp
          );
        } else {
          const newEmp: Employee = {
            ...(currentEmployee as Employee),
            id: `mock-${Date.now()}`,
            created_at: new Date().toISOString(),
          };
          updatedList = [newEmp, ...employees];
        }
        setEmployees(updatedList);
        localStorage.setItem("qiddiya_employees", JSON.stringify(updatedList));
      }

      setIsFormOpen(false);
      loadEmployees();
    } catch (error) {
      console.error(error);
      setFormError("حدث خطأ أثناء حفظ البيانات. يرجى التحقق من تفرد الرقم الوظيفي.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من رغبتك في حذف هذا الملف؟")) return;

    setIsLoading(true);
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.from("employees").delete().eq("id", id);
        if (error) throw error;
      } else {
        const updatedList = employees.filter((emp) => emp.id !== id);
        setEmployees(updatedList);
        localStorage.setItem("qiddiya_employees", JSON.stringify(updatedList));
      }
      loadEmployees();
    } catch (error) {
      console.error(error);
      alert("فشل حذف الموظف. قد يكون مرتبطاً ببيانات أخرى.");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter list by role and search text
  const filteredList = employees
    .filter((emp) => emp.role === activeTab)
    .filter((emp) => {
      const searchStr = `${emp.name} ${emp.employee_number} ${emp.organization || ""}`.toLowerCase();
      return searchStr.includes(searchQuery.toLowerCase());
    });

  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white border border-gray-100 rounded-2xl shadow-xl p-8 text-center space-y-6 dir-rtl">
          <div className="inline-flex p-4 bg-accent/10 text-accent-dark rounded-full">
            <Lock className="h-10 w-10 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">منطقة محمية / Restricted Access</h2>
            <p className="text-xs text-gray-500 mt-1">يرجى إدخال رمز المرور المكون من 4 أرقام لمتابعة الإدارة</p>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div className="relative">
              <KeyRound className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="password"
                maxLength={4}
                placeholder="• • • •"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className={`w-full py-3.5 pr-12 pl-4 text-center border rounded-xl outline-none font-mono text-xl tracking-[0.5em] transition-all ${
                  pinError ? "border-danger focus:ring-danger/10" : "border-gray-300 focus:border-accent focus:ring-4 focus:ring-accent/15"
                }`}
              />
            </div>
            {pinError && (
              <div className="text-xs text-danger flex items-center gap-1 justify-center">
                <ShieldAlert className="h-4 w-4 shrink-0" />
                <span>رمز المرور غير صحيح. يرجى إعادة المحاولة.</span>
              </div>
            )}
            <Button type="submit" className="w-full h-12 rounded-xl text-base bg-primary hover:bg-primary-light text-white">
              تأكيد الدخول / Authenticate
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 px-4 dir-rtl text-right">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
            <Briefcase className="h-7 w-7 text-accent" />
            لوحة الإدارة والموظفين / Workers Directory
          </h2>
          {!isSupabaseConfigured && (
            <span className="inline-flex text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md mt-1 animate-pulse">
              ⚙️ وضع المحاكاة المحلّي نشط (Local Storage Mode)
            </span>
          )}
        </div>
        <a
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-accent transition-colors self-start sm:self-auto cursor-pointer"
        >
          <ArrowRight className="h-4 w-4" />
          العودة للنموذج الرئيسي
        </a>
      </div>

      {/* Tabs Menu */}
      <div className="flex gap-2 border-b border-gray-150 pb-2">
        <button
          onClick={() => setActiveTab("employee")}
          className={`px-6 py-3 font-bold text-sm border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "employee"
              ? "border-accent text-accent-dark font-extrabold"
              : "border-transparent text-gray-500 hover:text-primary"
          }`}
        >
          <Users className="h-4 w-4" />
          جدول الموظفين / Employees
        </button>
        <button
          onClick={() => setActiveTab("supervisor")}
          className={`px-6 py-3 font-bold text-sm border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "supervisor"
              ? "border-accent text-accent-dark font-extrabold"
              : "border-transparent text-gray-500 hover:text-primary"
          }`}
        >
          <Users className="h-4 w-4" />
          المشرفون المعتمدون / Supervisors
        </button>
      </div>

      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            placeholder="بحث بالاسم أو الرقم الوظيفي..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-12 pl-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 text-sm outline-none text-right placeholder-gray-400 focus:border-accent focus:ring-4 focus:ring-accent/15 transition-all"
          />
        </div>
        <Button
          onClick={handleOpenAdd}
          className="h-12 bg-accent hover:bg-accent-light text-primary border border-accent-dark rounded-xl px-6 font-bold"
        >
          <Plus className="h-5 w-5" />
          إضافة جديد / Create Worker
        </Button>
      </div>

      {/* Workers Cards Layout (highly responsive instead of breaking wide HTML tables) */}
      {isLoading ? (
        <div className="p-12 text-center text-gray-500 animate-pulse">جاري تحميل البيانات من الخادم...</div>
      ) : filteredList.length === 0 ? (
        <div className="p-16 border-2 border-dashed border-gray-200 rounded-2xl text-center text-gray-500 bg-white">
          <Users className="h-12 w-12 mx-auto text-gray-300 mb-3" />
          <p className="font-semibold text-sm">لا يوجد موظفون مسجلون يطابقون شروط البحث.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredList.map((emp) => (
            <div
              key={emp.id}
              className="card bg-white p-5 rounded-xl border border-gray-100 flex flex-col justify-between space-y-4 hover:-translate-y-0.5"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-extrabold text-gray-900 text-base">{emp.name}</h4>
                  <span className="inline-block text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full mt-1">
                    {emp.organization || "إدارة العمليات بالموقع"}
                  </span>
                </div>
                <span className="font-mono text-xs font-bold text-primary bg-accent/20 px-2.5 py-1 rounded-lg">
                  {emp.employee_number}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-xs text-gray-600 border-t border-gray-50 pt-3">
                <div>
                  <strong>الجنسية:</strong> {emp.nationality || "سعودي"}
                </div>
                <div>
                  <strong>الجوال:</strong> {emp.phone || "---"}
                </div>
                <div className="col-span-2">
                  <strong>الهوية:</strong> {emp.id_number || "---"}
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-gray-50">
                <Button
                  onClick={() => handleOpenEdit(emp)}
                  variant="outline"
                  className="flex-1 py-2 px-3 h-10 rounded-lg text-xs"
                >
                  <Edit className="h-3.5 w-3.5" />
                  تعديل / Edit
                </Button>
                <Button
                  onClick={() => handleDelete(emp.id)}
                  variant="danger"
                  className="py-2 px-3 h-10 rounded-lg text-xs"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  حذف
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Dialog Form */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent
          title={currentEmployee?.id ? "تعديل بيانات الملف / Edit Profile" : "إضافة موظف جديد / Register Profile"}
          className="max-w-md"
        >
          {formError && (
            <div className="p-3 bg-danger/10 border border-danger text-danger text-xs rounded-lg mb-2">
              {formError}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <Input
              label="الاسم بالكامل / Full Name *"
              required
              value={currentEmployee?.name || ""}
              onChange={(e) => setCurrentEmployee({ ...currentEmployee, name: e.target.value })}
            />

            <Input
              label="الرقم الوظيفي / Employee Number *"
              required
              placeholder="مثال: EMP009"
              value={currentEmployee?.employee_number || ""}
              onChange={(e) =>
                setCurrentEmployee({ ...currentEmployee, employee_number: e.target.value.toUpperCase() })
              }
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="الجنسية / Nationality"
                value={currentEmployee?.nationality || ""}
                onChange={(e) => setCurrentEmployee({ ...currentEmployee, nationality: e.target.value })}
              />
              <Input
                label="جهة العمل / Organization"
                value={currentEmployee?.organization || ""}
                onChange={(e) => setCurrentEmployee({ ...currentEmployee, organization: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="الجوال / Phone"
                value={currentEmployee?.phone || ""}
                onChange={(e) => setCurrentEmployee({ ...currentEmployee, phone: e.target.value })}
              />
              <Input
                label="رقم الهوية أو الإقامة / ID Number"
                value={currentEmployee?.id_number || ""}
                onChange={(e) => setCurrentEmployee({ ...currentEmployee, id_number: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
              <Button type="submit" isLoading={isLoading} className="w-full bg-accent hover:bg-accent-light text-primary font-bold rounded-xl h-12">
                حفظ الملف / Save Worker
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
