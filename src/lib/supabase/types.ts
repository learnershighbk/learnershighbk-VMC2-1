export type Database = {
  public: {
    Tables: {
      example: {
        Row: {
          id: string;
          name: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          status: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      concerts: {
        Row: {
          id: string;
          title: string;
          artist: string;
          venue: string;
          event_date: string;
          ticket_open_date: string;
          genre: string;
          poster_image_url: string;
          description: string | null;
          is_available: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          artist: string;
          venue: string;
          event_date: string;
          ticket_open_date: string;
          genre: string;
          poster_image_url: string;
          description?: string | null;
          is_available?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          artist?: string;
          venue?: string;
          event_date?: string;
          ticket_open_date?: string;
          genre?: string;
          poster_image_url?: string;
          description?: string | null;
          is_available?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      concert_seats: {
        Row: {
          id: string;
          concert_id: string;
          seat_class: string;
          price: number;
          total_seats: number;
          available_seats: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          concert_id: string;
          seat_class: string;
          price: number;
          total_seats: number;
          available_seats: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          concert_id?: string;
          seat_class?: string;
          price?: number;
          total_seats?: number;
          available_seats?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      reservations: {
        Row: {
          id: string;
          user_id: string;
          concert_id: string;
          seat_class: string;
          seat_count: number;
          total_price: number;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          concert_id: string;
          seat_class: string;
          seat_count: number;
          total_price: number;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          concert_id?: string;
          seat_class?: string;
          seat_count?: number;
          total_price?: number;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      policy_documents: {
        Row: {
          id: string;
          slug: string;
          title: string;
          content_markdown: string;
          version: string;
          effective_from: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          content_markdown: string;
          version: string;
          effective_from?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          content_markdown?: string;
          version?: string;
          effective_from?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};

export type SupabaseUserMetadata = Record<string, unknown>;
