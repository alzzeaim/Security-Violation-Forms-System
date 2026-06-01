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
  const allPhotos: { src: string; label: string }[] = [];

  if (data.photo_license) allPhotos.push({ src: await fileToBase64(data.photo_license), label: "صورة الرخصة / License Photo" });
  if (data.photo_permit) allPhotos.push({ src: await fileToBase64(data.photo_permit), label: "صورة التصريح / Permit Photo" });
  if (data.photo_vehicle) allPhotos.push({ src: await fileToBase64(data.photo_vehicle), label: "صورة المركبة / Vehicle Photo" });
  if (data.photo_plate) allPhotos.push({ src: await fileToBase64(data.photo_plate), label: "صورة اللوحة / Plate Photo" });
  if (data.photo_id) allPhotos.push({ src: await fileToBase64(data.photo_id), label: "صورة الهوية / ID Photo" });

  for (let i = 0; i < data.photo_others.length; i++) {
    const p = data.photo_others[i];
    const base64 = await fileToBase64(p.file);
    allPhotos.push({ src: base64, label: p.description || `صورة إضافية / Additional Photo ${i + 1}` });
  }

  // Helper for checkboxes
  const cb = (checked: boolean) => `
    <div style="width: 14px; height: 14px; border: 1px solid ${checked ? '#17407A' : '#64748b'}; background-color: ${checked ? '#17407A' : '#f8fafc'}; display: inline-block; text-align: center; line-height: 14px; font-size: 11px; color: ${checked ? '#eab308' : 'transparent'}; font-weight: bold; margin-left: 6px; flex-shrink: 0; vertical-align: middle; border-radius: 2px;">
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
      
      html += `<td style="border: 1px solid #000; padding: 4px 6px; width: 50%;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span>${v1.label}</span> ${cb(selectedIds.includes(v1.id))}
        </div>
      </td>`;
      
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

  // Create temporary container for height measurements
  const tempContainer = document.createElement("div");
  tempContainer.style.position = "absolute";
  tempContainer.style.left = "-9999px";
  tempContainer.style.top = "-9999px";
  tempContainer.style.width = "714px"; // 794px A4 width - 80px padding (40px left, 40px right)
  tempContainer.dir = "rtl";
  tempContainer.style.boxSizing = "border-box";
  tempContainer.style.fontFamily = "Arial, sans-serif";
  tempContainer.style.color = "#17407A";
  document.body.appendChild(tempContainer);

  const measureHeight = (html: string): number => {
    tempContainer.innerHTML = html;
    const height = tempContainer.offsetHeight;
    tempContainer.innerHTML = "";
    return height;
  };

  const createPage = (): { page: HTMLDivElement; contentWrapper: HTMLDivElement } => {
    const page = document.createElement("div");
    page.style.position = "absolute";
    page.style.left = "-9999px";
    page.style.top = "-9999px";
    page.style.width = "794px";
    page.style.height = "1123px";
    page.style.backgroundColor = "#FFFFFF";
    page.style.color = "#17407A";
    page.style.padding = "30px 40px 90px 40px"; // 90px bottom padding to reserve footer space
    page.style.boxSizing = "border-box";
    page.style.fontFamily = "Arial, sans-serif";
    page.dir = "rtl";

    const contentWrapper = document.createElement("div");
    contentWrapper.style.width = "100%";
    contentWrapper.style.height = "auto";
    page.appendChild(contentWrapper);

    const footer = document.createElement("div");
    footer.style.position = "absolute";
    footer.style.bottom = "30px";
    footer.style.left = "40px";
    footer.style.right = "40px";
    footer.innerHTML = `
      <div style="border-top: 1px solid #17407A; padding-top: 10px; display: flex; justify-content: space-between; font-size: 11px; font-weight: bold;">
        <span>النسخة 3</span>
        <span>إدارة أمن القدية Site Security Operations</span>
        <span>نموذج (33)</span>
      </div>
      <div style="text-align: center; font-size: 11px; color: #6B7280; margin-top: 5px; font-family: monospace;">
        This email \\ document has been classified as public
      </div>
    `;
    page.appendChild(footer);

    return { page, contentWrapper };
  };

  const pages: { page: HTMLDivElement; wrapper: HTMLDivElement }[] = [];
  
  const createNewPage = () => {
    const { page, contentWrapper } = createPage();
    pages.push({ page, wrapper: contentWrapper });
    return pages[pages.length - 1];
  };

  let currentPage = createNewPage();
  let currentHeight = 0;
  const MAX_CONTENT_HEIGHT = 980; // Max allowed height of content on a single page

  const addBlockToPages = (html: string) => {
    const blockHeight = measureHeight(html);
    
    if (currentHeight + blockHeight > MAX_CONTENT_HEIGHT) {
      currentPage = createNewPage();
      currentHeight = 0;
    }
    
    const blockDiv = document.createElement("div");
    blockDiv.innerHTML = html;
    currentPage.wrapper.appendChild(blockDiv);
    currentHeight += blockHeight;
  };

  // HTML content parts
  const mainInfoHTML = `
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
    <div style="margin-top: 15px; margin-bottom: 15px;">
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
        <td style="border: 1px solid #ccc; padding: 6px; width: 25%;">جهة العمل/Organization</td>
        <td style="border: 1px solid #ccc; padding: 6px; width: 25%;">الجنسية/Nationality</td>
        <td style="border: 1px solid #ccc; padding: 6px; width: 25%;">رقم الهوية/رقم الإقامة/ID Number</td>
      </tr>
      <tr style="color: #000; font-weight: normal;">
        <td style="border: 1px solid #ccc; padding: 6px; height: 24px;">${data.violator_name || "&nbsp;"}</td>
        <td style="border: 1px solid #ccc; padding: 6px;">${data.violator_organization || "&nbsp;"}</td>
        <td style="border: 1px solid #ccc; padding: 6px;">${data.violator_nationality || "&nbsp;"}</td>
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
  `;

  const trafficHTML = `
    <div style="margin-top: 20px;">
      <div style="display: flex; justify-content: space-between; align-items: flex-end; margin: 0 0 5px 0;">
        <h2 style="font-size: 20px; font-weight: bold; text-decoration: underline; margin: 0;">مخالفة مرورية</h2>
        <h2 style="font-size: 18px; font-weight: bold; text-decoration: underline; margin: 0;">Traffic Violation</h2>
      </div>
      ${renderViolationsTable(TRAFFIC_VIOLATIONS, data.traffic_violations)}
      <div style="display: flex; align-items: flex-end; margin-top: 8px;">
        <span style="font-weight: bold; font-size: 14px;">أخرى / Other:</span>
        <span style="flex: 1; border-bottom: 1px dotted #17407A; margin: 0 10px; font-size: 13px; color: #000; text-align: center;">${data.traffic_other || "&nbsp;"}</span>
      </div>
    </div>
  `;

  const misconductHTML = `
    <div style="margin-top: 20px;">
      <div style="display: flex; justify-content: space-between; align-items: flex-end; margin: 0 0 5px 0;">
        <h2 style="font-size: 20px; font-weight: bold; text-decoration: underline; margin: 0;">مخالفة جنائية</h2>
        <h2 style="font-size: 18px; font-weight: bold; text-decoration: underline; margin: 0;">Misconduct Violation</h2>
      </div>
      ${renderViolationsTable(MISCONDUCT_VIOLATIONS, data.misconduct_violations)}
      <div style="display: flex; align-items: flex-end; margin-top: 8px;">
        <span style="font-weight: bold; font-size: 14px;">أخرى / Other:</span>
        <span style="flex: 1; border-bottom: 1px dotted #17407A; margin: 0 10px; font-size: 13px; color: #000; text-align: center;">${data.misconduct_other || "&nbsp;"}</span>
      </div>
    </div>
  `;

  const nonComplianceHTML = `
    <div style="margin-top: 20px;">
      <div style="display: flex; justify-content: space-between; align-items: flex-end; margin: 0 0 5px 0;">
        <h2 style="font-size: 20px; font-weight: bold; text-decoration: underline; margin: 0;">مخالفة عدم التزام بأنظمة القدية</h2>
        <h2 style="font-size: 18px; font-weight: bold; text-decoration: underline; margin: 0;">Non-Compliance</h2>
      </div>
      ${renderViolationsTable(NONCOMPLIANCE_VIOLATIONS, data.noncompliance_violations)}
      <div style="display: flex; align-items: flex-end; margin-top: 8px;">
        <span style="font-weight: bold; font-size: 14px;">أخرى / Other:</span>
        <span style="flex: 1; border-bottom: 1px dotted #17407A; margin: 0 10px; font-size: 13px; color: #000; text-align: center;">${data.noncompliance_other || "&nbsp;"}</span>
      </div>
    </div>
  `;

  const photosTitleHTML = `
    <div style="margin-top: 25px; margin-bottom: 15px;">
      <h2 style="font-size: 20px; font-weight: bold; text-decoration: underline; text-align: center; margin: 0;">الصور المرفقة / Attached Photos</h2>
    </div>
  `;

  const signaturesHTML = `
    <div style="display: flex; justify-content: space-between; margin-top: 40px; font-weight: bold; width: 100%;">
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
  `;

  // Start laying out content blocks dynamically
  // Page 1 starts with the Main Info Block
  const mainInfoHeight = measureHeight(mainInfoHTML);
  const mainInfoDiv = document.createElement("div");
  mainInfoDiv.innerHTML = mainInfoHTML;
  currentPage.wrapper.appendChild(mainInfoDiv);
  currentHeight = mainInfoHeight;

  // Add violation blocks
  addBlockToPages(trafficHTML);
  addBlockToPages(misconductHTML);
  addBlockToPages(nonComplianceHTML);

  // Add photos
  if (allPhotos.length > 0) {
    addBlockToPages(photosTitleHTML);

    const chunkPhotos = (arr: { src: string; label: string }[], size: number) => {
      const chunks = [];
      for (let i = 0; i < arr.length; i += size) {
        chunks.push(arr.slice(i, i + size));
      }
      return chunks;
    };

    const photoRows = chunkPhotos(allPhotos, 3);

    photoRows.forEach((row) => {
      const rowHTML = `
        <div style="display: flex; gap: 15px; justify-content: center; margin-bottom: 15px; width: 100%;">
          ${row.map(photo => `
            <div style="width: 210px; border: 1px solid #ccc; padding: 10px; text-align: center; border-radius: 8px; box-sizing: border-box; background-color: #f9fafb;">
              <img src="${photo.src}" style="max-width: 100%; height: 130px; object-fit: contain; margin-bottom: 8px; display: block; margin-left: auto; margin-right: auto;"/>
              <b style="font-size: 12px; color: #1f2937; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${photo.label}</b>
            </div>
          `).join("")}
        </div>
      `;
      addBlockToPages(rowHTML);
    });
  }

  // Add signatures
  addBlockToPages(signaturesHTML);

  // Render pages using html2canvas & jsPDF
  try {
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    for (let i = 0; i < pages.length; i++) {
      const { page } = pages[i];
      document.body.appendChild(page);

      const canvas = await html2canvas(page, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#FFFFFF",
      });

      const imgData = canvas.toDataURL("image/png");

      if (i > 0) {
        pdf.addPage();
      }

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

      document.body.removeChild(page);
    }

    const fileName = `مخالفة_${data.reference_no || "بدون_رقم"}_${data.date || "تاريخ"}.pdf`;
    pdf.save(fileName);
  } catch (error) {
    console.error("Failed to generate PDF:", error);
    throw error;
  } finally {
    pages.forEach(({ page }) => {
      if (document.body.contains(page)) {
        document.body.removeChild(page);
      }
    });
    if (document.body.contains(tempContainer)) {
      document.body.removeChild(tempContainer);
    }
  }
};
