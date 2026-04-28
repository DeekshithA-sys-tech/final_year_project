const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, required: true },
    contactNumber: { type: String, required: true },
    email: { type: String },

    // Medical History
    previousTbInfection: { type: Boolean },
    familyHistoryTb: { type: Boolean },
    hivStatus: { type: String },
    diabetesStatus: { type: Boolean },
    smokingHistory: { type: String },
    bcgVaccination: { type: String },

    // Symptoms
    persistentCough: { type: Boolean },
    coughDuration: { type: String },
    chestPain: { type: Boolean },
    fever: { type: Boolean },
    nightSweats: { type: Boolean },
    weightLoss: { type: Boolean },
    bloodInSputum: { type: Boolean },
    fatigue: { type: Boolean },

    // Clinical
    sputumTestResult: { type: String, default: 'Pending' },
    additionalNotes: { type: String },

    // Deep Learning status from Xray
    tbProbabilityScore: { type: Number },
    aiAnalysisStatus: { type: String, default: 'Pending' },
    xrayImage: { type: String }, // URL or Base64

}, { timestamps: true });

// For mapping id to matching frontend type easily
patientSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    }
});

module.exports = mongoose.model('Patient', patientSchema);
