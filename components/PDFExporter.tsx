"use client";

import * as React from "react";
import { FileText, Download, Printer, CheckCircle } from "lucide-react";
import { ViolationFormData } from "../types/violation";
import { generateViolationPDF } from "../lib/pdfGenerator";
import { Button } from "./ui/Button";
import { Dialog, DialogContent, DialogTrigger } from "./ui/Dialog";

interface PDFExporterProps {
  data: ViolationFormData;
  onSuccess: () => void;
  validateForm: () => string | null; // Returns error message if invalid, null if valid
}

export const PDFExporter: React.FC<PDFExporterProps> = ({ data, onSuccess, validateForm }) => {
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [successToast, setSuccessToast] = React.useState(false);
  const [validationError, setValidationError] = React.useState<string | null>(null);

  const handleExport = async () => {
    setValidationError(null);
    const errorMsg = validateForm();
    if (errorMsg) {
      setValidationError(errorMsg);
      // Auto-scroll to top or focus the error
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setIsGenerating(true);
    try {
      await generateViolationPDF(data);
      setSuccessToast(true);
      setTimeout(() => {
        setSuccessToast(false);
        onSuccess(); // Triggers form reset in parent
      }, 2500);
    } catch (error) {
      console.error(error);
      setValidationError("حدث خطأ أثناء إنشاء ملف الـ PDF. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      {validationError && (
        <div className="p-4 bg-danger/10 border border-danger rounded-xl text-sm text-danger flex items-center gap-2 animate-bounce">
          <span className="font-bold">⚠️ تنبيه:</span>
          <span>{validationError}</span>
        </div>
      )}

      {successToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-success text-white px-6 py-4 rounded-xl shadow-xl flex items-center gap-3 z-50 animate-bounce">
          <CheckCircle className="h-6 w-6 shrink-0" />
          <div className="flex flex-col text-right">
            <span className="font-bold text-sm">تم استخراج النموذج بنجاح!</span>
            <span className="text-xs opacity-90">جاري تحميل ملف الـ PDF وإعادة تعيين النموذج.</span>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 w-full">
        {/* Main Export Button */}
        <Button
          onClick={handleExport}
          isLoading={isGenerating}
          variant="secondary"
          className="flex-1 h-14 text-base bg-primary border-primary-dark hover:bg-primary-light text-white rounded-xl active:scale-[0.99]"
        >
          <FileText className="h-5 w-5" />
          تصدير وطباعة PDF / Export Form
        </Button>

        {/* Preview Form Dialog */}
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              disabled={isGenerating}
              className="h-14 px-6 border-gray-300 hover:border-gray-400 text-gray-700 hover:bg-gray-50 rounded-xl"
            >
              <Printer className="h-5 w-5" />
              معاينة النموذج / Preview
            </Button>
          </DialogTrigger>
          <DialogContent title="معاينة نموذج المخالفة قبل التصدير" className="max-w-3xl max-h-[85vh] overflow-y-auto">
            <div className="p-2 space-y-4 text-xs">
              <div className="p-4 border border-accent/30 rounded-xl bg-accent/5 flex items-center gap-3">
                <Printer className="h-5 w-5 text-accent-dark" />
                <p className="text-gray-700 font-semibold leading-relaxed">
                  هذه معاينة تقريبية لشكل الصفحة الرسمية المطبوعة. سيتم تصديرها كملف PDF عالي الجودة بنظام A4 مع كامل التنسيقات والصور المرفقة.
                </p>
              </div>

              {/* Pseudo A4 Sheet Preview */}
              <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm space-y-4 dir-rtl text-right">
                <div className="flex justify-between items-center border-b-2 border-accent pb-3">
                  <div>
                    <h4 className="font-bold text-base text-primary">القدية | QIDDIYA</h4>
                    <span className="text-gray-400 text-[10px]">Site Security Operations</span>
                  </div>
                  <h3 className="font-bold text-sm text-center text-primary underline">نموذج مخالفة أمنية / Security Violation Form</h3>
                  <div className="text-[10px] text-gray-500">
                    <div><strong>رقم الصادر:</strong> {data.reference_no || "---"}</div>
                    <div><strong>الموقع:</strong> {data.location || "---"}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-b border-gray-100 pb-3">
                  <div>
                    <span className="font-bold text-gray-700 block">المخالف / Violator:</span>
                    <span className="text-gray-900">{data.violator_name || "لم يتم التحديد"}</span>
                  </div>
                  <div>
                    <span className="font-bold text-gray-700 block">رقم لوحة المركبة / Plate No:</span>
                    <span className="text-gray-900">{data.violator_plate_number || "---"}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="font-bold text-gray-700 block">المخالفات المرصودة / Recorded Violations:</span>
                  <div className="bg-gray-50 p-3 rounded-lg space-y-1">
                    {data.traffic_violations.length === 0 &&
                    data.misconduct_violations.length === 0 &&
                    data.noncompliance_violations.length === 0 ? (
                      <span className="text-gray-400 italic">لا توجد مخالفات محددة بعد</span>
                    ) : (
                      <>
                        {data.traffic_violations.map((id) => (
                          <div key={id} className="text-blue-700 font-semibold">• مخالفة مرورية مرصودة</div>
                        ))}
                        {data.misconduct_violations.map((id) => (
                          <div key={id} className="text-danger font-semibold">• مخالفة جنائية/مسلكية مرصودة</div>
                        ))}
                        {data.noncompliance_violations.map((id) => (
                          <div key={id} className="text-orange-700 font-semibold">• عدم التزام بأنظمة القدية</div>
                        ))}
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                  <div>
                    <span className="font-bold text-gray-500 block">مباشر الحالة:</span>
                    <span>{data.officer_name || "---"}</span>
                  </div>
                  <div>
                    <span className="font-bold text-gray-500 block">المشرف المسؤول:</span>
                    <span>{data.supervisor_name || "---"}</span>
                  </div>
                </div>

                {/* Photos Preview */}
                {(data.photo_license || data.photo_permit || data.photo_vehicle || data.photo_plate || data.photo_id || data.photo_others.length > 0) && (
                  <div className="pt-4 border-t border-gray-100 space-y-2">
                    <span className="font-bold text-gray-700 block">الصور المرفقة / Attached Photos:</span>
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                      {[
                        { file: data.photo_license, label: "الرخصة / License" },
                        { file: data.photo_permit, label: "التصريح / Permit" },
                        { file: data.photo_vehicle, label: "المركبة / Vehicle" },
                        { file: data.photo_plate, label: "اللوحة / Plate" },
                        { file: data.photo_id, label: "الهوية / ID" },
                        ...data.photo_others.map((file, idx) => ({ file, label: `أخرى ${idx + 1}` })),
                      ].map((photo, idx) => (
                        <div key={idx} className="text-center">
                          <div className="border border-gray-200 rounded-lg h-20 flex items-center justify-center overflow-hidden bg-gray-50">
                            {photo.file ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={URL.createObjectURL(photo.file)}
                                alt={photo.label}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-[9px] text-gray-400">لا يوجد</span>
                            )}
                          </div>
                          <span className="text-[9px] font-semibold text-gray-500 mt-1 block">{photo.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  onClick={handleExport}
                  isLoading={isGenerating}
                  className="w-full bg-primary border-primary-dark hover:bg-primary-light text-white"
                >
                  <Download className="h-4 w-4" />
                  تأكيد وتصدير PDF الآن
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
