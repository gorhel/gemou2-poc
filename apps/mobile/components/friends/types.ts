// Types pour le système d'amitié

export interface Profile {
  id: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
  bio: string | null
  friends_list_public: boolean
}

export interface FriendRequest {
  id: string
  user_id: string
  friend_id: string
  friendship_status: 'pending' | 'accepted' | 'declined' | 'blocked'
  created_at: string
  updated_at: string
  deleted_at: string | null
  sender?: Profile
  receiver?: Profile
}

export interface Friendship extends FriendRequest {
  friend?: Profile
}

export interface PrivacySettings {
  friends_list_public: boolean
  notify_friend_request_inapp: boolean
  notify_friend_request_push: boolean
  notify_friend_request_email: boolean
  notify_friend_accepted_inapp: boolean
  notify_friend_accepted_push: boolean
  notify_friend_accepted_email: boolean
}

