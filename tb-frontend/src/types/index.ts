export interface User {
    id: string;
    fullName: string;
    email: string;
}

export interface Patient {
    _id?: string;
    id: string; // Auto-generated ID like PAT-001
    fullName: string;
    age: number;
    gender: 'Male' | 'Female' | 'Other';
    contactNumber: string;
    email: string;
    address?: string;

    // Medical History
    previousTbInfection: boolean;
    familyHistoryTb: boolean;
    hivStatus: 'Positive' | 'Negative' | 'Unknown';
    diabetesStatus: boolean;
    smokingHistory: 'Never' | 'Former' | 'Current';
    bcgVaccination: 'Yes' | 'No' | 'Unknown';
    currentMedications?: string;

    // Symptoms Assessment
    persistentCough: boolean;
    coughDuration?: '<2 weeks' | '2-4 weeks' | '>4 weeks';
    chestPain: boolean;
    fever: boolean;
    nightSweats: boolean;
    weightLoss: boolean;
    bloodInSputum: boolean;
    fatigue: boolean;

    // Clinical Data
    xrayImage?: string; // URL or base64 preview
    sputumTestResult: 'Positive' | 'Negative' | 'Pending';
    mantouxInduration?: number;
    additionalNotes?: string;

    // Report details
    tbProbabilityScore?: number;
    aiAnalysisStatus?: 'Pending' | 'Completed' | 'Failed';

    createdAt: string;
    updatedAt: string;
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
}

export interface PatientState {
    list: Patient[];
    selectedPatient: Patient | null;
    loading: boolean;
    error: string | null;
}
