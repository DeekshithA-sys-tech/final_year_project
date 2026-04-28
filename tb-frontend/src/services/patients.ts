import { Patient } from '../types';

const API_URL = 'http://localhost:5000/api/patients';

export const getPatients = async (): Promise<Patient[]> => {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('Failed to fetch patients');
    return res.json();
};

export const getPatientById = async (id: string): Promise<Patient> => {
    const res = await fetch(`${API_URL}/${id}`);
    if (!res.ok) throw new Error('Patient not found');
    return res.json();
};

export const createPatient = async (patientData: Partial<Patient>): Promise<Patient> => {
    const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(patientData)
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create patient');
    }
    return res.json();
};

export const updatePatient = async (id: string, updates: Partial<Patient>): Promise<Patient> => {
    const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates)
    });

    if (!res.ok) throw new Error('Failed to update patient');
    return res.json();
};

export const deletePatient = async (id: string): Promise<void> => {
    const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
    });

    if (!res.ok) throw new Error('Failed to delete patient');
};
