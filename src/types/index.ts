export interface User {
  id: string;
  username: string;
  email: string;
  bio?: string;
  avatar?: string;
  karma: number;
  role: string;
  createdAt: string;
}

export interface Community {
  id: string;
  name: string;
  slug: string;
  description?: string;
  banner?: string;
  avatar?: string;
  type: "public" | "restricted" | "private";
  category: string;
  membersCount: number;
  location?: string;
  ownerId: string;
  createdAt: string;
}

export interface Post {
  id: string;
  authorId: string;
  author: User;
  communityId: string;
  community: Community;
  type:
    | "announcement"
    | "discussion"
    | "event"
    | "recommendation"
    | "photo"
    | "question";
  title: string;
  body?: string;
  imageUrl?: string;
  eventLocation?: string;
  eventDate?: string;
  eventEndDate?: string;
  tags: string[];
  votesCount: number;
  commentsCount: number;
  viewsCount: number;
  sharesCount: number;
  isPinned: boolean;
  isEdited: boolean;
  userVote?: "up" | "down" | null;
  isSaved?: boolean;
  createdAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  user: User;
  parentId?: string;
  body: string;
  votesCount: number;
  isEdited: boolean;
  createdAt: string;
  replies?: Comment[];
}

export interface Notification {
  id: string;
  userId: string;
  actorId?: string;
  actor?: User;
  type: string;
  entityId?: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  type: "dm" | "group" | "community_room";
  name?: string;
  avatar?: string;
  communityId?: string;
  community?: Community;
  lastMessageAt?: string;
  lastMessage?: string;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  sender: User;
  content: string;
  imageUrl?: string;
  replyToId?: string;
  replyTo?: Message;
  deletedAt?: string;
  createdAt: string;
}
