"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

const CLOUDINARY_SCRIPT_URL =
  "https://widget.cloudinary.com/v2.0/global/all.js";

const CloudinaryTrackUpload = ({
  onUploadSuccess,
  onUploadError,
  buttonText = "Upload File",
  accept = "audio/*,image/*",
}) => {
  // Sử dụng ref để theo dõi trạng thái script loaded
  const scriptLoaded = useRef(false);
  const widgetRef = useRef(null);

  useEffect(() => {
    // Kiểm tra nếu script đã được load
    if (window.cloudinary || scriptLoaded.current) {
      return;
    }

    const script = document.createElement("script");
    script.id = "cloudinary-upload-widget";
    script.src = CLOUDINARY_SCRIPT_URL;
    script.async = true;

    // Xử lý khi script load xong
    script.onload = () => {
      scriptLoaded.current = true;
      // Khởi tạo widget sau khi script đã load
      initializeWidget();
    };

    document.body.appendChild(script);

    return () => {
      // Cleanup: đóng widget nếu đang mở
      if (widgetRef.current) {
        widgetRef.current.close();
      }
    };
  }, []);

  const initializeWidget = () => {
    // Kiểm tra nếu widget đã được khởi tạo
    if (widgetRef.current) return;

    if (!window.cloudinary) {
      console.error("Cloudinary library not loaded yet");
      return;
    }

    widgetRef.current = window.cloudinary.createUploadWidget(
      {
        cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
        uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
        sources: ["local"],
      },
      function (error, result) {
        if (!error && result.event === "success") {
          onUploadSuccess?.({
            url: result.info.secure_url,
            publicId: result.info.public_id,
            name: result.info.original_filename,
            resourceType: result.info.resource_type,
          });
        } else if (error) {
          console.error("Upload error:", error);
          onUploadError?.(error.message || "Upload failed");
        }
      }
    );
  };

  const uploadWidget = () => {
    if (
      !import.meta.env.VITE_CLOUDINARY_CLOUD_NAME ||
      !import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
    ) {
      console.error("Missing Cloudinary configuration");
      onUploadError?.("Missing Cloudinary configuration");
      return;
    }

    // Khởi tạo widget nếu chưa được khởi tạo
    initializeWidget();

    // Mở widget đã được khởi tạo
    widgetRef.current?.open();
  };

  return (
    <Button onClick={uploadWidget} className="w-full" variant="outline">
      <Upload className="h-4 w-4 mr-2" />
      {buttonText}
    </Button>
  );
};

export default CloudinaryTrackUpload;
