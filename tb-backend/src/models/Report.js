const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    xrayId: { type: mongoose.Schema.Types.ObjectId, ref: 'XrayImage' },
    result: { type: String, required: true }, // 'TB Positive' / 'Negative'
    confidence: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Report', reportSchema);
