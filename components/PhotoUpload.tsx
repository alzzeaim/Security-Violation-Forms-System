"use client";

import * as React from "react";
import { Camera, X, Check, FolderOpen, Plus } from "lucide-react";

interface PhotoUploadProps {
  photos: {
    license: File | null;
    permit: File | null;
    vehicle: File | null;
    plate: File | null;
    id: File | null;
  };
  otherPhotos: { file: File; description: string }[];
  onChange: (key: string, file: File | null) => void;
  onOtherPhotosChange: (files: { file: File; description: string }[]) => void;
}

interface UploadBoxProps {
  label: string;
  photoKey: string;
  file: File | null;
  onChange: (key: string, file: File | null) => void;
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({ photos, otherPhotos, onChange, onOtherPhotosChange }) => {
  return (
    <div className="w-full space-y-6">
      <h3 className="text-sm font-bold text-gray-800 mb-3">4. الصور المرفقة / Attached Photos</h3>
      
      {/* Main photo grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <UploadBox
          label="صورة الرخصة / License"
          photoKey="photo_license"
          file={photos.license}
          onChange={onChange}
        />
        <UploadBox
          label="صورة التصريح / Permit"
          photoKey="photo_permit"
          file={photos.permit}
          onChange={onChange}
        />
        <UploadBox
          label="صورة المركبة / Vehicle"
          photoKey="photo_vehicle"
          file={photos.vehicle}
          onChange={onChange}
        />
        <UploadBox
          label="صورة اللوحة / Plate"
          photoKey="photo_plate"
          file={photos.plate}
          onChange={onChange}
        />
        <UploadBox
          label="صورة الهوية / ID Photo"
          photoKey="photo_id"
          file={photos.id}
          onChange={onChange}
        />
      </div>

      {/* Other Photos - Unlimited */}
      <OtherPhotosSection
        files={otherPhotos}
        onFilesChange={onOtherPhotosChange}
      />
    </div>
  );
};

// ─── Source Selection Popup ──────────────────────────────────────
interface SourcePopupProps {
  onSelectCamera: () => void;
  onSelectFiles: () => void;
  onClose: () => void;
}

const SourcePopup: React.FC<SourcePopupProps> = ({ onSelectCamera, onSelectFiles, onClose }) => {
  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      {/* Popup */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs p-5 space-y-4 animate-fade-in">
          <h4 className="text-sm font-bold text-gray-800 text-center">اختر مصدر الصورة / Choose Source</h4>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onSelectCamera}
              className="flex flex-col items-center gap-2 p-4 border-2 border-dashed border-accent rounded-xl bg-accent/5 hover:bg-accent/15 transition-all cursor-pointer"
            >
              <Camera className="h-8 w-8 text-accent-dark" />
              <span className="text-xs font-bold text-gray-700">الكاميرا / Camera</span>
            </button>
            <button
              type="button"
              onClick={onSelectFiles}
              className="flex flex-col items-center gap-2 p-4 border-2 border-dashed border-primary rounded-xl bg-primary/5 hover:bg-primary/15 transition-all cursor-pointer"
            >
              <FolderOpen className="h-8 w-8 text-primary" />
              <span className="text-xs font-bold text-gray-700">الملفات / Files</span>
            </button>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-full text-center text-xs text-gray-400 hover:text-gray-600 font-semibold py-2 cursor-pointer transition-colors"
          >
            إلغاء / Cancel
          </button>
        </div>
      </div>
    </>
  );
};

// ─── Single Upload Box ──────────────────────────────────────────
const UploadBox: React.FC<UploadBoxProps> = ({ label, photoKey, file, onChange }) => {
  const [preview, setPreview] = React.useState<string | null>(null);
  const [showSourcePopup, setShowSourcePopup] = React.useState(false);
  const cameraInputRef = React.useRef<HTMLInputElement>(null);
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

    const compressedFile = await compressImage(selectedFile);
    onChange(photoKey, compressedFile);
    setShowSourcePopup(false);
  };

  const handleBoxClick = () => {
    if (!file) {
      setShowSourcePopup(true);
    }
  };

  const handleSelectCamera = () => {
    setShowSourcePopup(false);
    cameraInputRef.current?.click();
  };

  const handleSelectFiles = () => {
    setShowSourcePopup(false);
    fileInputRef.current?.click();
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(photoKey, null);
    if (cameraInputRef.current) cameraInputRef.current.value = "";
    if (fileInputRef.current) fileInputRef.current.value = "";
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
        {/* Camera input */}
        <input
          type="file"
          ref={cameraInputRef}
          onChange={handleFileChange}
          accept="image/*"
          capture="environment"
          className="hidden"
        />
        {/* File picker input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
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

      {/* Source Selection Popup */}
      {showSourcePopup && (
        <SourcePopup
          onSelectCamera={handleSelectCamera}
          onSelectFiles={handleSelectFiles}
          onClose={() => setShowSourcePopup(false)}
        />
      )}
    </div>
  );
};

// ─── Other Photos Section (Unlimited) ───────────────────────────
interface OtherPhotosSectionProps {
  files: { file: File; description: string }[];
  onFilesChange: (files: { file: File; description: string }[]) => void;
}

const OtherPhotosSection: React.FC<OtherPhotosSectionProps> = ({ files, onFilesChange }) => {
  const [showSourcePopup, setShowSourcePopup] = React.useState(false);
  const cameraInputRef = React.useRef<HTMLInputElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

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
                resolve(new File([blob], originalFile.name, { type: "image/jpeg", lastModified: Date.now() }));
              } else {
                resolve(originalFile);
              }
            },
            "image/jpeg",
            0.8
          );
        };
      };
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    const newFiles: { file: File; description: string }[] = [];
    for (let i = 0; i < selectedFiles.length; i++) {
      const compressed = await compressImage(selectedFiles[i]);
      newFiles.push({ file: compressed, description: "" });
    }

    onFilesChange([...files, ...newFiles]);
    setShowSourcePopup(false);
    // Reset inputs
    if (cameraInputRef.current) cameraInputRef.current.value = "";
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveFile = (index: number) => {
    const updated = files.filter((_, i) => i !== index);
    onFilesChange(updated);
  };

  const handleDescriptionChange = (index: number, desc: string) => {
    const updated = [...files];
    updated[index].description = desc;
    onFilesChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-gray-700">صور أخرى / Other Photos</h4>
        <span className="text-[10px] text-gray-400">{files.length} صورة مرفقة</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Preview existing "other" photos */}
        {files.map((item, idx) => (
          <OtherPhotoItem 
            key={idx} 
            item={item} 
            index={idx} 
            onRemove={handleRemoveFile} 
            onDescriptionChange={handleDescriptionChange} 
          />
        ))}

        {/* Add New Photo Button */}
        <button
          type="button"
          onClick={() => setShowSourcePopup(true)}
          className="min-h-[100px] rounded-xl border-2 border-dashed border-gray-300 bg-white hover:bg-gray-50 hover:border-accent flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all duration-200"
        >
          <div className="p-2 bg-accent/10 rounded-full">
            <Plus className="h-5 w-5 text-accent-dark" />
          </div>
          <span className="text-[10px] font-semibold text-gray-500">إضافة صورة</span>
        </button>
      </div>

      {/* Hidden inputs */}
      <input
        type="file"
        ref={cameraInputRef}
        onChange={handleFileChange}
        accept="image/*"
        capture="environment"
        className="hidden"
      />
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        multiple
        className="hidden"
      />

      {/* Source Selection Popup */}
      {showSourcePopup && (
        <SourcePopup
          onSelectCamera={() => {
            setShowSourcePopup(false);
            cameraInputRef.current?.click();
          }}
          onSelectFiles={() => {
            setShowSourcePopup(false);
            fileInputRef.current?.click();
          }}
          onClose={() => setShowSourcePopup(false)}
        />
      )}
    </div>
  );
};

// ─── Single Other Photo Item ────────────────────────────────────
interface OtherPhotoItemProps {
  item: { file: File; description: string };
  index: number;
  onRemove: (index: number) => void;
  onDescriptionChange: (index: number, desc: string) => void;
}

const OtherPhotoItem: React.FC<OtherPhotoItemProps> = ({ item, index, onRemove, onDescriptionChange }) => {
  const [preview, setPreview] = React.useState<string | null>(null);

  React.useEffect(() => {
    const objectUrl = URL.createObjectURL(item.file);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [item.file]);

  return (
    <div className="flex flex-col gap-2 group">
      <div className="relative min-h-[100px] rounded-xl border-2 border-success bg-success/5 overflow-hidden">
        {preview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt={`صورة إضافية ${index + 1}`}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        {/* Index badge */}
        <div className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md z-10">
          {index + 1}
        </div>
        {/* Remove button */}
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="absolute top-1 right-1 p-1 bg-danger hover:bg-danger-dark text-white rounded-full shadow-md z-20 cursor-pointer transition-transform hover:scale-110"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      
      {/* Description Input */}
      <input
        type="text"
        placeholder="نص توضيحي للصورة..."
        value={item.description}
        onChange={(e) => onDescriptionChange(index, e.target.value)}
        className="w-full text-xs p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors bg-white shadow-sm"
      />
    </div>
  );
};
