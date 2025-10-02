import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Upload, Loader2 } from "lucide-react";

interface ImageUploadProps {
  onUploadComplete: () => void;
}

export const ImageUpload = ({ onUploadComplete }: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (50MB)
    if (file.size > 52428800) {
      toast.error("File size must be less than 50MB");
      return;
    }

    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Upload to storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("images")
        .getPublicUrl(filePath);

      // Insert metadata into database
      const { error: dbError } = await supabase
        .from("images")
        .insert({
          user_id: user.id,
          path: filePath,
          filename: file.name,
          public_url: publicUrl,
        });

      if (dbError) throw dbError;

      toast.success("Image uploaded successfully!");
      onUploadComplete();
    } catch (error: any) {
      toast.error(error.message || "Failed to upload image");
    } finally {
      setUploading(false);
      // Reset the input
      e.target.value = "";
    }
  };

  return (
    <div className="flex items-center justify-center">
      <label htmlFor="image-upload">
        <Button
          type="button"
          size="lg"
          disabled={uploading}
          className="cursor-pointer bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity shadow-glow"
          onClick={() => document.getElementById("image-upload")?.click()}
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-5 w-5" />
              Upload Image
            </>
          )}
        </Button>
      </label>
      <input
        id="image-upload"
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
        disabled={uploading}
      />
    </div>
  );
};
