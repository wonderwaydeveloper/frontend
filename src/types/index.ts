export interface User {
  id: number
  name: string
  username: string
  email: string
  avatar?: string
  cover?: string
  bio?: string
  location?: string
  website?: string
  verified: boolean
  is_private: boolean
  followers_count: number
  following_count: number
  posts_count: number
  created_at: string
}

export interface Post {
  id: number
  user_id: number
  content: string
  image?: string
  video?: string
  gif_url?: string
  likes_count: number
  comments_count: number
  quotes_count: number
  is_liked?: boolean
  is_bookmarked?: boolean
  created_at: string
  updated_at: string
  user: User
  hashtags?: Hashtag[]
  quoted_post?: Post
  poll?: Poll
}

export interface Comment {
  id: number
  post_id: number
  user_id: number
  content: string
  likes_count: number
  is_liked?: boolean
  created_at: string
  user: User
}

export interface Hashtag {
  id: number
  name: string
  slug: string
  posts_count: number
}

export interface Poll {
  id: number
  post_id: number
  question: string
  expires_at: string
  total_votes: number
  options: PollOption[]
}

export interface PollOption {
  id: number
  poll_id: number
  text: string
  votes_count: number
  percentage: number
}

export interface Notification {
  id: number
  user_id: number
  type: string
  title: string
  message: string
  data: any
  read_at?: string
  created_at: string
}

export interface AuthUser extends User {
  email_verified_at?: string
  two_factor_enabled: boolean
}

export interface LoginCredentials {
  login: string
  password: string
  two_factor_code?: string
}

export interface RegisterData {
  name: string
  username: string
  email: string
  password: string
  password_confirmation: string
  date_of_birth: string
}