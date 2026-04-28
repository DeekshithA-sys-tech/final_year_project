import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Patient, PatientState } from '../types';

const initialState: PatientState = {
    list: [],
    selectedPatient: null,
    loading: false,
    error: null,
};

const patientSlice = createSlice({
    name: 'patients',
    initialState,
    reducers: {
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
            state.error = null;
        },
        setError: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },
        setPatients: (state, action: PayloadAction<Patient[]>) => {
            state.loading = false;
            state.list = action.payload;
        },
        setSelectedPatient: (state, action: PayloadAction<Patient>) => {
            state.selectedPatient = action.payload;
        },
        addPatient: (state, action: PayloadAction<Patient>) => {
            state.list.unshift(action.payload);
            state.loading = false;
        },
        updatePatient: (state, action: PayloadAction<Patient>) => {
            const index = state.list.findIndex(p => p.id === action.payload.id);
            if (index !== -1) {
                state.list[index] = action.payload;
            }
            if (state.selectedPatient?.id === action.payload.id) {
                state.selectedPatient = action.payload;
            }
            state.loading = false;
        },
        deletePatient: (state, action: PayloadAction<string>) => {
            const payloadId = String(action.payload);
            state.list = state.list.filter(p => String(p.id) !== payloadId && String((p as any)._id) !== payloadId);
            if (String(state.selectedPatient?.id) === payloadId || String((state.selectedPatient as any)?._id) === payloadId) {
                state.selectedPatient = null;
            }
        }
    },
});

export const { setLoading, setError, setPatients, setSelectedPatient, addPatient, updatePatient, deletePatient } = patientSlice.actions;
export default patientSlice.reducer;
