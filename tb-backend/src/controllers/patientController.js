const patientService = require('../services/patientService');

const createPatient = async (req, res) => {
    try {
        const patient = await patientService.createPatient(req.body);
        res.status(201).json(patient);
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

const getPatients = async (req, res) => {
    try {
        const patients = await patientService.getPatients();
        res.status(200).json(patients);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const getPatientById = async (req, res) => {
    try {
        const patient = await patientService.getPatientById(req.params.id);
        res.status(200).json(patient);
    } catch (err) {
        if (err.message === 'Patient not found') {
            return res.status(404).json({ success: false, message: err.message });
        }
        res.status(500).json({ success: false, message: err.message });
    }
};

const updatePatient = async (req, res) => {
    try {
        const patient = await patientService.updatePatient(req.params.id, req.body);
        res.status(200).json(patient);
    } catch (err) {
        if (err.message === 'Patient not found') {
            return res.status(404).json({ success: false, message: err.message });
        }
        res.status(400).json({ success: false, message: err.message });
    }
};

const deletePatient = async (req, res) => {
    try {
        await patientService.deletePatient(req.params.id);
        res.status(200).json({ success: true, message: 'Patient deleted successfully' });
    } catch (err) {
        if (err.message === 'Patient not found') {
            return res.status(404).json({ success: false, message: err.message });
        }
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = {
    createPatient,
    getPatients,
    getPatientById,
    updatePatient,
    deletePatient
};
