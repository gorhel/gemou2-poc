// Types générés depuis Supabase - Version complète avec toutes les migrations
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          full_name: string | null;
          first_name: string | null;
          last_name: string | null;
          city: string | null;
          avatar_url: string | null;
          bio: string | null;
          level: number;
          favorite_games: any[];
          profile_photo_url: string | null;
          email: string | null;
          password: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          full_name?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          city?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          level?: number;
          favorite_games?: any[];
          profile_photo_url?: string | null;
          email?: string | null;
          password?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string | null;
          full_name?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          city?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          level?: number;
          favorite_games?: any[];
          profile_photo_url?: string | null;
          email?: string | null;
          password?: string | null;
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
          capacity: number | null;
          price: number | null;
          visibility: string;
          latitude: number | null;
          longitude: number | null;
          game_types: any[];
          event_photo_url: string | null;
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
          capacity?: number | null;
          price?: number | null;
          visibility?: string;
          latitude?: number | null;
          longitude?: number | null;
          game_types?: any[];
          event_photo_url?: string | null;
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
          capacity?: number | null;
          price?: number | null;
          visibility?: string;
          latitude?: number | null;
          longitude?: number | null;
          game_types?: any[];
          event_photo_url?: string | null;
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
      event_applications: {
        Row: {
          id: string;
          event_id: string | null;
          user_id: string | null;
          status: string;
          answers: any;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id?: string | null;
          user_id?: string | null;
          status?: string;
          answers?: any;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string | null;
          user_id?: string | null;
          status?: string;
          answers?: any;
          created_at?: string;
        };
      };
      conversations: {
        Row: {
          id: string;
          type: string;
          event_id: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          type: string;
          event_id?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          type?: string;
          event_id?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
      };
      conversation_members: {
        Row: {
          conversation_id: string;
          user_id: string;
          role: string;
          joined_at: string;
        };
        Insert: {
          conversation_id: string;
          user_id: string;
          role?: string;
          joined_at?: string;
        };
        Update: {
          conversation_id?: string;
          user_id?: string;
          role?: string;
          joined_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string | null;
          sender_id: string | null;
          content: string | null;
          attachments: any[];
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id?: string | null;
          sender_id?: string | null;
          content?: string | null;
          attachments?: any[];
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string | null;
          sender_id?: string | null;
          content?: string | null;
          attachments?: any[];
          created_at?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          subject_type: string;
          subject_id: string;
          author_id: string | null;
          rating: number | null;
          comment: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          subject_type: string;
          subject_id: string;
          author_id?: string | null;
          rating?: number | null;
          comment?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          subject_type?: string;
          subject_id?: string;
          author_id?: string | null;
          rating?: number | null;
          comment?: string | null;
          created_at?: string;
        };
      };
      games: {
        Row: {
          id: string;
          bgg_id: string | null;
          name: string;
          description: string | null;
          min_players: number | null;
          max_players: number | null;
          duration_min: number | null;
          photo_url: string | null;
          data: any;
        };
        Insert: {
          id?: string;
          bgg_id?: string | null;
          name: string;
          description?: string | null;
          min_players?: number | null;
          max_players?: number | null;
          duration_min?: number | null;
          photo_url?: string | null;
          data?: any;
        };
        Update: {
          id?: string;
          bgg_id?: string | null;
          name?: string;
          description?: string | null;
          min_players?: number | null;
          max_players?: number | null;
          duration_min?: number | null;
          photo_url?: string | null;
          data?: any;
        };
      };
      user_games: {
        Row: {
          user_id: string;
          game_id: string;
          state: string;
          condition: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          game_id: string;
          state?: string;
          condition?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          game_id?: string;
          state?: string;
          condition?: string | null;
          notes?: string | null;
          created_at?: string;
        };
      };
      contacts: {
        Row: {
          user_id: string;
          contact_id: string;
          status: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          contact_id: string;
          status?: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          contact_id?: string;
          status?: string;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          payload: any;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          payload: any;
          read_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          payload?: any;
          read_at?: string | null;
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
          condition: string | null;
          seller_id: string | null;
          status: string;
          images: string[];
          location: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          price?: number | null;
          type: string;
          condition?: string | null;
          seller_id?: string | null;
          status?: string;
          images?: string[];
          location?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          price?: number | null;
          type?: string;
          condition?: string | null;
          seller_id?: string | null;
          status?: string;
          images?: string[];
          location?: string | null;
          updated_at?: string;
        };
      };
      tags: {
        Row: {
          id: string;
          name: string;
        };
        Insert: {
          id?: string;
          name: string;
        };
        Update: {
          id?: string;
          name?: string;
        };
      };
      user_tags: {
        Row: {
          id: string;
          created_at: string;
          user_id: string | null;
          tag_id: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          user_id?: string | null;
          tag_id?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          user_id?: string | null;
          tag_id?: string | null;
        };
      };
      event_tags: {
        Row: {
          event_id: string;
          tag_id: string;
        };
        Insert: {
          event_id: string;
          tag_id: string;
        };
        Update: {
          event_id?: string;
          tag_id?: string;
        };
      };
      event_games: {
        Row: {
          event_id: string;
          game_id: string;
        };
        Insert: {
          event_id: string;
          game_id: string;
        };
        Update: {
          event_id?: string;
          game_id?: string;
        };
      };
    };
  };
}

// Types utilitaires pour les applications
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Event = Database['public']['Tables']['events']['Row'];
export type EventParticipant = Database['public']['Tables']['event_participants']['Row'];
export type EventApplication = Database['public']['Tables']['event_applications']['Row'];
export type Conversation = Database['public']['Tables']['conversations']['Row'];
export type ConversationMember = Database['public']['Tables']['conversation_members']['Row'];
export type Message = Database['public']['Tables']['messages']['Row'];
export type Review = Database['public']['Tables']['reviews']['Row'];
export type Game = Database['public']['Tables']['games']['Row'];
export type UserGame = Database['public']['Tables']['user_games']['Row'];
export type Contact = Database['public']['Tables']['contacts']['Row'];
export type Notification = Database['public']['Tables']['notifications']['Row'];
export type MarketplaceItem = Database['public']['Tables']['marketplace_items']['Row'];
export type Tag = Database['public']['Tables']['tags']['Row'];
export type UserTag = Database['public']['Tables']['user_tags']['Row'];
export type EventTag = Database['public']['Tables']['event_tags']['Row'];
export type EventGame = Database['public']['Tables']['event_games']['Row'];

// Types pour les insertions
export type NewProfile = Database['public']['Tables']['profiles']['Insert'];
export type NewEvent = Database['public']['Tables']['events']['Insert'];
export type NewEventApplication = Database['public']['Tables']['event_applications']['Insert'];
export type NewConversation = Database['public']['Tables']['conversations']['Insert'];
export type NewConversationMember = Database['public']['Tables']['conversation_members']['Insert'];
export type NewMessage = Database['public']['Tables']['messages']['Insert'];
export type NewReview = Database['public']['Tables']['reviews']['Insert'];
export type NewGame = Database['public']['Tables']['games']['Insert'];
export type NewUserGame = Database['public']['Tables']['user_games']['Insert'];
export type NewContact = Database['public']['Tables']['contacts']['Insert'];
export type NewNotification = Database['public']['Tables']['notifications']['Insert'];
export type NewMarketplaceItem = Database['public']['Tables']['marketplace_items']['Insert'];
export type NewTag = Database['public']['Tables']['tags']['Insert'];
export type NewUserTag = Database['public']['Tables']['user_tags']['Insert'];
export type NewEventTag = Database['public']['Tables']['event_tags']['Insert'];
export type NewEventGame = Database['public']['Tables']['event_games']['Insert'];

// Types pour les mises à jour
export type UpdateProfile = Database['public']['Tables']['profiles']['Update'];
export type UpdateEvent = Database['public']['Tables']['events']['Update'];
export type UpdateEventApplication = Database['public']['Tables']['event_applications']['Update'];
export type UpdateConversation = Database['public']['Tables']['conversations']['Update'];
export type UpdateConversationMember = Database['public']['Tables']['conversation_members']['Update'];
export type UpdateMessage = Database['public']['Tables']['messages']['Update'];
export type UpdateReview = Database['public']['Tables']['reviews']['Update'];
export type UpdateGame = Database['public']['Tables']['games']['Update'];
export type UpdateUserGame = Database['public']['Tables']['user_games']['Update'];
export type UpdateContact = Database['public']['Tables']['contacts']['Update'];
export type UpdateNotification = Database['public']['Tables']['notifications']['Update'];
export type UpdateMarketplaceItem = Database['public']['Tables']['marketplace_items']['Update'];
export type UpdateTag = Database['public']['Tables']['tags']['Update'];
export type UpdateUserTag = Database['public']['Tables']['user_tags']['Update'];
export type UpdateEventTag = Database['public']['Tables']['event_tags']['Update'];
export type UpdateEventGame = Database['public']['Tables']['event_games']['Update'];