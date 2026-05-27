"use client";

import * as React from "react";
import { Camera, X, Check } from "lucide-react";

interface PhotoUploadProps {
  photos: {
    license: File | null;
    permit: File | null;
    vehicle: File | null;
    plate: File | null;
  };
  onChange: (key: string, file: File | null) => void;
}

interface UploadBoxProps {
  label: string;
  photoKey: string;
  file: File | null;
  onChange: (key: string, file: File | null) => void;
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({ photos, onChange }) => {
  return (
    <div className="w-full">
      <h3 className="text-sm font-bold text-gray-800 mb-3">4. الصور المرفقة / Attached Photos</h3>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <UploadBox
          label="صورة الرخصة / License Photo"
          photoKey="license"
          file={photos.license}
          onChange={onChange}
        />
        <UploadBox
          label="صورة التصريح / Permit Photo"
          photoKey="permit"
          file={photos.permit}
          onChange={onChange}
        />
        <UploadBox
          label="صورة المركبة / Vehicle Photo"
          photoKey="vehicle"
          file={photos.vehicle}
          onChange={onChange}
        />
        <UploadBox
          label="صورة اللوحة / Plate Photo"
          photoKey="plate"
          file={photos.plate}
          onChange={onChange}
        />
      </div>
    </div>
  );
};

const UploadBox: React.FC<UploadBoxProps> = ({ label, photoKey, file, onChange }) => {
  const [preview, setPreview] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Generate preview URL when file changes
  React.useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const compressImage = (originalFile: File): Promise<File> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(originalFile);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const maxDim = 800;
          let width = img.width;
          let height = img.height;

          // Maintain aspect ratio
          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], originalFile.name, {
                  type: "image/jpeg",
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                resolve(originalFile);
              }
            },
            "image/jpeg",
            0.8 // 80% Quality
          );
        };
      };
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Proactively compress the image on load for smaller PDFs and storage
    const compressedFile = await compressImage(selectedFile);
    onChange(photoKey, compressedFile);
  };

  const handleBoxClick = () => {
    if (!file) {
      fileInputRef.current?.click();
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering file picker click
    onChange(photoKey, null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div
        onClick={handleBoxClick}
        className={`relative w-full min-h-[120px] lg:min-h-[140px] rounded-xl border-2 transition-all duration-200 flex flex-col items-center justify-center cursor-pointer overflow-hidden ${
          file
            ? "border-success bg-success/5 hover:border-success-dark shadow-sm"
            : "border-dashed border-gray-300 bg-white hover:bg-gray-50 hover:border-accent"
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          capture="environment" // Auto opens camera on mobile devices
          className="hidden"
        />

        {preview ? (
          <>
            {/* Image Preview */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt={label}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
            
            {/* Corner Green Check Indicator (Top-Left) */}
            <div className="absolute top-2 left-2 bg-success text-white p-1.5 rounded-full shadow-md z-15">
              <Check className="h-3.5 w-3.5 stroke-[3]" />
            </div>

            {/* Remove Button (Top-Right) - Always visible for touch-friendliness */}
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 p-1.5 bg-danger hover:bg-danger-dark text-white rounded-full transition-transform hover:scale-110 shadow-md z-20 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          // Empty State
          <div className="flex flex-col items-center justify-center p-4 text-center">
            <Camera className="h-7 w-7 text-gray-400 mb-2 transition-transform duration-200 hover:scale-110" />
            <span className="text-xs font-semibold text-gray-700 leading-tight">{label}</span>
            <span className="text-[10px] text-gray-400 mt-1">اضغط للتصوير أو الرفع</span>
          </div>
        )}
      </div>
    </div>
  );
};
