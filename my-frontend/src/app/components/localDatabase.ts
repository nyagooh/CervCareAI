export type Assessment = {
  id: string;
  date: string;
  result: "positive" | "negative";
  notes?: string;
};

export type Patient = {
  id: string;
  doctorId: string;
  name: string;
  age: number;
  region: string;
  assessments: Assessment[];
};

export type Doctor = {
  id: string;
  name: string;
  email: string;
  profilePic: string;
};

export const doctors: Doctor[] = [
  {
    id: "doc1",
    name: "Dr. Jane Smith",
    email: "jane.smith@example.com",
    profilePic: "/defaultpic.jpg",
  },
];

export const LOCAL_PATIENTS_KEY = 'localPatients';

export function getLocalPatients(): Patient[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(LOCAL_PATIENTS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }
  return [];
}

export function setLocalPatients(newPatients: Patient[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_PATIENTS_KEY, JSON.stringify(newPatients));
  }
} 