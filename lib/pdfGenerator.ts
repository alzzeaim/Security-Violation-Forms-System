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
    id: null,
  };

  if (data.photo_license) photosBase64.license = await fileToBase64(data.photo_license);
  if (data.photo_permit) photosBase64.permit = await fileToBase64(data.photo_permit);
  if (data.photo_vehicle) photosBase64.vehicle = await fileToBase64(data.photo_vehicle);
  if (data.photo_plate) photosBase64.plate = await fileToBase64(data.photo_plate);
  if (data.photo_id) photosBase64.id = await fileToBase64(data.photo_id);

  const othersBase64: string[] = [];
  for (const file of data.photo_others) {
    const base64 = await fileToBase64(file);
    othersBase64.push(base64);
  }

  const hasPhotos = Object.values(photosBase64).some((b) => b !== null) || othersBase64.length > 0;

  // Helper for checkboxes
  const cb = (checked: boolean) => `
    <div style="width: 16px; height: 16px; border: 2px solid #4CAF50; display: inline-flex; align-items: center; justify-content: center; font-size: 14px; color: #4CAF50; font-weight: bold; margin-left: 6px; flex-shrink: 0; background-color: #FFF;">
      ${checked ? "✔" : ""}
    </div>
  `;

  // Helper for tables
  const renderViolationsTable = (violationsArray: { id: string; label: string }[], selectedIds: string[]) => {
    let html = `<table style="width: 100%; border-collapse: collapse; font-size: 11px; border: 2px solid #000; font-weight: bold; color: #17407A;">`;
    for (let i = 0; i < violationsArray.length; i += 2) {
      const v1 = violationsArray[i];
      const v2 = violationsArray[i + 1];
      html += `<tr>`;
      
      // Column 1 (Right visually in RTL)
      html += `<td style="border: 1px solid #000; padding: 4px 6px; width: 50%;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span>${v1.label}</span> ${cb(selectedIds.includes(v1.id))}
        </div>
      </td>`;
      
      // Column 2 (Left visually in RTL)
      if (v2) {
        html += `<td style="border: 1px solid #000; padding: 4px 6px; width: 50%;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>${v2.label}</span> ${cb(selectedIds.includes(v2.id))}
          </div>
        </td>`;
      } else {
        html += `<td style="border: 1px solid #000; padding: 4px 6px; width: 50%;"></td>`;
      }
      
      html += `</tr>`;
    }
    html += `</table>`;
    return html;
  };

  // --- Page 1 (Main Form) ---
  const page1Container = document.createElement("div");
  page1Container.style.position = "absolute";
  page1Container.style.left = "-9999px";
  page1Container.style.top = "-9999px";
  page1Container.style.width = "794px"; // A4 Width at 96DPI
  page1Container.style.minHeight = "1123px"; // A4 Height
  page1Container.style.backgroundColor = "#FFFFFF";
  page1Container.style.color = "#17407A";
  page1Container.style.padding = "40px";
  page1Container.style.boxSizing = "border-box";
  page1Container.style.fontFamily = "Arial, sans-serif";
  page1Container.dir = "rtl";

  page1Container.innerHTML = `
    <!-- Header -->
    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 20px;">
      <div style="width: 150px; text-align: center;">
        <div style="display: flex; align-items: flex-end; justify-content: center; gap: 3px; height: 30px; margin-bottom: 5px;">
          <div style="width: 5px; height: 15px; background: #eab308;"></div>
          <div style="width: 5px; height: 25px; background: #f59e0b;"></div>
          <div style="width: 5px; height: 30px; background: #ef4444;"></div>
          <div style="width: 5px; height: 20px; background: #3b82f6;"></div>
          <div style="width: 5px; height: 10px; background: #22c55e;"></div>
        </div>
        <div style="color: #17407A; font-weight: bold; font-size: 26px; line-height: 1;">القدية</div>
        <div style="color: #17407A; font-size: 18px; line-height: 1.2;">Qiddiya</div>
      </div>
      
      <div style="flex: 1; text-align: center; padding-bottom: 10px;">
        <h1 style="color: #17407A; font-size: 28px; font-weight: bold; text-decoration: underline; margin: 0;">نموذج مخالفة / Violation Form</h1>
      </div>
      
      <div style="width: 150px;"></div> <!-- Spacer -->
    </div>

    <!-- Section 1: Incident Info -->
    <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
      <!-- Right Column (Incident Info) -->
      <div style="flex: 1.2;">
        <h2 style="color: #17407A; font-size: 20px; font-weight: bold; text-decoration: underline; margin: 0 0 10px 0;">معلومات الحالة</h2>
        
        <div style="display: flex; margin-bottom: 8px; align-items: flex-end;">
          <span style="font-size: 13px; font-weight: bold; white-space: nowrap;">رقم الصادر/Reference No:</span>
          <span style="flex: 1; border-bottom: 1px dotted #17407A; margin: 0 5px; text-align: center; font-size: 13px; color: #000;">${data.reference_no || "&nbsp;"}</span>
        </div>
        <div style="display: flex; margin-bottom: 8px; align-items: flex-end;">
          <span style="font-size: 13px; font-weight: bold; white-space: nowrap;">الموقع/Location:</span>
          <span style="flex: 1; border-bottom: 1px dotted #17407A; margin: 0 5px; text-align: center; font-size: 13px; color: #000;">${data.location || "&nbsp;"}</span>
        </div>
        <div style="display: flex; margin-bottom: 8px; align-items: flex-end;">
          <span style="font-size: 13px; font-weight: bold; white-space: nowrap;">التاريخ/Date:</span>
          <span style="flex: 1; border-bottom: 1px dotted #17407A; margin: 0 5px; text-align: center; font-size: 13px; color: #000;">${data.date || "&nbsp;"}</span>
        </div>
        <div style="display: flex; margin-bottom: 8px; align-items: flex-end;">
          <span style="font-size: 13px; font-weight: bold; white-space: nowrap;">وقت بداية الحالة/Start Time:</span>
          ${cb(false)} <span style="font-size: 12px; font-weight: bold; margin-left: 10px;">صباحاً/AM</span>
          ${cb(false)} <span style="font-size: 12px; font-weight: bold;">مساءً/PM</span>
          <span style="flex: 1; border-bottom: 1px dotted #17407A; margin: 0 5px; text-align: center; font-size: 13px; color: #000;">${data.start_time || "&nbsp;"}</span>
        </div>
        <div style="display: flex; margin-bottom: 8px; align-items: flex-end;">
          <span style="font-size: 13px; font-weight: bold; white-space: nowrap;">وقت انتهاء الحالة/End Time:</span>
          ${cb(false)} <span style="font-size: 12px; font-weight: bold; margin-left: 10px;">صباحاً/AM</span>
          ${cb(false)} <span style="font-size: 12px; font-weight: bold;">مساءً/PM</span>
          <span style="flex: 1; border-bottom: 1px dotted #17407A; margin: 0 5px; text-align: center; font-size: 13px; color: #000;">${data.end_time || "&nbsp;"}</span>
        </div>
      </div>

      <!-- Middle Column (Purpose) -->
      <div style="width: 170px; text-align: right; padding-right: 20px;">
        <div style="font-size: 13px; font-weight: bold; text-align: center; margin-bottom: 10px; line-height: 1.2;">سبب التواجد في القدية<br/>Purpose of Visit</div>
        <div style="display: flex; justify-content: flex-end; align-items: center; margin-bottom: 8px; font-weight: bold;">
          <span style="font-size: 12px;">موظف قدية/QIC</span> ${cb(data.visit_purpose === "qic_employee")}
        </div>
        <div style="display: flex; justify-content: flex-end; align-items: center; margin-bottom: 8px; font-weight: bold;">
          <span style="font-size: 12px;">إستشاري/Consultant</span> ${cb(data.visit_purpose === "consultant")}
        </div>
        <div style="display: flex; justify-content: flex-end; align-items: center; margin-bottom: 8px; font-weight: bold;">
          <span style="font-size: 12px;">مقاول/Contractor</span> ${cb(data.visit_purpose === "contractor")}
        </div>
        <div style="display: flex; justify-content: flex-end; align-items: center; margin-bottom: 8px; font-weight: bold;">
          <span style="font-size: 12px;">زائر/Visitor</span> ${cb(data.visit_purpose === "visitor")}
        </div>
      </div>

      <!-- Left Column (Permit Type) -->
      <div style="width: 180px; text-align: right; padding-right: 20px;">
        <div style="font-size: 13px; font-weight: bold; text-align: center; margin-bottom: 10px; line-height: 1.2;">نوع التصريح<br/>Permit Type</div>
        <div style="display: flex; justify-content: flex-end; align-items: center; margin-bottom: 8px; font-weight: bold;">
          <span style="font-size: 12px;">سند تسليم/Delivery Note</span> ${cb(data.permit_type === "delivery_note")}
        </div>
        <div style="display: flex; justify-content: flex-end; align-items: center; margin-bottom: 8px; font-weight: bold;">
          <span style="font-size: 12px;">باركود/QR</span> ${cb(data.permit_type === "qr")}
        </div>
        <div style="display: flex; justify-content: flex-end; align-items: center; margin-bottom: 8px; font-weight: bold;">
          <span style="font-size: 12px;">بطاقة/Badge</span> ${cb(data.permit_type === "badge")}
        </div>
        <div style="display: flex; justify-content: flex-end; align-items: center; margin-bottom: 8px; font-weight: bold;">
          <span style="font-size: 12px;">ورق/Form</span> ${cb(data.permit_type === "form")}
        </div>
      </div>
    </div>

    <!-- Section 2: Source of Violation -->
    <div style="margin-top: 15px;">
      <h2 style="font-size: 20px; font-weight: bold; text-decoration: underline; margin: 0 0 10px 0; display: inline-block;">:مصدر المخالفة/Source of Violation</h2>
      <div style="display: flex; justify-content: space-between; align-items: flex-end;">
        <div style="display: flex; align-items: flex-end; flex: 1;">
          <span style="font-size: 13px; font-weight: bold; white-space: nowrap;">المبلغ /Reported by:</span>
          <span style="flex: 1; border-bottom: 1px dotted #17407A; margin: 0 10px; font-size: 13px; color: #000; text-align: center;">${data.reported_by || "&nbsp;"}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 10px; font-weight: bold;">
          <div style="display: flex; align-items: center;"><span style="font-size: 12px;">موظف قدية<br/>QIC/QDP</span> ${cb(data.violation_source.includes("qic_qdp"))}</div>
          <div style="display: flex; align-items: center;"><span style="font-size: 12px;">داش كام<br/>Dashcam</span> ${cb(data.violation_source.includes("dashcam"))}</div>
          <div style="display: flex; align-items: center;"><span style="font-size: 12px;">أمن القدية<br/>Security</span> ${cb(data.violation_source.includes("security"))}</div>
          <div style="display: flex; align-items: center;"><span style="font-size: 12px;">مسدس سرعة<br/>Speed Gun</span> ${cb(data.violation_source.includes("speed_gun"))}</div>
          <div style="display: flex; align-items: center;"><span style="font-size: 12px;">كاميرا سرعة<br/>Speed Cam</span> ${cb(data.violation_source.includes("speed_cam"))}</div>
        </div>
      </div>
    </div>

    <!-- Section 3: Personal Info -->
    <h2 style="font-size: 20px; font-weight: bold; text-decoration: underline; margin: 20px 0 10px 0; text-align: center;">المعلومات الشخصية<br/><span style="font-size: 16px;">Personal Info</span></h2>
    <table style="width: 100%; border-collapse: collapse; text-align: center; font-size: 12px; border: 1px solid #ccc; font-weight: bold;">
      <tr>
        <td style="border: 1px solid #ccc; padding: 6px; width: 25%;">الاسم/Name</td>
        <td style="border: 1px solid #ccc; padding: 6px; width: 25%;">الجنسية/Nationality</td>
        <td style="border: 1px solid #ccc; padding: 6px; width: 25%;">جهة العمل/Organization</td>
        <td style="border: 1px solid #ccc; padding: 6px; width: 25%;">رقم الهوية/رقم الإقامة/ID Number</td>
      </tr>
      <tr style="color: #000; font-weight: normal;">
        <td style="border: 1px solid #ccc; padding: 6px; height: 24px;">${data.violator_name || "&nbsp;"}</td>
        <td style="border: 1px solid #ccc; padding: 6px;">${data.violator_nationality || "&nbsp;"}</td>
        <td style="border: 1px solid #ccc; padding: 6px;">${data.violator_organization || "&nbsp;"}</td>
        <td style="border: 1px solid #ccc; padding: 6px;">${data.violator_id_number || "&nbsp;"}</td>
      </tr>
      <tr>
        <td style="border: 1px solid #ccc; padding: 6px;">عدد المخالفات السابقة/Previous Violations</td>
        <td style="border: 1px solid #ccc; padding: 6px;">رقم لوحة المركبة/Plate Number</td>
        <td style="border: 1px solid #ccc; padding: 6px;">رقم الجوال/Phone No.</td>
        <td style="border: 1px solid #ccc; padding: 6px;">رقم هوية مالك المركبة/Vehicle Owner ID No.</td>
      </tr>
      <tr style="color: #000; font-weight: normal;">
        <td style="border: 1px solid #ccc; padding: 6px; height: 24px;">${data.previous_violations || "0"}</td>
        <td style="border: 1px solid #ccc; padding: 6px;">${data.violator_plate_number || "&nbsp;"}</td>
        <td style="border: 1px solid #ccc; padding: 6px;">${data.violator_phone || "&nbsp;"}</td>
        <td style="border: 1px solid #ccc; padding: 6px;">${data.violator_vehicle_owner_id || "&nbsp;"}</td>
      </tr>
    </table>

    <!-- Section 4: Traffic Violations -->
    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin: 20px 0 5px 0;">
      <h2 style="font-size: 20px; font-weight: bold; text-decoration: underline; margin: 0;">مخالفة مرورية</h2>
      <h2 style="font-size: 18px; font-weight: bold; text-decoration: underline; margin: 0;">Traffic Violation</h2>
    </div>
    ${renderViolationsTable(TRAFFIC_VIOLATIONS, data.traffic_violations)}
    <div style="display: flex; align-items: flex-end; margin-top: 8px;">
      <span style="font-weight: bold; font-size: 14px;">أخرى / Other:</span>
      <span style="flex: 1; border-bottom: 1px dotted #17407A; margin: 0 10px; font-size: 13px; color: #000; text-align: center;">${data.traffic_other || "&nbsp;"}</span>
    </div>

    <!-- Section 5: Misconduct Violations -->
    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin: 20px 0 5px 0;">
      <h2 style="font-size: 20px; font-weight: bold; text-decoration: underline; margin: 0;">مخالفة جنائية</h2>
      <h2 style="font-size: 18px; font-weight: bold; text-decoration: underline; margin: 0;">Misconduct Violation</h2>
    </div>
    ${renderViolationsTable(MISCONDUCT_VIOLATIONS, data.misconduct_violations)}
    <div style="display: flex; align-items: flex-end; margin-top: 8px;">
      <span style="font-weight: bold; font-size: 14px;">أخرى / Other:</span>
      <span style="flex: 1; border-bottom: 1px dotted #17407A; margin: 0 10px; font-size: 13px; color: #000; text-align: center;">${data.misconduct_other || "&nbsp;"}</span>
    </div>

    <!-- Section 6: Non-compliance Violations -->
    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin: 20px 0 5px 0;">
      <h2 style="font-size: 20px; font-weight: bold; text-decoration: underline; margin: 0;">مخالفة عدم التزام بأنظمة القدية</h2>
      <h2 style="font-size: 18px; font-weight: bold; text-decoration: underline; margin: 0;">Non-Compliance</h2>
    </div>
    ${renderViolationsTable(NONCOMPLIANCE_VIOLATIONS, data.noncompliance_violations)}
    <div style="display: flex; align-items: flex-end; margin-top: 8px;">
      <span style="font-weight: bold; font-size: 14px;">أخرى / Other:</span>
      <span style="flex: 1; border-bottom: 1px dotted #17407A; margin: 0 10px; font-size: 13px; color: #000; text-align: center;">${data.noncompliance_other || "&nbsp;"}</span>
    </div>

    <!-- Section 7: Signatures -->
    <div style="display: flex; justify-content: space-between; margin-top: 30px; font-weight: bold;">
      <!-- Right: مباشر الحالة -->
      <div style="width: 45%;">
        <div style="text-decoration: underline; text-align: center; margin-bottom: 15px; font-size: 16px;">مباشر الحالة</div>
        <div style="display: flex; margin-bottom: 15px; align-items: flex-end;">
          <span style="font-size: 13px; width: 100px;">الاسم:</span>
          <span style="flex: 1; border-bottom: 1px dotted #17407A; font-size: 13px; color: #000; text-align: center;">${data.officer_name || "&nbsp;"}</span>
        </div>
        <div style="display: flex; margin-bottom: 15px; align-items: flex-end;">
          <span style="font-size: 13px; width: 100px;">الرقم الوظيفي:</span>
          <span style="flex: 1; border-bottom: 1px dotted #17407A; font-size: 13px; color: #000; text-align: center;">${data.officer_employee_number || "&nbsp;"}</span>
        </div>
        <div style="display: flex; margin-bottom: 15px; align-items: flex-end;">
          <span style="font-size: 13px; width: 100px;">التوقيع:</span>
          <span style="flex: 1; border-bottom: 1px dotted #17407A;"></span>
        </div>
      </div>
      <!-- Left: المشرف -->
      <div style="width: 45%;">
        <div style="text-decoration: underline; text-align: center; margin-bottom: 15px; font-size: 16px;">المشرف</div>
        <div style="display: flex; margin-bottom: 15px; align-items: flex-end;">
          <span style="font-size: 13px; width: 100px;">الاسم:</span>
          <span style="flex: 1; border-bottom: 1px dotted #17407A; font-size: 13px; color: #000; text-align: center;">${data.supervisor_name || "&nbsp;"}</span>
        </div>
        <div style="display: flex; margin-bottom: 15px; align-items: flex-end;">
          <span style="font-size: 13px; width: 100px;">الرقم الوظيفي:</span>
          <span style="flex: 1; border-bottom: 1px dotted #17407A; font-size: 13px; color: #000; text-align: center;">${data.supervisor_employee_number || "&nbsp;"}</span>
        </div>
        <div style="display: flex; margin-bottom: 15px; align-items: flex-end;">
          <span style="font-size: 13px; width: 100px;">التوقيع:</span>
          <span style="flex: 1; border-bottom: 1px dotted #17407A;"></span>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div style="margin-top: 30px; border-top: 1px solid #17407A; padding-top: 10px; display: flex; justify-content: space-between; font-size: 11px; font-weight: bold;">
      <span>النسخة 3</span>
      <span>إدارة أمن القدية Site Security Operations</span>
      <span>نموذج (33)</span>
    </div>
    <div style="text-align: center; font-size: 11px; color: #6B7280; margin-top: 5px; font-family: monospace;">
      This email \\ document has been classified as public
    </div>
  `;

  document.body.appendChild(page1Container);

  // --- Page 2 (Photos) ---
  let page2Container: HTMLDivElement | null = null;
  if (hasPhotos) {
    page2Container = document.createElement("div");
    page2Container.style.position = "absolute";
    page2Container.style.left = "-9999px";
    page2Container.style.top = "-9999px";
    page2Container.style.width = "794px";
    page2Container.style.minHeight = "1123px";
    page2Container.style.backgroundColor = "#FFFFFF";
    page2Container.style.color = "#17407A";
    page2Container.style.padding = "40px";
    page2Container.style.boxSizing = "border-box";
    page2Container.style.fontFamily = "Arial, sans-serif";
    page2Container.dir = "rtl";

    page2Container.innerHTML = `
      <h2 style="font-size: 24px; font-weight: bold; text-decoration: underline; margin-bottom: 30px; text-align: center;">الصور المرفقة / Attached Photos</h2>
      <div style="display: flex; flex-wrap: wrap; gap: 20px; justify-content: center;">
        ${photosBase64.license ? `<div style="width: 320px; border: 1px solid #ccc; padding: 10px; text-align: center; border-radius: 8px;"><img src="${photosBase64.license}" style="max-width: 100%; height: 200px; object-fit: contain; margin-bottom: 10px;"/><br/><b style="font-size: 14px;">صورة الرخصة / License Photo</b></div>` : ""}
        ${photosBase64.permit ? `<div style="width: 320px; border: 1px solid #ccc; padding: 10px; text-align: center; border-radius: 8px;"><img src="${photosBase64.permit}" style="max-width: 100%; height: 200px; object-fit: contain; margin-bottom: 10px;"/><br/><b style="font-size: 14px;">صورة التصريح / Permit Photo</b></div>` : ""}
        ${photosBase64.vehicle ? `<div style="width: 320px; border: 1px solid #ccc; padding: 10px; text-align: center; border-radius: 8px;"><img src="${photosBase64.vehicle}" style="max-width: 100%; height: 200px; object-fit: contain; margin-bottom: 10px;"/><br/><b style="font-size: 14px;">صورة المركبة / Vehicle Photo</b></div>` : ""}
        ${photosBase64.plate ? `<div style="width: 320px; border: 1px solid #ccc; padding: 10px; text-align: center; border-radius: 8px;"><img src="${photosBase64.plate}" style="max-width: 100%; height: 200px; object-fit: contain; margin-bottom: 10px;"/><br/><b style="font-size: 14px;">صورة اللوحة / Plate Photo</b></div>` : ""}
        ${photosBase64.id ? `<div style="width: 320px; border: 1px solid #ccc; padding: 10px; text-align: center; border-radius: 8px;"><img src="${photosBase64.id}" style="max-width: 100%; height: 200px; object-fit: contain; margin-bottom: 10px;"/><br/><b style="font-size: 14px;">صورة الهوية / ID Photo</b></div>` : ""}
        ${othersBase64.map((b64, idx) => `<div style="width: 320px; border: 1px solid #ccc; padding: 10px; text-align: center; border-radius: 8px;"><img src="${b64}" style="max-width: 100%; height: 200px; object-fit: contain; margin-bottom: 10px;"/><br/><b style="font-size: 14px;">صورة إضافية / Additional Photo ${idx + 1}</b></div>`).join("")}
      </div>
    `;
    document.body.appendChild(page2Container);
  }

  try {
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Render Page 1
    const canvas1 = await html2canvas(page1Container, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#FFFFFF",
    });
    const imgData1 = canvas1.toDataURL("image/png");
    const imgHeight1 = (canvas1.height * pdfWidth) / canvas1.width;
    pdf.addImage(imgData1, "PNG", 0, 0, pdfWidth, imgHeight1);

    // Render Page 2 if exists
    if (page2Container) {
      const canvas2 = await html2canvas(page2Container, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#FFFFFF",
      });
      const imgData2 = canvas2.toDataURL("image/png");
      
      // Calculate how many A4 pages we need for the photos
      const imgHeight2 = (canvas2.height * pdfWidth) / canvas2.width;
      let heightLeft = imgHeight2;
      let position = 0;

      // Add the first page of photos
      pdf.addPage();
      pdf.addImage(imgData2, "PNG", 0, position, pdfWidth, imgHeight2);
      heightLeft -= pdfHeight;

      // Add extra pages if the photos overflow the single A4 page
      while (heightLeft > 0) {
        position = heightLeft - imgHeight2;
        pdf.addPage();
        pdf.addImage(imgData2, "PNG", 0, position, pdfWidth, imgHeight2);
        heightLeft -= pdfHeight;
      }
    }

    const fileName = `مخالفة_${data.reference_no || "بدون_رقم"}_${data.date || "تاريخ"}.pdf`;
    pdf.save(fileName);
  } catch (error) {
    console.error("Failed to generate PDF:", error);
    throw error;
  } finally {
    if (document.body.contains(page1Container)) document.body.removeChild(page1Container);
    if (page2Container && document.body.contains(page2Container)) document.body.removeChild(page2Container);
  }
};
