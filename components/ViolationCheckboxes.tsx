"use client";

import * as React from "react";
import { ChevronDown, AlertCircle, ShieldAlert, Ban } from "lucide-react";
import { Checkbox } from "./ui/Checkbox";
import { Input } from "./ui/Input";
import { TRAFFIC_VIOLATIONS, MISCONDUCT_VIOLATIONS, NONCOMPLIANCE_VIOLATIONS } from "../types/violation";

interface ViolationCheckboxesProps {
  trafficViolations: string[];
  misconductViolations: string[];
  noncomplianceViolations: string[];
  trafficOther: string;
  misconductOther: string;
  noncomplianceOther: string;
  onChange: (field: string, value: string[] | string) => void;
}

export const ViolationCheckboxes: React.FC<ViolationCheckboxesProps> = ({
  trafficViolations,
  misconductViolations,
  noncomplianceViolations,
  trafficOther,
  misconductOther,
  noncomplianceOther,
  onChange,
}) => {
  const [activeSection, setActiveSection] = React.useState<string | null>(null);

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
  };

  const handleCheckboxChange = (
    field: string,
    currentList: string[],
    id: string,
    checked: boolean
  ) => {
    let updatedList: string[];
    if (checked) {
      updatedList = [...currentList, id];
    } else {
      updatedList = currentList.filter((item) => item !== id);
    }
    onChange(field, updatedList);
  };

  return (
    <div className="w-full space-y-4">
      <h3 className="text-sm font-bold text-gray-800 mb-1">3. تصنيف ونوع المخالفة / Violation Category</h3>

      {/* SECTION 1: Traffic Violations (Blue Border) */}
      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
        <button
          type="button"
          onClick={() => toggleSection("traffic")}
          className="w-full px-5 py-4 flex items-center justify-between text-right font-bold transition-colors hover:bg-gray-50 border-r-4 border-blue-600 cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            <span className="text-sm text-gray-900">مخالفة مرورية / Traffic Violation</span>
            {trafficViolations.length > 0 && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full mr-2">
                {trafficViolations.length} محددة
              </span>
            )}
          </div>
          <ChevronDown
            className={`h-5 w-5 text-gray-400 transition-transform duration-250 ${
              activeSection === "traffic" ? "transform rotate-180" : ""
            }`}
          />
        </button>

        {activeSection === "traffic" && (
          <div className="px-5 py-4 bg-gray-50/50 border-t border-gray-100 space-y-4 animate-slide-down">
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              {TRAFFIC_VIOLATIONS.map((violation) => (
                <div
                  key={violation.id}
                  className="min-h-[44px] flex items-center hover:bg-gray-100/50 px-2 rounded-lg transition-colors"
                >
                  <Checkbox
                    id={`traffic-${violation.id}`}
                    label={violation.label}
                    checked={trafficViolations.includes(violation.id)}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange("traffic_violations", trafficViolations, violation.id, checked)
                    }
                  />
                </div>
              ))}
            </div>
            <div className="pt-2 border-t border-gray-200/50">
              <Input
                placeholder="أخرى (يرجى التحديد) / Other (please specify)"
                value={trafficOther}
                onChange={(e) => onChange("traffic_other", e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: Misconduct Violations (Red Border) */}
      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
        <button
          type="button"
          onClick={() => toggleSection("misconduct")}
          className="w-full px-5 py-4 flex items-center justify-between text-right font-bold transition-colors hover:bg-gray-50 border-r-4 border-danger cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-danger" />
            <span className="text-sm text-gray-900">مخالفة مسلكية وجنائية / Misconduct & Criminal</span>
            {misconductViolations.length > 0 && (
              <span className="bg-danger/10 text-danger text-xs px-2.5 py-0.5 rounded-full mr-2">
                {misconductViolations.length} محددة
              </span>
            )}
          </div>
          <ChevronDown
            className={`h-5 w-5 text-gray-400 transition-transform duration-250 ${
              activeSection === "misconduct" ? "transform rotate-180" : ""
            }`}
          />
        </button>

        {activeSection === "misconduct" && (
          <div className="px-5 py-4 bg-gray-50/50 border-t border-gray-100 space-y-4 animate-slide-down">
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              {MISCONDUCT_VIOLATIONS.map((violation) => (
                <div
                  key={violation.id}
                  className="min-h-[44px] flex items-center hover:bg-gray-100/50 px-2 rounded-lg transition-colors"
                >
                  <Checkbox
                    id={`misconduct-${violation.id}`}
                    label={violation.label}
                    checked={misconductViolations.includes(violation.id)}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange(
                        "misconduct_violations",
                        misconductViolations,
                        violation.id,
                        checked
                      )
                    }
                  />
                </div>
              ))}
            </div>
            <div className="pt-2 border-t border-gray-200/50">
              <Input
                placeholder="أخرى (يرجى التحديد) / Other (please specify)"
                value={misconductOther}
                onChange={(e) => onChange("misconduct_other", e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      {/* SECTION 3: Non-Compliance Violations (Orange Border) */}
      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
        <button
          type="button"
          onClick={() => toggleSection("noncompliance")}
          className="w-full px-5 py-4 flex items-center justify-between text-right font-bold transition-colors hover:bg-gray-50 border-r-4 border-orange-500 cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Ban className="h-5 w-5 text-orange-500" />
            <span className="text-sm text-gray-900">عدم الالتزام بأنظمة القدية / Site Non-Compliance</span>
            {noncomplianceViolations.length > 0 && (
              <span className="bg-orange-100 text-orange-800 text-xs px-2.5 py-0.5 rounded-full mr-2">
                {noncomplianceViolations.length} محددة
              </span>
            )}
          </div>
          <ChevronDown
            className={`h-5 w-5 text-gray-400 transition-transform duration-250 ${
              activeSection === "noncompliance" ? "transform rotate-180" : ""
            }`}
          />
        </button>

        {activeSection === "noncompliance" && (
          <div className="px-5 py-4 bg-gray-50/50 border-t border-gray-100 space-y-4 animate-slide-down">
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              {NONCOMPLIANCE_VIOLATIONS.map((violation) => (
                <div
                  key={violation.id}
                  className="min-h-[44px] flex items-center hover:bg-gray-100/50 px-2 rounded-lg transition-colors"
                >
                  <Checkbox
                    id={`noncompliance-${violation.id}`}
                    label={violation.label}
                    checked={noncomplianceViolations.includes(violation.id)}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange(
                        "noncompliance_violations",
                        noncomplianceViolations,
                        violation.id,
                        checked
                      )
                    }
                  />
                </div>
              ))}
            </div>
            <div className="pt-2 border-t border-gray-200/50">
              <Input
                placeholder="أخرى (يرجى التحديد) / Other (please specify)"
                value={noncomplianceOther}
                onChange={(e) => onChange("noncompliance_other", e.target.value)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
