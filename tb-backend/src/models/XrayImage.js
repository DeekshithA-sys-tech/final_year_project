const mongoose = require('mongoose');

const xrayImageSchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    imageUrl: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
    processed: { type: Boolean, default: false }
});

module.exports = mongoose.model('XrayImage', xrayImageSchema);
