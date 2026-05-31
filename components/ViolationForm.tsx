"use client";

import * as React from "react";
import { Shield, Sparkles, CheckCircle2, ArrowUp, Settings, RotateCcw } from "lucide-react";
import { ViolationFormData, Employee, ViolationSource, PermitType, VisitPurpose } from "../types/violation";
import { PersonSearch } from "./PersonSearch";
import { PhotoUpload } from "./PhotoUpload";
import { ViolationCheckboxes } from "./ViolationCheckboxes";
import { PDFExporter } from "./PDFExporter";
import { Input } from "./ui/Input";

const INITIAL_STATE: ViolationFormData = {
  reference_no: "",
  location: "",
  date: "",
  start_time: "",
  end_time: "",
  permit_type: null,
  visit_purpose: null,
  visit_purpose_other: "",
  violation_source: [],
  reported_by: "",
  violator_employee_id: null,
  violator_name: "",
  violator_nationality: "",
  violator_organization: "",
  violator_id_number: "",
  violator_phone: "",
  violator_plate_number: "",
  violator_vehicle_owner_id: "",
  previous_violations: "0",
  traffic_violations: [],
  traffic_other: "",
  misconduct_violations: [],
  misconduct_other: "",
  noncompliance_violations: [],
  noncompliance_other: "",
  photo_license: null,
  photo_permit: null,
  photo_vehicle: null,
  photo_plate: null,
  photo_id: null,
  photo_others: [],
  officer_employee_id: null,
  officer_name: "",
  officer_employee_number: "",
  supervisor_employee_id: null,
  supervisor_name: "",
  supervisor_employee_number: "",
};

export const ViolationForm: React.FC = () => {
  const [formData, setFormData] = React.useState<ViolationFormData>(INITIAL_STATE);
  const [showDraftBanner, setShowDraftBanner] = React.useState(false);
  const [showScrollTop, setShowScrollTop] = React.useState(false);

  // References to select objects to show raw text selection
  const [selectedViolator, setSelectedViolator] = React.useState<Employee | null>(null);
  const [selectedOfficer, setSelectedOfficer] = React.useState<Employee | null>(null);
  const [selectedSupervisor, setSelectedSupervisor] = React.useState<Employee | null>(null);

  // 1. Auto-generate Reference Number on Load
  const generateRefNumber = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const random = Math.floor(1000 + Math.random() * 9000);
    return `VIO-${yyyy}${mm}${dd}-${random}`;
  };

  // Set today's defaults
  React.useEffect(() => {
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0];
    const formattedTime = today.toTimeString().split(" ")[0].substring(0, 5);

    setFormData((prev) => ({
      ...prev,
      reference_no: generateRefNumber(),
      date: formattedDate,
      start_time: formattedTime,
    }));

    // Scroll listener for "Scroll to top" button
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);

    // Keyboard shortcut (Ctrl+Enter to export PDF, Escape to reset search focus)
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        // Triggers the export button
        const exportBtn = document.querySelector(".btn-primary, .bg-primary") as HTMLButtonElement;
        exportBtn?.click();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    // Check for autosaved drafts
    const savedDraft = localStorage.getItem("qiddiya_violation_draft");
    if (savedDraft) {
      setShowDraftBanner(true);
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // 2. Draft Saving logic (Every 15 seconds)
  React.useEffect(() => {
    const timer = setTimeout(() => {
      // Don't save empty states
      if (formData.violator_name || formData.location) {
        // Exclude File objects from storage
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { photo_license, photo_permit, photo_vehicle, photo_plate, ...textData } = formData;
        localStorage.setItem("qiddiya_violation_draft", JSON.stringify(textData));
      }
    }, 15000);

    return () => clearTimeout(timer);
  }, [formData]);

  const restoreDraft = () => {
    const savedDraft = localStorage.getItem("qiddiya_violation_draft");
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        setFormData((prev) => ({
          ...prev,
          ...parsed,
        }));
      } catch (err) {
        console.error("Failed to restore draft:", err);
      }
    }
    setShowDraftBanner(false);
  };

  const discardDraft = () => {
    localStorage.removeItem("qiddiya_violation_draft");
    setShowDraftBanner(false);
  };

  // 3. Form field updates helper
  const updateField = <K extends keyof ViolationFormData>(field: K, value: ViolationFormData[K]) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handlers for selected people
  const handleViolatorSelect = (emp: Employee | null) => {
    setSelectedViolator(emp);
    if (emp) {
      setFormData((prev) => ({
        ...prev,
        violator_employee_id: emp.id === "custom" ? null : emp.id,
        violator_name: emp.name,
        violator_nationality: emp.nationality || "سعودي",
        violator_organization: emp.organization || "جهة العمل",
        violator_id_number: emp.id_number || "---",
        violator_phone: emp.phone || "---",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        violator_employee_id: null,
        violator_name: "",
        violator_nationality: "",
        violator_organization: "",
        violator_id_number: "",
        violator_phone: "",
      }));
    }
  };

  const handleOfficerSelect = (emp: Employee | null) => {
    setSelectedOfficer(emp);
    if (emp) {
      setFormData((prev) => ({
        ...prev,
        officer_employee_id: emp.id === "custom" ? null : emp.id,
        officer_name: emp.name,
        officer_employee_number: emp.employee_number,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        officer_employee_id: null,
        officer_name: "",
        officer_employee_number: "",
      }));
    }
  };

  const handleSupervisorSelect = (emp: Employee | null) => {
    setSelectedSupervisor(emp);
    if (emp) {
      setFormData((prev) => ({
        ...prev,
        supervisor_employee_id: emp.id === "custom" ? null : emp.id,
        supervisor_name: emp.name,
        supervisor_employee_number: emp.employee_number,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        supervisor_employee_id: null,
        supervisor_name: "",
        supervisor_employee_number: "",
      }));
    }
  };

  const handleSourceCheckbox = (src: ViolationSource, checked: boolean) => {
    let updatedSources = [...formData.violation_source];
    if (checked) {
      updatedSources.push(src);
    } else {
      updatedSources = updatedSources.filter((s) => s !== src);
    }
    updateField("violation_source", updatedSources);
  };

  // 4. Required fields checklist and progress calculation
  const getRequiredFieldsState = () => {
    const checks = {
      reference_no: !!formData.reference_no,
      location: !!formData.location,
      violator_name: !!formData.violator_name,
      has_violation:
        formData.traffic_violations.length > 0 ||
        !!formData.traffic_other ||
        formData.misconduct_violations.length > 0 ||
        !!formData.misconduct_other ||
        formData.noncompliance_violations.length > 0 ||
        !!formData.noncompliance_other,
      officer: !!formData.officer_name,
      supervisor: !!formData.supervisor_name,
    };

    const total = Object.keys(checks).length;
    const filled = Object.values(checks).filter(Boolean).length;
    const percentage = Math.round((filled / total) * 100);

    return { checks, total, filled, percentage };
  };

  const { percentage } = getRequiredFieldsState();

  // Validate form before exporting
  const validateForm = (): string | null => {
    if (!formData.reference_no) return "يرجى تعبئة رقم الصادر.";
    if (!formData.location) return "يرجى تحديد موقع الحالة/الموقع.";
    if (!formData.violator_name) return "يرجى تحديد أو كتابة اسم الشخص المخالف.";

    const hasViolations =
      formData.traffic_violations.length > 0 ||
      !!formData.traffic_other ||
      formData.misconduct_violations.length > 0 ||
      !!formData.misconduct_other ||
      formData.noncompliance_violations.length > 0 ||
      !!formData.noncompliance_other;

    if (!hasViolations) return "يجب تحديد مخالفة واحدة على الأقل.";
    if (!formData.officer_name) return "يرجى تحديد مباشر الحالة.";
    if (!formData.supervisor_name) return "يرجى تحديد المشرف المعتمد.";

    return null;
  };

  const handleReset = () => {
    if (confirm("هل أنت متأكد من رغبتك في إعادة تعيين وإفراغ النموذج؟")) {
      setFormData({
        ...INITIAL_STATE,
        reference_no: generateRefNumber(),
        date: new Date().toISOString().split("T")[0],
        start_time: new Date().toTimeString().split(" ")[0].substring(0, 5),
      });
      setSelectedViolator(null);
      setSelectedOfficer(null);
      setSelectedSupervisor(null);
      localStorage.removeItem("qiddiya_violation_draft");
    }
  };

  const handleExportSuccess = () => {
    // Reset form states completely
    setFormData({
      ...INITIAL_STATE,
      reference_no: generateRefNumber(),
      date: new Date().toISOString().split("T")[0],
      start_time: new Date().toTimeString().split(" ")[0].substring(0, 5),
    });
    setSelectedViolator(null);
    setSelectedOfficer(null);
    setSelectedSupervisor(null);
    localStorage.removeItem("qiddiya_violation_draft");
  };

  return (
    <div className="space-y-6 pb-20 max-w-3xl mx-auto">
      {/* 1. Progress Indicator */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-150 py-3 px-4 shadow-sm flex items-center justify-between rounded-b-xl">
        <div className="flex items-center gap-2">
          <CheckCircle2 className={`h-5 w-5 ${percentage === 100 ? "text-success" : "text-accent"}`} />
          <span className="text-xs font-bold text-gray-700">معدل اكتمال النموذج / Completion Rate</span>
        </div>
        <div className="flex items-center gap-3 w-1/2 justify-end">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-accent h-2 rounded-full transition-all duration-300"
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
          <span className="text-xs font-extrabold text-primary min-w-[32px]">{percentage}%</span>
        </div>
      </div>

      {/* 2. Draft Recovery Banner */}
      {showDraftBanner && (
        <div className="p-4 bg-accent/10 border border-accent rounded-xl flex items-center justify-between flex-wrap gap-3 animate-fade-in">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent-dark animate-spin" />
            <span className="text-xs font-bold text-gray-800">
              عُثر على مسودة نموذج تم حفظها مسبقاً تلقائياً! هل تود استعادتها؟
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={restoreDraft}
              className="px-3.5 py-1.5 bg-accent hover:bg-accent-light text-primary font-bold text-xs rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              استعادة المسودة
            </button>
            <button
              onClick={discardDraft}
              className="px-3.5 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-xs rounded-lg transition-colors cursor-pointer"
            >
              تجاهل
            </button>
          </div>
        </div>
      )}

      {/* 3. Form Container */}
      <div className="space-y-6">
        {/* Card: Header Logo Title */}
        <div className="card bg-primary text-white p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-center text-center sm:text-right border-accent border-b-4">
          <div className="flex items-center gap-3 mb-4 sm:mb-0">
            <div className="p-3 bg-white/10 rounded-xl text-accent">
              <Shield className="h-8 w-8 stroke-[1.8]" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-wide">القدية | QIDDIYA</h2>
              <p className="text-[10px] text-gray-400 font-semibold uppercase">Site Security Operations</p>
            </div>
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight">نموذج مخالفة أمنية / Violation Form</h1>
            <p className="text-xs text-accent mt-0.5 font-bold">بوابة تسجيل المخالفات الأمنية والميدانية</p>
          </div>
        </div>

        {/* Card: Incident Info */}
        <div className="card p-6 space-y-4">
          <h3 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-2">
            1. معلومات الحالة والواقعة / Incident Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="رقم الصادر / Reference No *"
              required
              value={formData.reference_no}
              onChange={(e) => updateField("reference_no", e.target.value)}
            />
            <Input
              label="الموقع والتفاصيل / Location & Details *"
              required
              placeholder="مثال: البوابة رقم 4، منطقة المشروع الرئيسية"
              value={formData.location}
              onChange={(e) => updateField("location", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="التاريخ / Date"
              type="date"
              value={formData.date}
              onChange={(e) => updateField("date", e.target.value)}
            />
            <Input
              label="وقت البداية / Start Time"
              type="time"
              value={formData.start_time}
              onChange={(e) => updateField("start_time", e.target.value)}
            />
            <Input
              label="وقت الانتهاء / End Time"
              type="time"
              value={formData.end_time}
              onChange={(e) => updateField("end_time", e.target.value)}
            />
          </div>
        </div>

        {/* Card: Permit & Purpose */}
        <div className="card p-6 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-2 mb-3">
              نوع تصريح الدخول / Permit Type
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {(
                [
                  { id: "delivery_note", label: "سند تسليم / Delivery Note" },
                  { id: "qr", label: "باركود / QR" },
                  { id: "badge", label: "بطاقة / Badge" },
                  { id: "form", label: "ورق / Form" },
                ] as { id: PermitType; label: string }[]
              ).map((p) => (
                <label
                  key={p.id}
                  className={`flex items-center gap-3 p-3.5 border rounded-xl cursor-pointer transition-all ${
                    formData.permit_type === p.id
                      ? "border-accent bg-accent/5 ring-2 ring-accent/15"
                      : "border-gray-200 bg-white hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="permit_type"
                    checked={formData.permit_type === p.id}
                    onChange={() => updateField("permit_type", p.id)}
                    className="accent-accent h-4 w-4 cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-gray-800">{p.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-2 mb-3">
              سبب التواجد بالموقع / Purpose of Visit
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {(
                [
                  { id: "qic_employee", label: "موظف قدية" },
                  { id: "consultant", label: "استشاري" },
                  { id: "contractor", label: "مقاول" },
                  { id: "visitor", label: "زائر" },
                  { id: "other", label: "أخرى / Other" },
                ] as { id: VisitPurpose; label: string }[]
              ).map((purpose) => (
                <label
                  key={purpose.id}
                  className={`flex items-center gap-2 p-3 border rounded-xl cursor-pointer transition-all ${
                    formData.visit_purpose === purpose.id
                      ? "border-accent bg-accent/5"
                      : "border-gray-200 bg-white hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="visit_purpose"
                    checked={formData.visit_purpose === purpose.id}
                    onChange={() => updateField("visit_purpose", purpose.id)}
                    className="accent-accent h-4 w-4 cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-gray-800">{purpose.label}</span>
                </label>
              ))}
            </div>
            {formData.visit_purpose === "other" && (
              <div className="mt-3 animate-fade-in">
                <Input
                  placeholder="يرجى كتابة سبب التواجد..."
                  value={formData.visit_purpose_other}
                  onChange={(e) => updateField("visit_purpose_other", e.target.value)}
                />
              </div>
            )}
          </div>
        </div>

        {/* Card: Source of Violation */}
        <div className="card p-6 space-y-4">
          <h3 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-2">
            مصدر وطريقة رصد المخالفة / Source of Violation
          </h3>
          <div className="flex flex-wrap gap-4">
            {(
              [
                { id: "qic_qdp", label: "QIC/QDP" },
                { id: "dashcam", label: "كاميرا سيارة / Dashcam" },
                { id: "security", label: "دورية أمنية / Security" },
                { id: "speed_gun", label: "رادار يدوي / Speed Gun" },
                { id: "speed_cam", label: "رادار ثابت / Speed Cam" },
              ] as { id: ViolationSource; label: string }[]
            ).map((src) => (
              <label
                key={src.id}
                className={`flex items-center gap-3 px-4 py-2.5 border rounded-xl cursor-pointer transition-all ${
                  formData.violation_source.includes(src.id)
                    ? "border-accent bg-accent/5 ring-1 ring-accent"
                    : "border-gray-200 bg-white hover:bg-gray-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={formData.violation_source.includes(src.id)}
                  onChange={(e) => handleSourceCheckbox(src.id, e.target.checked)}
                  className="accent-accent h-4 w-4 cursor-pointer"
                />
                <span className="text-xs font-semibold text-gray-800">{src.label}</span>
              </label>
            ))}
          </div>
          <div className="pt-2 border-t border-gray-100 mt-2">
            <Input
              label="الشخص المُبلّغ عن الحالة / Reported by"
              placeholder="اسم المُبلّغ أو الدورية"
              value={formData.reported_by}
              onChange={(e) => updateField("reported_by", e.target.value)}
            />
          </div>
        </div>

        {/* Card: Personal Info */}
        <div className="card p-6 space-y-6">
          <h3 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-2">
            2. معلومات الشخص المخالف / Violator Details
          </h3>

          <PersonSearch
            role="employee"
            label="اسم المخالف أو رقم الهوية / Select Violator Employee"
            placeholder="ابحث بالاسم أو الرقم الوظيفي للموظف..."
            value={selectedViolator}
            onChange={handleViolatorSelect}
          />

          {/* Editable inputs with defaults populated on search */}
          <div className="space-y-4 pt-2 border-t border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="الاسم بالكامل / Full Name *"
                required
                value={formData.violator_name}
                onChange={(e) => updateField("violator_name", e.target.value)}
              />
              <Input
                label="الجنسية / Nationality"
                value={formData.violator_nationality}
                onChange={(e) => updateField("violator_nationality", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="جهة العمل / Organization"
                value={formData.violator_organization}
                onChange={(e) => updateField("violator_organization", e.target.value)}
              />
              <Input
                label="رقم الهوية أو الإقامة / ID Number"
                value={formData.violator_id_number}
                onChange={(e) => updateField("violator_id_number", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <Input
                  label="رقم الجوال / Phone"
                  value={formData.violator_phone}
                  onChange={(e) => updateField("violator_phone", e.target.value)}
                />
              </div>
              <Input
                label="رقم اللوحة / Plate No"
                placeholder="مثال: أ ب ج 1 2 3"
                value={formData.violator_plate_number}
                onChange={(e) => updateField("violator_plate_number", e.target.value)}
              />
              <Input
                label="هوية مالك المركبة / Owner ID"
                value={formData.violator_vehicle_owner_id}
                onChange={(e) => updateField("violator_vehicle_owner_id", e.target.value)}
              />
            </div>

            <Input
              label="المخالفات السابقة / Previous Violations"
              type="number"
              min={0}
              value={formData.previous_violations}
              onChange={(e) => updateField("previous_violations", e.target.value)}
            />
          </div>
        </div>

        {/* Categories of Violations (Collapsible Panels) */}
        <ViolationCheckboxes
          trafficViolations={formData.traffic_violations}
          misconductViolations={formData.misconduct_violations}
          noncomplianceViolations={formData.noncompliance_violations}
          trafficOther={formData.traffic_other}
          misconductOther={formData.misconduct_other}
          noncomplianceOther={formData.noncompliance_other}
          onChange={(field, val) => updateField(field as keyof ViolationFormData, val)}
        />

        {/* Photos Grid Component */}
        <div className="card p-6">
          <PhotoUpload
            photos={{
              license: formData.photo_license,
              permit: formData.photo_permit,
              vehicle: formData.photo_vehicle,
              plate: formData.photo_plate,
              id: formData.photo_id,
            }}
            otherPhotos={formData.photo_others}
            onChange={(key, file) => updateField(key as keyof ViolationFormData, file)}
            onOtherPhotosChange={(files) => updateField("photo_others", files)}
          />
        </div>

        {/* Signatures & Supervisors Card */}
        <div className="card p-6 space-y-6">
          <h3 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-2">
            5. التوقيعات والاعتمادات الرسمية / Signatures
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Reporting Officer */}
            <div className="space-y-3 p-4 border border-gray-150 rounded-xl bg-gray-50/50">
              <PersonSearch
                role="employee"
                label="مباشر الحالة (الموظف) / Reporting Officer *"
                placeholder="ابحث بالاسم للمحرر..."
                value={selectedOfficer}
                onChange={handleOfficerSelect}
              />
              {selectedOfficer?.id === "custom" ? (
                <div className="mt-2">
                  <Input
                    label="الرقم الوظيفي (اختياري) / Emp No"
                    placeholder="أدخل الرقم الوظيفي..."
                    value={formData.officer_employee_number}
                    onChange={(e) => updateField("officer_employee_number", e.target.value)}
                  />
                </div>
              ) : formData.officer_employee_number ? (
                <div className="text-xs text-gray-500 font-bold bg-white p-2 border border-gray-150 rounded-lg">
                  الرقم الوظيفي / Emp No: <span className="font-mono text-primary">{formData.officer_employee_number}</span>
                </div>
              ) : null}
            </div>

            {/* Supervisor */}
            <div className="space-y-3 p-4 border border-gray-150 rounded-xl bg-gray-50/50">
              <PersonSearch
                role="supervisor"
                label="المشرف المعتمد / Supervisor in Charge *"
                placeholder="ابحث بالاسم للمشرف..."
                value={selectedSupervisor}
                onChange={handleSupervisorSelect}
              />
              {selectedSupervisor?.id === "custom" ? (
                <div className="mt-2">
                  <Input
                    label="الرقم الوظيفي (اختياري) / Emp No"
                    placeholder="أدخل الرقم الوظيفي..."
                    value={formData.supervisor_employee_number}
                    onChange={(e) => updateField("supervisor_employee_number", e.target.value)}
                  />
                </div>
              ) : formData.supervisor_employee_number ? (
                <div className="text-xs text-gray-500 font-bold bg-white p-2 border border-gray-150 rounded-lg">
                  الرقم الوظيفي / Emp No: <span className="font-mono text-primary">{formData.supervisor_employee_number}</span>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Reset & Exporter Integration Card */}
        <div className="card p-6 bg-gray-50 border border-gray-200 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-danger cursor-pointer transition-colors self-start md:self-auto"
          >
            <RotateCcw className="h-4 w-4" />
            إعادة تعيين وإفراغ الحقول
          </button>
          
          <div className="w-full md:w-auto md:min-w-[400px]">
            <PDFExporter
              data={formData}
              validateForm={validateForm}
              onSuccess={handleExportSuccess}
            />
          </div>
        </div>
      </div>

      {/* Floating Scroll to Top */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 p-3.5 bg-accent hover:bg-accent-light text-primary border border-accent-dark rounded-full shadow-lg z-45 transition-transform hover:scale-105 active:scale-95 cursor-pointer animate-fade-in"
        >
          <ArrowUp className="h-5 w-5 stroke-[2.5]" />
        </button>
      )}

      {/* Footer Link to Admin Dashboard */}
      <div className="text-center pt-6">
        <a
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-accent font-bold transition-colors cursor-pointer"
        >
          <Settings className="h-4 w-4" />
          لوحة الإدارة وقاعدة بيانات الموظفين / Admin Panel
        </a>
      </div>
    </div>
  );
};
