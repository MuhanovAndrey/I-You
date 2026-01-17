export interface User {
  id: string;
  email: string;
  username: string;
  telegramUsername?: string;
  telegramVerified: boolean;
  pairedWithId?: string;
  pairedWith?: {
    id: string;
    username: string;
    telegramUsername?: string;
  };
  createdAt: string;
}

export interface LoveReason {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    username: string;
  };
  reactions: Reaction[];
  comments: Comment[];
}

export interface GiftIdea {
  id: string;
  userId: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    username: string;
  };
  reactions: Reaction[];
  comments: Comment[];
}

export interface StatePost {
  id: string;
  userId: string;
  type: 'physical' | 'emotional';
  content: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    username: string;
  };
  reactions: Reaction[];
  comments: Comment[];
}

export interface Reaction {
  id: string;
  userId: string;
  type: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
  };
}

export interface Comment {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    username: string;
  };
  reactions: Reaction[];
}

export interface PairingRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  fromUser: {
    id: string;
    username: string;
  };
  toUser: {
    id: string;
    username: string;
  };
}
