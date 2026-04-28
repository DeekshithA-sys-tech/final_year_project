const User = require('../models/User');
const Token = require('../models/Token');
const auditService = require('../services/auditService');

const findUserByEmail = async (email) => {
    return await User.findOne({ email });
};

const createUser = async (userData) => {
    return await User.create(userData);
};

const saveRefreshToken = async (userId, tokenStr, expiresAt) => {
    return await Token.create({ userId, token: tokenStr, expiresAt });
};

const findRefreshToken = async (tokenStr) => {
    return await Token.findOne({ token: tokenStr }).populate('userId');
};

const deleteRefreshToken = async (tokenStr) => {
    return await Token.findOneAndDelete({ token: tokenStr });
};

module.exports = {
    findUserByEmail,
    createUser,
    saveRefreshToken,
    findRefreshToken,
    deleteRefreshToken
};
