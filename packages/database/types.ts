// Types générés depuis Supabase
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          full_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          updated_at?: string;
        };
      };
      events: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          date_time: string;
          location: string;
          max_participants: number | null;
          current_participants: number;
          creator_id: string | null;
          image_url: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          date_time: string;
          location: string;
          max_participants?: number | null;
          current_participants?: number;
          creator_id?: string | null;
          image_url?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          date_time?: string;
          location?: string;
          max_participants?: number | null;
          current_participants?: number;
          creator_id?: string | null;
          image_url?: string | null;
          status?: string;
          updated_at?: string;
        };
      };
      event_participants: {
        Row: {
          id: string;
          event_id: string | null;
          user_id: string | null;
          status: string;
          joined_at: string;
        };
        Insert: {
          id?: string;
          event_id?: string | null;
          user_id?: string | null;
          status?: string;
          joined_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string | null;
          user_id?: string | null;
          status?: string;
          joined_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          content: string;
          sender_id: string | null;
          receiver_id: string | null;
          event_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          content: string;
          sender_id?: string | null;
          receiver_id?: string | null;
          event_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          content?: string;
          sender_id?: string | null;
          receiver_id?: string | null;
          event_id?: string | null;
          created_at?: string;
        };
      };
      marketplace_items: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          price: number | null;
          type: string;
          category: string | null;
          condition: string | null;
          seller_id: string | null;
          images: string[] | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          price?: number | null;
          type: string;
          category?: string | null;
          condition?: string | null;
          seller_id?: string | null;
          images?: string[] | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          price?: number | null;
          type?: string;
          category?: string | null;
          condition?: string | null;
          seller_id?: string | null;
          images?: string[] | null;
          status?: string;
          updated_at?: string;
        };
      };
    };
  };
}

// Types utilitaires pour les applications
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Event = Database['public']['Tables']['events']['Row'];
export type EventParticipant = Database['public']['Tables']['event_participants']['Row'];
export type Message = Database['public']['Tables']['messages']['Row'];
export type MarketplaceItem = Database['public']['Tables']['marketplace_items']['Row'];

export type NewProfile = Database['public']['Tables']['profiles']['Insert'];
export type NewEvent = Database['public']['Tables']['events']['Insert'];
export type NewMessage = Database['public']['Tables']['messages']['Insert'];
export type NewMarketplaceItem = Database['public']['Tables']['marketplace_items']['Insert'];