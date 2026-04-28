const patientRepo = require('../repositories/patientRepository');

const createPatient = async (patientData) => {
    return await patientRepo.createPatient(patientData);
};

const getPatients = async () => {
    return await patientRepo.getPatients();
};

const getPatientById = async (id) => {
    const patient = await patientRepo.getPatientById(id);
    if (!patient) throw new Error('Patient not found');
    return patient;
};

const updatePatient = async (id, updateData) => {
    const patient = await patientRepo.updatePatient(id, updateData);
    if (!patient) throw new Error('Patient not found');
    return patient;
};

const deletePatient = async (id) => {
    const patient = await patientRepo.deletePatient(id);
    if (!patient) throw new Error('Patient not found');
    return true;
};

module.exports = {
    createPatient,
    getPatients,
    getPatientById,
    updatePatient,
    deletePatient
};
