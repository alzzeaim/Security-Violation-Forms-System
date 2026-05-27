import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { ViolationFormData, TRAFFIC_VIOLATIONS, MISCONDUCT_VIOLATIONS, NONCOMPLIANCE_VIOLATIONS } from "../types/violation";

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export const generateViolationPDF = async (data: ViolationFormData): Promise<void> => {
  // Convert images to base64 data URLs
  const photosBase64: Record<string, string | null> = {
    license: null,
    permit: null,
    vehicle: null,
    plate: null,
  };

  if (data.photo_license) photosBase64.license = await fileToBase64(data.photo_license);
  if (data.photo_permit) photosBase64.permit = await fileToBase64(data.photo_permit);
  if (data.photo_vehicle) photosBase64.vehicle = await fileToBase64(data.photo_vehicle);
  if (data.photo_plate) photosBase64.plate = await fileToBase64(data.photo_plate);

  // Create temporary container for print layout
  const printContainer = document.createElement("div");
  printContainer.style.position = "absolute";
  printContainer.style.left = "-9999px";
  printContainer.style.top = "-9999px";
  printContainer.style.width = "794px"; // A4 Width in pixels at 96 DPI
  printContainer.style.backgroundColor = "#FFFFFF";
  printContainer.style.color = "#000000";
  printContainer.style.padding = "40px";
  printContainer.style.fontFamily = "var(--font-ibm-plex-arabic), sans-serif";
  printContainer.dir = "rtl";

  // Build the print layout HTML
  printContainer.innerHTML = `
    <!-- Header -->
    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #C8A96E; padding-bottom: 15px; margin-bottom: 20px;">
      <div>
        <div style="font-size: 24px; font-weight: bold; color: #1a1a2e;">القدية | QIDDIYA</div>
        <div style="font-size: 14px; color: #6B7280; font-weight: 500;">إدارة العمليات الأمنية بالموقع / Site Security Operations</div>
      </div>
      <div style="text-align: center;">
        <h1 style="font-size: 22px; font-weight: bold; text-decoration: underline; margin: 0; color: #1a1a2e;">نموذج مخالفة أمنية / Security Violation Form</h1>
        <span style="font-size: 11px; color: #888;">سري للغاية / STRICTLY CONFIDENTIAL</span>
      </div>
      <div style="text-align: left; font-size: 12px; line-height: 1.6;">
        <div><strong>رقم الصادر / Ref No:</strong> <span style="font-family: monospace; font-size: 13px;">${data.reference_no}</span></div>
        <div><strong>الموقع / Location:</strong> ${data.location}</div>
        <div><strong>التاريخ / Date:</strong> ${data.date}</div>
        <div><strong>الوقت / Time:</strong> ${data.start_time} - ${data.end_time || "---"}</div>
      </div>
    </div>

    <!-- Section 1: Incident Details -->
    <div style="margin-bottom: 20px; border: 1px solid #E5E7EB; border-radius: 8px;">
      <div style="background-color: #1a1a2e; color: white; padding: 6px 12px; font-weight: bold; border-top-left-radius: 6px; border-top-right-radius: 6px; font-size: 13px;">
        1. معلومات الحالة / Incident Information
      </div>
      <div style="padding: 12px; display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 11px;">
        <div>
          <strong>نوع التصريح / Permit Type:</strong>
          <div style="display: flex; gap: 10px; margin-top: 5px;">
            <span>[${data.permit_type === "delivery_note" ? "✔" : " "}] سند تسليم / Delivery Note</span>
            <span>[${data.permit_type === "qr" ? "✔" : " "}] باركود / QR</span>
            <span>[${data.permit_type === "badge" ? "✔" : " "}] بطاقة / Badge</span>
            <span>[${data.permit_type === "form" ? "✔" : " "}] ورق / Form</span>
          </div>
        </div>
        <div>
          <strong>سبب التواجد / Purpose of Visit:</strong>
          <div style="margin-top: 5px;">
            <span>[${data.visit_purpose === "qic_employee" ? "✔" : " "}] موظف QIC</span> | 
            <span>[${data.visit_purpose === "consultant" ? "✔" : " "}] استشاري</span> | 
            <span>[${data.visit_purpose === "contractor" ? "✔" : " "}] مقاول</span> | 
            <span>[${data.visit_purpose === "visitor" ? "✔" : " "}] زائر</span>
            ${data.visit_purpose === "other" ? `<div style="margin-top: 2px;">[✔] أخرى: ${data.visit_purpose_other}</div>` : ""}
          </div>
        </div>
      </div>
      <div style="padding: 0 12px 12px 12px; font-size: 11px; display: flex; justify-content: space-between; border-top: 1px dashed #E5E7EB; padding-top: 10px;">
        <div>
          <strong>مصدر المخالفة / Source of Violation:</strong>
          <span style="margin-right: 8px;">
            ${data.violation_source.map(src => {
              const srcMap: Record<string, string> = {
                qic_qdp: "QIC/QDP",
                dashcam: "كاميرا سيارة / Dashcam",
                security: "دورية أمنية / Security",
                speed_gun: "رادار يدوي / Speed Gun",
                speed_cam: "رادار ثابت / Speed Cam",
              };
              return ` [✔] ${srcMap[src] || src}`;
            }).join(" | ") || " ---"}
          </span>
        </div>
        <div>
          <strong>المبلغ / Reported by:</strong> ${data.reported_by || "---"}
        </div>
      </div>
    </div>

    <!-- Section 2: Violator Personal Details -->
    <div style="margin-bottom: 20px; border: 1px solid #E5E7EB; border-radius: 8px;">
      <div style="background-color: #1a1a2e; color: white; padding: 6px 12px; font-weight: bold; border-top-left-radius: 6px; border-top-right-radius: 6px; font-size: 13px;">
        2. معلومات المخالف / Violator Details
      </div>
      <table style="width: 100%; border-collapse: collapse; font-size: 11px; text-align: right;">
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #E5E7EB; border-left: 1px solid #E5E7EB; width: 25%;"><strong>اسم المخالف / Name:</strong></td>
          <td style="padding: 8px; border-bottom: 1px solid #E5E7EB; border-left: 1px solid #E5E7EB; width: 25%;">${data.violator_name}</td>
          <td style="padding: 8px; border-bottom: 1px solid #E5E7EB; border-left: 1px solid #E5E7EB; width: 25%;"><strong>الجنسية / Nationality:</strong></td>
          <td style="padding: 8px; border-bottom: 1px solid #E5E7EB; width: 25%;">${data.violator_nationality || "---"}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #E5E7EB; border-left: 1px solid #E5E7EB;"><strong>جهة العمل / Org:</strong></td>
          <td style="padding: 8px; border-bottom: 1px solid #E5E7EB; border-left: 1px solid #E5E7EB;">${data.violator_organization || "---"}</td>
          <td style="padding: 8px; border-bottom: 1px solid #E5E7EB; border-left: 1px solid #E5E7EB;"><strong>رقم الهوية / ID No:</strong></td>
          <td style="padding: 8px; border-bottom: 1px solid #E5E7EB;">${data.violator_id_number || "---"}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #E5E7EB; border-left: 1px solid #E5E7EB;"><strong>الجوال / Mobile:</strong></td>
          <td style="padding: 8px; border-bottom: 1px solid #E5E7EB; border-left: 1px solid #E5E7EB;">${data.violator_phone || "---"}</td>
          <td style="padding: 8px; border-bottom: 1px solid #E5E7EB; border-left: 1px solid #E5E7EB;"><strong>رقم لوحة المركبة / Plate No:</strong></td>
          <td style="padding: 8px; border-bottom: 1px solid #E5E7EB;">${data.violator_plate_number || "---"}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-left: 1px solid #E5E7EB;"><strong>هوية مالك المركبة / Owner ID:</strong></td>
          <td style="padding: 8px; border-left: 1px solid #E5E7EB;">${data.violator_vehicle_owner_id || "---"}</td>
          <td style="padding: 8px; border-left: 1px solid #E5E7EB;"><strong>المخالفات السابقة / History:</strong></td>
          <td>${data.previous_violations || "0"} مخالفة سابقة</td>
        </tr>
      </table>
    </div>

    <!-- Section 3: Violations Selection -->
    <div style="margin-bottom: 20px; border: 1px solid #E5E7EB; border-radius: 8px;">
      <div style="background-color: #1a1a2e; color: white; padding: 6px 12px; font-weight: bold; border-top-left-radius: 6px; border-top-right-radius: 6px; font-size: 13px;">
        3. تفاصيل المخالفات المرصودة / Violation Details
      </div>
      <div style="padding: 12px; font-size: 10px; line-height: 1.6;">
        <!-- Traffic -->
        ${data.traffic_violations.length > 0 || data.traffic_other ? `
          <div style="margin-bottom: 10px;">
            <div style="color: #1d4ed8; font-weight: bold; border-bottom: 1px solid #BFDBFE; padding-bottom: 2px; margin-bottom: 5px;">مخالفات مرورية / Traffic Violations:</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px;">
              ${data.traffic_violations.map(id => {
                const item = TRAFFIC_VIOLATIONS.find(v => v.id === id);
                return `<div>[✔] ${item?.label || id}</div>`;
              }).join("")}
            </div>
            ${data.traffic_other ? `<div style="margin-top: 4px; font-weight: 500;">أخرى / Other: ${data.traffic_other}</div>` : ""}
          </div>
        ` : ""}

        <!-- Misconduct -->
        ${data.misconduct_violations.length > 0 || data.misconduct_other ? `
          <div style="margin-bottom: 10px;">
            <div style="color: #b91c1c; font-weight: bold; border-bottom: 1px solid #FCA5A5; padding-bottom: 2px; margin-bottom: 5px;">مخالفات مسلكية وجنائية / Misconduct & Criminal Violations:</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px;">
              ${data.misconduct_violations.map(id => {
                const item = MISCONDUCT_VIOLATIONS.find(v => v.id === id);
                return `<div>[✔] ${item?.label || id}</div>`;
              }).join("")}
            </div>
            ${data.misconduct_other ? `<div style="margin-top: 4px; font-weight: 500;">أخرى / Other: ${data.misconduct_other}</div>` : ""}
          </div>
        ` : ""}

        <!-- Non-Compliance -->
        ${data.noncompliance_violations.length > 0 || data.noncompliance_other ? `
          <div>
            <div style="color: #ea580c; font-weight: bold; border-bottom: 1px solid #FED7AA; padding-bottom: 2px; margin-bottom: 5px;">عدم الالتزام بأنظمة العمل بموقع القدية / Site Non-Compliance:</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px;">
              ${data.noncompliance_violations.map(id => {
                const item = NONCOMPLIANCE_VIOLATIONS.find(v => v.id === id);
                return `<div>[✔] ${item?.label || id}</div>`;
              }).join("")}
            </div>
            ${data.noncompliance_other ? `<div style="margin-top: 4px; font-weight: 500;">أخرى / Other: ${data.noncompliance_other}</div>` : ""}
          </div>
        ` : ""}
      </div>
    </div>

    <!-- Section 4: Attached Images -->
    <div style="margin-bottom: 20px; border: 1px solid #E5E7EB; border-radius: 8px;">
      <div style="background-color: #1a1a2e; color: white; padding: 6px 12px; font-weight: bold; border-top-left-radius: 6px; border-top-right-radius: 6px; font-size: 13px;">
        4. الصور والوثائق المرفقة / Attached Documents & Photos
      </div>
      <div style="padding: 15px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; text-align: center;">
        
        <div>
          <div style="border: 1px dashed #D1D5DB; border-radius: 6px; height: 110px; display: flex; align-items: center; justify-content: center; overflow: hidden; background-color: #F9FAFB;">
            ${photosBase64.license ? `<img src="${photosBase64.license}" style="max-width: 100%; max-height: 100%; object-fit: contain;" />` : `<span style="font-size: 10px; color: #9CA3AF;">لا يوجد مرفق</span>`}
          </div>
          <div style="font-size: 10px; font-weight: bold; margin-top: 5px;">1. صورة الرخصة / License</div>
        </div>

        <div>
          <div style="border: 1px dashed #D1D5DB; border-radius: 6px; height: 110px; display: flex; align-items: center; justify-content: center; overflow: hidden; background-color: #F9FAFB;">
            ${photosBase64.permit ? `<img src="${photosBase64.permit}" style="max-width: 100%; max-height: 100%; object-fit: contain;" />` : `<span style="font-size: 10px; color: #9CA3AF;">لا يوجد مرفق</span>`}
          </div>
          <div style="font-size: 10px; font-weight: bold; margin-top: 5px;">2. صورة التصريح / Permit</div>
        </div>

        <div>
          <div style="border: 1px dashed #D1D5DB; border-radius: 6px; height: 110px; display: flex; align-items: center; justify-content: center; overflow: hidden; background-color: #F9FAFB;">
            ${photosBase64.vehicle ? `<img src="${photosBase64.vehicle}" style="max-width: 100%; max-height: 100%; object-fit: contain;" />` : `<span style="font-size: 10px; color: #9CA3AF;">لا يوجد مرفق</span>`}
          </div>
          <div style="font-size: 10px; font-weight: bold; margin-top: 5px;">3. صورة المركبة / Vehicle</div>
        </div>

        <div>
          <div style="border: 1px dashed #D1D5DB; border-radius: 6px; height: 110px; display: flex; align-items: center; justify-content: center; overflow: hidden; background-color: #F9FAFB;">
            ${photosBase64.plate ? `<img src="${photosBase64.plate}" style="max-width: 100%; max-height: 100%; object-fit: contain;" />` : `<span style="font-size: 10px; color: #9CA3AF;">لا يوجد مرفق</span>`}
          </div>
          <div style="font-size: 10px; font-weight: bold; margin-top: 5px;">4. صورة اللوحة / Plate</div>
        </div>

      </div>
    </div>

    <!-- Section 5: Signatures -->
    <div style="margin-top: 30px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; font-size: 11px;">
      <div style="border: 1px solid #E5E7EB; border-radius: 8px; padding: 12px; background-color: #F9FAFB;">
        <strong style="color: #1a1a2e; font-size: 12px;">مباشر الحالة / Reporting Officer</strong>
        <div style="margin-top: 8px;"><strong>الاسم / Name:</strong> ${data.officer_name || "__________________"}</div>
        <div style="margin-top: 4px;"><strong>الرقم الوظيفي / Emp No:</strong> ${data.officer_employee_number || "_______________"}</div>
        <div style="margin-top: 15px; border-top: 1px dashed #D1D5DB; padding-top: 8px;"><strong>التوقيع / Signature:</strong> ______________________</div>
      </div>
      
      <div style="border: 1px solid #E5E7EB; border-radius: 8px; padding: 12px; background-color: #F9FAFB;">
        <strong style="color: #1a1a2e; font-size: 12px;">المشرف المعتمد / Supervisor in Charge</strong>
        <div style="margin-top: 8px;"><strong>الاسم / Name:</strong> ${data.supervisor_name || "__________________"}</div>
        <div style="margin-top: 4px;"><strong>الرقم الوظيفي / Emp No:</strong> ${data.supervisor_employee_number || "_______________"}</div>
        <div style="margin-top: 15px; border-top: 1px dashed #D1D5DB; padding-top: 8px;"><strong>التوقيع / Signature:</strong> ______________________</div>
      </div>
    </div>

    <!-- Footer -->
    <div style="margin-top: 30px; text-align: center; font-size: 9px; color: #9CA3AF; border-top: 1px solid #E5E7EB; padding-top: 10px;">
      نموذج (33) إدارة أمن القدية - عمليات تشغيل أمن الموقع (Site Security Operations) - النسخة 3.0
    </div>
  `;

  document.body.appendChild(printContainer);

  try {
    const canvas = await html2canvas(printContainer, {
      scale: 2, // Retains high resolution
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#FFFFFF",
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    // Embed capturing as full-page image
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    
    const fileName = `مخالفة_${data.reference_no || "بدون_رقم"}_${data.date || "تاريخ"}.pdf`;
    pdf.save(fileName);
  } catch (error) {
    console.error("Failed to generate PDF:", error);
    throw error;
  } finally {
    document.body.removeChild(printContainer);
  }
};
