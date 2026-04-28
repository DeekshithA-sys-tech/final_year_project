const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const XrayImage = require('../models/XrayImage');
const Patient = require('../models/Patient');
// const { protect } = require('../middlewares/auth');

// Upload X-Ray for a patient
router.post('/patients/:id/xrays', /* protect, */ upload.single('xray'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const patientId = req.params.id;
        const patient = await Patient.findById(patientId);

        if (!patient) {
            return res.status(404).json({ success: false, message: 'Patient not found' });
        }

        const awsImageUrl = `http://localhost:${process.env.PORT || 5000}/uploads/${req.file.filename}`;

        // In reality, this would upload to S3 using aws-sdk here

        const xray = await XrayImage.create({
            patientId: patientId,
            imageUrl: awsImageUrl,
            processed: false
        });

        // Also update patient with this image reference as per frontend request
        patient.xrayImage = awsImageUrl;
        await patient.save();

        res.status(201).json({ success: true, data: xray });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
