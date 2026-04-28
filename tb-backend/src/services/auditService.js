const AuditLog = require('../models/AuditLog');

const logAction = async (userId, action, details = {}) => {
    try {
        await AuditLog.create({
            userId,
            action,
            details
        });
    } catch (err) {
        console.error('Failed to write audit log', err);
    }
};

module.exports = { logAction };
