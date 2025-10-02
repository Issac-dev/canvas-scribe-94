# Image Annotator - Setup Guide

A clean, responsive React app with Lovable Cloud (Supabase) for authentication, database, and storage. Users can sign up/sign in, upload images, annotate them with rectangles and text using Fabric.js, and save/export annotated images.

## 🚀 Features

- **User Authentication**: Sign up/sign in with email and password
- **Image Upload**: Upload images up to 50MB (JPEG, PNG, WebP, GIF)
- **Annotation Tools**: 
  - Draw rectangles with custom styling
  - Add and edit text labels
  - Move and scale objects
  - Clear all annotations
- **Save & Export**: 
  - Save annotated images back to cloud storage
  - Download as PNG with baked-in annotations
  - Track original images with metadata
- **Clean UI**: Modern, responsive design with gradient accents

## 🛠 Tech Stack

- **Frontend**: React 18, Vite, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Canvas**: Fabric.js v6
- **Backend**: Lovable Cloud (Supabase)
  - PostgreSQL database
  - Authentication
  - File Storage
- **Routing**: React Router v6

## 📦 Database Schema

### Images Table
```sql
CREATE TABLE public.images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  path TEXT NOT NULL,
  filename TEXT NOT NULL,
  public_url TEXT NOT NULL,
  original_image_id UUID REFERENCES public.images(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### Storage Bucket
- **Name**: `images`
- **Public**: Yes (for easy access)
- **Size Limit**: 50MB
- **Allowed Types**: JPEG, PNG, WebP, GIF

## 🔐 Row Level Security (RLS)

All tables have RLS enabled with policies that ensure users can only:
- View their own images
- Create their own images
- Update their own images
- Delete their own images

## 🚀 Local Development

### Prerequisites
- Node.js 18+ and npm

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd <project-name>
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Access the app**
   - Open http://localhost:8080
   - Sign up for a new account
   - Start uploading and annotating images!

## 🌐 Cloud Backend (Already Configured)

This project uses **Lovable Cloud**, which provides:
- ✅ Database automatically configured
- ✅ Authentication system ready
- ✅ File storage bucket created
- ✅ RLS policies in place
- ✅ Auto-confirm email enabled (for testing)

**No additional setup required!** The backend is ready to use.

## 📝 Environment Variables

The following environment variables are automatically configured by Lovable Cloud:
- `VITE_SUPABASE_URL` - Backend API URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` - Public anon key
- `VITE_SUPABASE_PROJECT_ID` - Project identifier

**Note**: These are managed automatically and don't need manual configuration.

## 🎨 How to Use

### 1. Authentication
- Navigate to `/auth`
- Sign up with email and password
- Or sign in if you already have an account

### 2. Upload Images
- Click the "Upload Image" button on the dashboard
- Select an image file (up to 50MB)
- Image appears in your gallery

### 3. Annotate Images
- Click any image thumbnail to open the annotation editor
- Use the toolbar to:
  - **Select**: Move and resize existing annotations
  - **Rectangle**: Draw rectangular boxes
  - **Text**: Add text labels (double-click to edit)
- Annotations use your brand colors (indigo/cyan)

### 4. Save & Export
- **Save**: Saves annotated image to your cloud storage with metadata
- **Download**: Downloads PNG with baked-in annotations
- **Clear**: Removes all annotations from canvas

## 🔒 Security Features

- Email/password authentication with secure hashing
- Row Level Security (RLS) ensures data isolation
- File uploads validated for type and size
- CORS configured for image loading
- All API calls require authentication

## 📱 Responsive Design

- Mobile-friendly interface
- Adaptive canvas sizing
- Touch-friendly controls
- Responsive grid layout for image gallery

## 🎯 Production Deployment

The app is ready to deploy! Simply:

1. **Connect your Git repository** (if not already connected)
2. **Click "Publish"** in Lovable
3. **Your app is live!** Share the URL

### Vercel Deployment (Alternative)

If you want to deploy to Vercel separately:

1. Push your code to GitHub
2. Import the repository in Vercel
3. Vercel will auto-detect the Vite config
4. Deploy! (Environment variables are already configured)

**Note**: Since the backend is Lovable Cloud, you don't need to configure any additional services.

## 📚 Key Files

- `src/pages/Auth.tsx` - Authentication page
- `src/pages/Dashboard.tsx` - Main dashboard with image gallery
- `src/pages/Annotate.tsx` - Annotation editor page
- `src/components/AnnotationCanvas.tsx` - Fabric.js canvas implementation
- `src/components/ImageUpload.tsx` - File upload component
- `src/components/ImageGrid.tsx` - Image gallery grid
- `src/integrations/supabase/client.ts` - Auto-generated backend client

## 🐛 Troubleshooting

### Images not loading in canvas
- Check that the storage bucket is public
- Verify CORS is configured (crossOrigin: "anonymous")
- Check browser console for errors

### Authentication issues
- Ensure auto-confirm email is enabled (already done)
- Check that RLS policies are active
- Verify user session in browser DevTools

### Upload failures
- Check file size (max 50MB)
- Verify file type is image/*
- Check storage quota in backend dashboard

## 🎨 Customization

### Colors
Edit `src/index.css` to change the design system:
- `--primary`: Main brand color (indigo)
- `--accent`: Accent color (cyan)
- `--gradient-primary`: Gradient backgrounds

### Canvas Settings
Modify `src/components/AnnotationCanvas.tsx`:
- Rectangle fill/stroke colors
- Text font and size
- Canvas dimensions

## 📄 License

This project was created with Lovable (https://lovable.dev)

## 🤝 Support

For issues or questions:
- Check the Lovable docs: https://docs.lovable.dev
- Visit the Lovable Discord community
- Review the console logs for debugging

---

**Built with ❤️ using Lovable Cloud**
