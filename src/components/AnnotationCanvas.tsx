import { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas, Rect, IText, Image as FabricImage } from "fabric";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { 
  Square, 
  Type, 
  Download, 
  Save, 
  Trash2, 
  MousePointer,
  Loader2
} from "lucide-react";

interface AnnotationCanvasProps {
  imageUrl: string;
  imageId: string;
  onSave: () => void;
}

export const AnnotationCanvas = ({ imageUrl, imageId, onSave }: AnnotationCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [activeTool, setActiveTool] = useState<"select" | "rectangle" | "text">("select");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const canvas = new FabricCanvas(canvasRef.current, {
      width: Math.min(800, container.clientWidth - 32),
      height: 600,
      backgroundColor: "#ffffff",
    });

    // Load the image
    FabricImage.fromURL(imageUrl, { crossOrigin: "anonymous" }).then((img) => {
      if (!img) {
        toast.error("Failed to load image");
        return;
      }

      const canvasWidth = canvas.getWidth();
      const canvasHeight = canvas.getHeight();
      
      const scale = Math.min(
        canvasWidth / (img.width || 1),
        canvasHeight / (img.height || 1)
      );

      img.set({
        scaleX: scale,
        scaleY: scale,
        selectable: false,
        evented: false,
      });

      canvas.backgroundImage = img;
      canvas.renderAll();
    });

    setFabricCanvas(canvas);

    return () => {
      canvas.dispose();
    };
  }, [imageUrl]);

  const handleToolClick = (tool: typeof activeTool) => {
    if (!fabricCanvas) return;
    
    setActiveTool(tool);
    fabricCanvas.discardActiveObject();
    fabricCanvas.renderAll();

    if (tool === "rectangle") {
      const rect = new Rect({
        left: 100,
        top: 100,
        fill: "rgba(79, 70, 229, 0.3)",
        stroke: "#4F46E5",
        strokeWidth: 2,
        width: 150,
        height: 100,
      });
      fabricCanvas.add(rect);
      fabricCanvas.setActiveObject(rect);
      fabricCanvas.renderAll();
    } else if (tool === "text") {
      const text = new IText("Double-click to edit", {
        left: 100,
        top: 100,
        fill: "#4F46E5",
        fontSize: 20,
        fontFamily: "Arial",
      });
      fabricCanvas.add(text);
      fabricCanvas.setActiveObject(text);
      fabricCanvas.renderAll();
    }
  };

  const handleClear = () => {
    if (!fabricCanvas) return;
    
    const objects = fabricCanvas.getObjects();
    objects.forEach((obj) => {
      if (obj !== fabricCanvas.backgroundImage) {
        fabricCanvas.remove(obj);
      }
    });
    fabricCanvas.renderAll();
    toast.success("Annotations cleared");
  };

  const handleDownload = () => {
    if (!fabricCanvas) return;

    const dataURL = fabricCanvas.toDataURL({
      format: "png",
      quality: 1,
      multiplier: 2,
    });

    const link = document.createElement("a");
    link.download = `annotated-${Date.now()}.png`;
    link.href = dataURL;
    link.click();

    toast.success("Image downloaded!");
  };

  const handleSave = async () => {
    if (!fabricCanvas) return;

    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Convert canvas to blob
      const dataURL = fabricCanvas.toDataURL({
        format: "png",
        quality: 1,
        multiplier: 2,
      });

      const response = await fetch(dataURL);
      const blob = await response.blob();

      // Upload to storage
      const fileName = `annotated-${Date.now()}.png`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(filePath, blob, {
          contentType: "image/png",
          cacheControl: "3600",
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("images")
        .getPublicUrl(filePath);

      // Insert into database
      const { error: dbError } = await supabase
        .from("images")
        .insert({
          user_id: user.id,
          path: filePath,
          filename: fileName,
          public_url: publicUrl,
          original_image_id: imageId,
        });

      if (dbError) throw dbError;

      toast.success("Annotated image saved!");
      onSave();
    } catch (error: any) {
      toast.error(error.message || "Failed to save image");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={activeTool === "select" ? "default" : "outline"}
            size="sm"
            onClick={() => handleToolClick("select")}
          >
            <MousePointer className="h-4 w-4 mr-2" />
            Select
          </Button>
          <Button
            variant={activeTool === "rectangle" ? "default" : "outline"}
            size="sm"
            onClick={() => handleToolClick("rectangle")}
          >
            <Square className="h-4 w-4 mr-2" />
            Rectangle
          </Button>
          <Button
            variant={activeTool === "text" ? "default" : "outline"}
            size="sm"
            onClick={() => handleToolClick("text")}
          >
            <Type className="h-4 w-4 mr-2" />
            Text
          </Button>
          <div className="flex-1" />
          <Button
            variant="outline"
            size="sm"
            onClick={handleClear}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-primary to-accent"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save
          </Button>
        </div>
      </Card>

      <div ref={containerRef} className="flex justify-center">
        <Card className="p-4 shadow-lg">
          <canvas ref={canvasRef} className="border border-border rounded" />
        </Card>
      </div>
    </div>
  );
};
