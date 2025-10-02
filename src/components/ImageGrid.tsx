import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Image {
  id: string;
  filename: string;
  public_url: string;
  created_at: string;
}

interface ImageGridProps {
  images: Image[];
  onDelete: () => void;
}

export const ImageGrid = ({ images, onDelete }: ImageGridProps) => {
  const navigate = useNavigate();

  const handleDelete = async (image: Image, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm("Are you sure you want to delete this image?")) return;

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("images")
        .remove([image.public_url.split("/images/")[1]]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from("images")
        .delete()
        .eq("id", image.id);

      if (dbError) throw dbError;

      toast.success("Image deleted successfully");
      onDelete();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete image");
    }
  };

  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <ImageIcon className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold text-foreground mb-2">No images yet</h3>
        <p className="text-muted-foreground">Upload your first image to get started</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {images.map((image) => (
        <Card
          key={image.id}
          className="group cursor-pointer overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02] duration-300"
          onClick={() => navigate(`/annotate/${image.id}`)}
        >
          <CardContent className="p-0">
            <div className="aspect-square relative overflow-hidden bg-muted">
              <img
                src={image.public_url}
                alt={image.filename}
                className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-300"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Button
                size="icon"
                variant="destructive"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                onClick={(e) => handleDelete(image, e)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4">
              <p className="text-sm font-medium truncate">{image.filename}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(image.created_at).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
