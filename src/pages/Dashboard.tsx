import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/ImageUpload";
import { ImageGrid } from "@/components/ImageGrid";
import { LogOut, User } from "lucide-react";
import { toast } from "sonner";

interface Image {
  id: string;
  filename: string;
  public_url: string;
  created_at: string;
}

const Dashboard = () => {
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const navigate = useNavigate();

  const fetchImages = async () => {
    try {
      const { data, error } = await supabase
        .from("images")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setImages(data || []);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch images");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      setUserEmail(session.user.email || "");
      fetchImages();
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            NotedMark
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              {userEmail}
            </div>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex flex-col items-center space-y-4">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold">Your Images</h2>
            <p className="text-muted-foreground">Upload and annotate your images</p>
          </div>
          <ImageUpload onUploadComplete={fetchImages} />
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <ImageGrid images={images} onDelete={fetchImages} />
        )}
      </main>
    </div>
  );
};

export default Dashboard;
