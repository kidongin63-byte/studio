export type Member = {
  id: string; // This will be the user's UID from Firebase Auth
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
