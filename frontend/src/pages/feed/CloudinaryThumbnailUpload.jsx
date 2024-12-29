"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Image } from "lucide-react";

const CLOUDINARY_SCRIPT_URL =
  "https://widget.cloudinary.com/v2.0/global/all.js";

const CloudinaryThumbnailUpload = ({
  onUploadSuccess,
  onUploadError,
  buttonText = "Upload Thumbnail",
  accept = "image/*",
}) => {
  const scriptLoaded = useRef(false);
  const widgetRef = useRef(null);

  useEffect(() => {
    if (window.cloudinary || scriptLoaded.current) {
      return;
    }

    const script = document.createElement("script");
    script.id = "cloudinary-upload-widget";
    script.src = CLOUDINARY_SCRIPT_URL;
    script.async = true;

    script.onload = () => {
      scriptLoaded.current = true;
      initializeWidget();
    };

    document.body.appendChild(script);

    return () => {
      if (widgetRef.current) {
        widgetRef.current.close();
      }
    };
  }, []);

  const initializeWidget = () => {
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
        cropping: true, // Bật chức năng crop
        croppingAspectRatio: 16 / 9, // Crop ảnh theo tỷ lệ 16:9
        folder: "thumbnails", // Lưu vào thư mục "thumbnails"
        resourceType: "image", // Chỉ upload ảnh
        clientAllowedFormats: ["png", "jpeg", "jpg"], // Giới hạn định dạng file
        maxFileSize: 2000000, // Giới hạn dung lượng file (2MB)
      },
      (error, result) => {
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

    initializeWidget();
    widgetRef.current?.open();
  };

  return (
    <Button onClick={uploadWidget} className="w-full" variant="outline">
      <Image className="h-4 w-4 mr-2" />
      {buttonText}
    </Button>
  );
};

export default CloudinaryThumbnailUpload;
