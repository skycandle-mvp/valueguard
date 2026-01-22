import { Timestamp } from "firebase/firestore";

export type Incident = {
  id: string;
  companyName: string;
  companyId: string;
  title: string;
  description: string;
  date: string;
  categories: string[];
  userId?: string;
  user?: {
    uid: string;
    displayName: string | null;
    photoURL: string | null;
  }
};

export type Company = {
  id:string;
  name: string;
  logoUrl: string;
  incidentCount: number;
};

export type UserProfile = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
};

export type Comment = {
  id: string;
  text: string;
  userId: string;
  incidentId: string;
  createdAt: Timestamp;
  user: {
    uid: string;
    displayName: string | null;
    photoURL: string | null;
  };
};
