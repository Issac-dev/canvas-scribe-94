import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { AnnotationCanvas } from "@/components/AnnotationCanvas";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface ImageData {
  id: string;
  filename: string;
  public_url: string;
}

const Annotate = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [image, setImage] = useState<ImageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImage = async () => {
      if (!id) {
        navigate("/");
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate("/auth");
          return;
        }

        const { data, error } = await supabase
          .from("images")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        setImage(data);
      } catch (error: any) {
        toast.error(error.message || "Failed to load image");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchImage();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!image) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-xl font-bold">{image.filename}</h1>
              <p className="text-sm text-muted-foreground">Annotate your image</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <AnnotationCanvas
          imageUrl={image.public_url}
          imageId={image.id}
          onSave={() => {
            toast.success("Returning to dashboard...");
            setTimeout(() => navigate("/"), 1500);
          }}
        />
      </main>
    </div>
  );
};

export default Annotate;
