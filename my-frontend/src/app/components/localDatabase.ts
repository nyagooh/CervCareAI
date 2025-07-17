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

export const patients: Patient[] = [
  {
    id: "pat1",
    doctorId: "doc1",
    name: "Alice Johnson",
    age: 32,
    region: "Nairobi",
    assessments: [
      {
        id: "assess1",
        date: "2024-06-01",
        result: "positive",
        notes: "Initial assessment",
      },
    ],
  },
];

export const LOCAL_PATIENTS_KEY = 'localPatients';

export function getLocalPatients(): Patient[] {
  if (typeof window === 'undefined') return patients;
  const stored = localStorage.getItem(LOCAL_PATIENTS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return patients;
    }
  }
  return patients;
}

export function setLocalPatients(newPatients: Patient[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_PATIENTS_KEY, JSON.stringify(newPatients));
  }
} 