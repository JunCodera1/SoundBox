"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PlusCircle } from "lucide-react";
import { toast } from "sonner";
import CloudinaryThumbnailUpload from "./CloudinaryThumbnailUpload";
import CloudinaryTrackUpload from "./CloudinaryTrackUpload";
import { makeAuthenticatedPOSTRequest } from "@/utils/serverHelper";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

export function CreatePostModal({ onPostCreated }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [author, setAuthor] = useState(null);
  const navigate = useNavigate(); // Hook để điều hướng

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    trackUrl: "",
    trackName: "",
    thumbnailUrl: "",
    thumbnailName: "",
    author: "",
  });

  useEffect(() => {
    try {
      const token = Cookies.get("token");
      if (!token) throw new Error("Token not found");
      const decoded = jwtDecode(token);
      if (!decoded.identifier) throw new Error("Invalid token");
      setAuthor(decoded.identifier);
    } catch (error) {
      console.error("Authentication error:", error);
      toast.error("You need to log in to create a post.");
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    setFormData((prev) => ({ ...prev, author }));
  }, [author]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!formData.trackUrl) {
        throw new Error("Please upload an audio track");
      }

      const response = await makeAuthenticatedPOSTRequest(
        "/post/create",
        formData
      );
      console.log("Response:", response);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create post");
      }

      toast.success("Post created successfully!");
      onPostCreated?.(data);
      setIsOpen(false);

      // Reset form but keep author
      setFormData({
        title: "",
        description: "",
        trackUrl: "",
        trackName: "",
        thumbnailUrl: "",
        thumbnailName: "",
        author,
      });
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.message || "Failed to create post");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrackUpload = (result) => {
    setFormData((prev) => ({
      ...prev,
      trackUrl: result.url,
      trackName: result.name,
    }));
    toast.success("Audio track uploaded successfully!");
  };

  const handleThumbnailUpload = (result) => {
    setFormData((prev) => ({
      ...prev,
      thumbnailUrl: result.url,
      thumbnailName: result.name,
    }));
    toast.success("Thumbnail uploaded successfully!");
  };

  const handleUploadError = (error) => {
    toast.error(error || "Upload failed");
  };

  if (!author) {
    return null; // Không hiển thị modal khi chưa có thông tin người dùng
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <PlusCircle className="h-5 w-5" />
          Create Post
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            Create a New Post
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-foreground">
              Title
            </Label>
            <Input
              className="text-black"
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="Enter post title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-foreground">
              Description
            </Label>
            <Textarea
              className="text-black"
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Write something about your post..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Audio Track (Required)</Label>
            <div className="flex flex-col gap-2">
              <CloudinaryTrackUpload
                onUploadSuccess={handleTrackUpload}
                onUploadError={handleUploadError}
                buttonText={formData.trackName || "Upload Audio"}
                accept="audio/*"
              />
              {formData.trackName && (
                <div className="text-sm text-muted-foreground">
                  Selected: {formData.trackName}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Thumbnail (Optional)</Label>
            <div className="flex flex-col gap-2">
              <CloudinaryThumbnailUpload
                onUploadSuccess={handleThumbnailUpload}
                onUploadError={handleUploadError}
                buttonText={formData.thumbnailName || "Upload Thumbnail"}
                accept="image/*"
              />
              {formData.thumbnailUrl && (
                <img
                  src={formData.thumbnailUrl}
                  alt="Thumbnail preview"
                  className="mt-2 w-20 h-20 object-cover rounded-md"
                />
              )}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !formData.trackUrl}
          >
            {isLoading ? "Creating Post..." : "Create Post"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
