const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
// const { protect } = require('../middlewares/auth');

// Get report by patient ID
router.get('/patient/:patientId', /* protect, */ async (req, res) => {
    try {
        const report = await Report.findOne({ patientId: req.params.patientId })
            .sort({ createdAt: -1 })
            .populate('xrayId');

        if (!report) {
            return res.status(404).json({ success: false, message: 'No report found for this patient' });
        }

        res.status(200).json({ success: true, data: report });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Get report by specific ID
router.get('/:id', /* protect, */ async (req, res) => {
    try {
        const report = await Report.findById(req.params.id)
            .populate('xrayId')
            .populate('patientId');

        if (!report) {
            return res.status(404).json({ success: false, message: 'Report not found' });
        }

        res.status(200).json({ success: true, data: report });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
