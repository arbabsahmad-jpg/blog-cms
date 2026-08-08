// Hand-written to match supabase/schema.sql.
// Once the project is linked, you can replace this file with a generated
// version by running:
//   npx supabase gen types typescript --project-id <your-project-ref> > src/lib/types/database.types.ts

export type BlogStatus = "draft" | "scheduled" | "published";
export type CommentStatus = "pending" | "approved" | "rejected";
export type UserRole = "admin" | "author";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          avatar_url: string | null;
          bio: string | null;
          role: UserRole;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & {
          id: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["categories"]["Row"]> & {
          name: string;
          slug: string;
        };
        Update: Partial<Database["public"]["Tables"]["categories"]["Row"]>;
      };
      tags: {
        Row: {
          id: string;
          name: string;
          slug: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["tags"]["Row"]> & {
          name: string;
          slug: string;
        };
        Update: Partial<Database["public"]["Tables"]["tags"]["Row"]>;
      };
      blogs: {
        Row: {
          id: string;
          title: string;
          subtitle: string | null;
          slug: string;
          excerpt: string | null;
          content: Record<string, unknown>;
          content_html: string | null;
          featured_image: string | null;
          gallery_images: string[];
          video_url: string | null;
          author_id: string | null;
          category_id: string | null;
          status: BlogStatus;
          published_at: string | null;
          scheduled_at: string | null;
          meta_title: string | null;
          meta_description: string | null;
          keywords: string[];
          canonical_url: string | null;
          reading_time_minutes: number;
          is_featured: boolean;
          is_trending: boolean;
          allow_comments: boolean;
          views_count: number;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["blogs"]["Row"]> & {
          title: string;
          slug: string;
        };
        Update: Partial<Database["public"]["Tables"]["blogs"]["Row"]>;
      };
      blog_tags: {
        Row: { blog_id: string; tag_id: string };
        Insert: { blog_id: string; tag_id: string };
        Update: Partial<{ blog_id: string; tag_id: string }>;
      };
      blog_revisions: {
        Row: {
          id: string;
          blog_id: string;
          content: Record<string, unknown>;
          title: string;
          created_by: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["blog_revisions"]["Row"]> & {
          blog_id: string;
          content: Record<string, unknown>;
          title: string;
        };
        Update: Partial<Database["public"]["Tables"]["blog_revisions"]["Row"]>;
      };
      comments: {
        Row: {
          id: string;
          blog_id: string;
          parent_id: string | null;
          user_name: string;
          user_email: string;
          content: string;
          status: CommentStatus;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["comments"]["Row"]> & {
          blog_id: string;
          user_name: string;
          user_email: string;
          content: string;
        };
        Update: Partial<Database["public"]["Tables"]["comments"]["Row"]>;
      };
      subscribers: {
        Row: {
          id: string;
          email: string;
          status: string;
          subscribed_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["subscribers"]["Row"]> & {
          email: string;
        };
        Update: Partial<Database["public"]["Tables"]["subscribers"]["Row"]>;
      };
      media: {
        Row: {
          id: string;
          file_name: string;
          file_path: string;
          file_type: string;
          mime_type: string | null;
          folder: string;
          size_bytes: number;
          uploaded_by: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["media"]["Row"]> & {
          file_name: string;
          file_path: string;
          file_type: string;
        };
        Update: Partial<Database["public"]["Tables"]["media"]["Row"]>;
      };
      views: {
        Row: {
          id: string;
          blog_id: string;
          viewed_at: string;
          referrer: string | null;
          ip_hash: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["views"]["Row"]> & {
          blog_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["views"]["Row"]>;
      };
      settings: {
        Row: { key: string; value: Record<string, unknown>; updated_at: string };
        Insert: { key: string; value: Record<string, unknown> };
        Update: Partial<{ key: string; value: Record<string, unknown> }>;
      };
    };
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
      record_blog_view: {
        Args: { p_blog_id: string; p_referrer?: string; p_ip_hash?: string };
        Returns: void;
      };
    };
  };
}
