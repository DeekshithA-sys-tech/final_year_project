const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const XrayImage = require('../models/XrayImage');
const Patient = require('../models/Patient');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Mock AI Prediction Endpoint (Legacy)
router.post('/', async (req, res) => {
    try {
        const { xrayId } = req.body;

        if (!xrayId) {
            return res.status(400).json({ success: false, message: 'xrayId is required' });
        }

        const xray = await XrayImage.findById(xrayId);
        if (!xray) {
            return res.status(404).json({ success: false, message: 'X-ray image not found' });
        }

        // Simulate AI Processing Delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Mock result generation
        const mockConfidence = 0.5 + (Math.random() * 0.45); // 0.5 to 0.95
        const isPositive = mockConfidence > 0.75;
        const result = isPositive ? 'TB Positive' : 'Negative';

        xray.processed = true;
        await xray.save();

        const report = await Report.create({
            patientId: xray.patientId,
            xrayId: xray._id,
            result: result,
            confidence: mockConfidence
        });

        // Optionally update patient status
        const patient = await Patient.findById(xray.patientId);
        if (patient) {
            patient.tbProbabilityScore = mockConfidence;
            patient.aiAnalysisStatus = 'Completed';
            await patient.save();
        }

        res.status(200).json({
            success: true,
            data: {
                reportId: report._id,
                result: result,
                confidence: mockConfidence
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Real AI Prediction Endpoint
router.post('/analyze-base64', async (req, res) => {
    try {
        const { imageBase64 } = req.body;
        if (!imageBase64) {
            return res.status(400).json({ success: false, message: 'imageBase64 is required' });
        }

        // Decode base64 to build a temp file
        const matches = imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
            return res.status(400).json({ success: false, message: 'Invalid base64 format' });
        }
        
        const imageBuffer = Buffer.from(matches[2], 'base64');
        
        // Define temp directory
        const tempDir = path.join(__dirname, '../../uploads/temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }
        
        const tempPath = path.join(tempDir, `${crypto.randomUUID()}.jpg`);
        fs.writeFileSync(tempPath, imageBuffer);

        // Define python script path based on current directory structure
        const phase1Dir = path.join(__dirname, '../../../Phase3/phase1');
        
        const pythonProcess = spawn('C:\\Python313\\python.exe', ['test_main.py', tempPath], { cwd: phase1Dir });

        let stdoutData = '';
        let stderrData = '';

        pythonProcess.stdout.on('data', (data) => {
            stdoutData += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            stderrData += data.toString();
        });

        pythonProcess.on('close', (code) => {
            // Clean up temp file
            if (fs.existsSync(tempPath)) {
                fs.unlinkSync(tempPath);
            }

            if (code !== 0) {
                console.error('Python script error:', stderrData);
                return res.status(500).json({ success: false, message: 'AI Analysis Failed', error: stderrData });
            }

            // Extract JSON from output
            const startToken = '---JSON_OUTPUT_START---';
            const endToken = '---JSON_OUTPUT_END---';
            
            const startIndex = stdoutData.indexOf(startToken);
            const endIndex = stdoutData.indexOf(endToken);

            if (startIndex === -1 || endIndex === -1) {
                console.error('Terminal Output Format Error:', stdoutData);
                return res.status(500).json({ success: false, message: 'Failed to parse AI output' });
            }

            const jsonStr = stdoutData.substring(startIndex + startToken.length, endIndex).trim();
            
            try {
                const results = JSON.parse(jsonStr);
                res.status(200).json({ success: true, data: results });
            } catch (err) {
                console.error('JSON Parse Error:', err);
                return res.status(500).json({ success: false, message: 'Invalid JSON from AI' });
            }
        });

    } catch (error) {
        console.error('Analyze Base64 Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
