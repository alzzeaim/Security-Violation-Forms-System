"use client";

import * as React from "react";
import { Search, X, Loader2 } from "lucide-react";
import { Employee, Role } from "../types/violation";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { Input } from "./ui/Input";

interface PersonSearchProps {
  role: Role;
  value: Employee | null;
  onChange: (employee: Employee | null) => void;
  label: string;
  placeholder: string;
}

// Fallback seed data in case Supabase is not configured or fails
const MOCK_EMPLOYEES: Employee[] = [
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

export const PersonSearch: React.FC<PersonSearchProps> = ({
  role,
  value,
  onChange,
  label,
  placeholder,
}) => {
  const [query, setQuery] = React.useState("");
  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [isOpen, setIsOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Fetch employees
  React.useEffect(() => {
    const fetchEmployees = async () => {
      setIsLoading(true);
      try {
        if (isSupabaseConfigured) {
          const { data, error } = await supabase
            .from("employees")
            .select("*")
            .eq("role", role)
            .eq("is_active", true);

          if (error) throw error;
          setEmployees(data || []);
        } else {
          // Use Mock data
          const filteredMocks = MOCK_EMPLOYEES.filter((emp) => emp.role === role);
          setEmployees(filteredMocks);
        }
      } catch (err) {
        console.error("Failed to load employees:", err);
        // Fallback to mocks on error
        const filteredMocks = MOCK_EMPLOYEES.filter((emp) => emp.role === role);
        setEmployees(filteredMocks);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployees();
  }, [role]);

  // Handle outside clicks to close dropdown
  React.useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Filter employees based on query
  const filteredEmployees = employees.filter((emp) => {
    const searchStr = `${emp.name} ${emp.employee_number} ${emp.organization || ""}`.toLowerCase();
    return searchStr.includes(query.toLowerCase());
  });

  const handleSelect = (emp: Employee) => {
    onChange(emp);
    setQuery("");
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange(null);
    setQuery("");
  };

  return (
    <div className="relative w-full text-right" ref={dropdownRef}>
      {value ? (
        // Selected State
        <div className="w-full">
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">{label}</label>
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border border-accent rounded-lg shadow-sm">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-primary">{value.name}</span>
              <span className="text-xs text-gray-500">
                {value.employee_number} • {value.organization || "القدية"}
              </span>
            </div>
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-full text-gray-400 hover:text-danger hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      ) : (
        // Search Input State
        <div className="w-full">
          <Input
            label={label}
            placeholder={placeholder}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            icon={
              isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              ) : (
                <Search className="h-5 w-5 text-gray-400" />
              )
            }
          />

          {isOpen && (
            <div className="absolute z-20 w-full mt-1.5 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center p-6 text-sm text-gray-500">
                  <Loader2 className="h-5 w-5 animate-spin mr-2 text-accent" />
                  جاري تحميل القائمة...
                </div>
              ) : filteredEmployees.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-500">
                  لا توجد نتائج مطابقة
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {filteredEmployees.map((emp) => (
                    <li key={emp.id}>
                      <button
                        type="button"
                        onClick={() => handleSelect(emp)}
                        className="w-full text-right px-4 py-3 min-h-[48px] hover:bg-accent/15 focus:bg-accent/15 focus:outline-none transition-colors flex flex-col justify-center cursor-pointer"
                      >
                        <span className="text-sm font-semibold text-gray-900">{emp.name}</span>
                        <span className="text-xs text-gray-500 mt-0.5">
                          {emp.employee_number} | {emp.organization || "القدية"}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
