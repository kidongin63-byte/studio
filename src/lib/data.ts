export type UserProfile = {
  name: string;
  phone: string;
  address: string;
  birthDate: string; // YYYY-MM-DD
  isLunar: boolean;
  anniversary: string; // YYYY-MM-DD
  preferences: {
    food: string;
    hobbies: string;
  };
  avatarUrl: string;
  email: string;
  isAdmin?: boolean;
};

export type Member = UserProfile & {
  id: string; // This will be the user's UID from Firebase Auth
};

export type Rule = {
  id: string; // This will be the document ID from Firestore
  title: string;
  content: string;
};

export type Message = {
  id: string; // This will be the document ID from Firestore
  author: string;
  content: string;
};
