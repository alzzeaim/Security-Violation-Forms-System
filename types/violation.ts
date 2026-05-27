export type Role = 'employee' | 'supervisor';

export interface Employee {
  id: string;
  name: string;
  employee_number: string;
  nationality?: string;
  organization?: string;
  phone?: string;
  id_number?: string;
  role: Role;
  is_active: boolean;
  created_at: string;
}

export type PermitType = 'delivery_note' | 'qr' | 'badge' | 'form';
export type VisitPurpose = 'qic_employee' | 'consultant' | 'contractor' | 'visitor' | 'other';
export type ViolationSource = 'qic_qdp' | 'dashcam' | 'security' | 'speed_gun' | 'speed_cam';

export interface ViolationFormData {
  // Incident Info
  reference_no: string;
  location: string;
  date: string;
  start_time: string;
  end_time: string;
  permit_type: PermitType | null;
  visit_purpose: VisitPurpose | null;
  visit_purpose_other: string;
  violation_source: ViolationSource[];
  reported_by: string;

  // Personal Info (selected from DB)
  violator_employee_id: string | null;
  violator_name: string;
  violator_nationality: string;
  violator_organization: string;
  violator_id_number: string;
  violator_phone: string;
  violator_plate_number: string;
  violator_vehicle_owner_id: string;
  previous_violations: string;

  // Traffic Violations
  traffic_violations: string[];
  traffic_other: string;

  // Misconduct Violations
  misconduct_violations: string[];
  misconduct_other: string;

  // Non-Compliance Violations
  noncompliance_violations: string[];
  noncompliance_other: string;

  // Photos (base64 or File objects)
  photo_license: File | null;
  photo_permit: File | null;
  photo_vehicle: File | null;
  photo_plate: File | null;

  // Officer (person filing the report)
  officer_employee_id: string | null;
  officer_name: string;
  officer_employee_number: string;

  // Supervisor
  supervisor_employee_id: string | null;
  supervisor_name: string;
  supervisor_employee_number: string;
}

export const TRAFFIC_VIOLATIONS = [
  { id: 'speeding', label: 'سرعة / Speeding' },
  { id: 'wrong_way', label: 'عكس سير / Wrong-way Driving' },
  { id: 'reckless', label: 'القيادة بتهور / Reckless Driving' },
  { id: 'unfasten_belt', label: 'عدم ربط حزام الأمان / Unfasten Belt' },
  { id: 'no_license_plate', label: 'عدم وجود لوحة مركبة / No License Plate' },
  { id: 'using_phone', label: 'استخدام الجوال أثناء القيادة / Using Phone While Driving' },
  { id: 'wrong_parking', label: 'وقوف خاطئ / Wrong Parking' },
  { id: 'improper_roundabout', label: 'عبور دوار بطريقة غير نظامية / Improper Use of Roundabout' },
  { id: 'no_driver_license', label: 'عدم وجود رخصة قيادة / No Driver License' },
  { id: 'no_headlights', label: 'عدم وجود أضواء أمامية أو خلفية / No Headlights or Taillights' },
  { id: 'red_light', label: 'قطع إشارة / Running a Red Light' },
];

export const MISCONDUCT_VIOLATIONS = [
  { id: 'fake_docs', label: 'وثائق مزورة / Fake Documents' },
  { id: 'theft', label: 'سرقة / Theft' },
  { id: 'vandalism', label: 'تخريب / Vandalism' },
  { id: 'assault', label: 'اعتداء / Assault' },
  { id: 'impersonation', label: 'انتحال شخصية / Impersonation' },
  { id: 'hit_run', label: 'صدم وهروب / Hit and Run' },
  { id: 'bribery', label: 'رشوة / Bribery' },
];

export const NONCOMPLIANCE_VIOLATIONS = [
  { id: 'not_following', label: 'عدم تجاوب / Not Following Instructions' },
  { id: 'unauthorized_guard', label: 'حراسة موقع لغير المصرح له / Unauthorized Guard' },
  { id: 'unauthorized_workshop', label: 'ورشة غير مصرح لها / Unauthorized Workshop' },
  { id: 'unauthorized_photo', label: 'تصوير بدون تصريح / Unauthorized Photography' },
  { id: 'pedestrian', label: 'تنقل على الأقدام / Pedestrian' },
  { id: 'trespasser', label: 'دخول عبر ثغرة / Trespasser' },
  { id: 'piggybacking', label: 'محاولة إدخال غير مصرح / Piggybacking' },
  { id: 'logistics', label: 'عدم الالتزام بإجراءات لوجستية / Logistics Non-Compliance' },
  { id: 'overload', label: 'حمولة زائدة / Overload' },
  { id: 'unauthorized_towing', label: 'سحب مركبة غير نظامي / Unauthorized Towing' },
  { id: 'unsecured_loading', label: 'عدم تأمين حمولة / Unsecured Loading' },
];
