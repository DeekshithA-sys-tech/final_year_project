const jwt = require('jsonwebtoken');
const authRepo = require('../repositories/authRepository');

const generateTokens = (userId) => {
    const accessToken = jwt.sign({ id: userId }, process.env.JWT_ACCESS_SECRET, { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' });
    const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' });
    return { accessToken, refreshToken };
};

const signup = async (userData) => {
    const userExists = await authRepo.findUserByEmail(userData.email);
    if (userExists) {
        throw new Error('User already exists');
    }
    const user = await authRepo.createUser(userData);
    return {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
    };
};

const login = async (email, password) => {
    const user = await authRepo.findUserByEmail(email);
    if (user && (await user.matchPassword(password))) {
        const { accessToken, refreshToken } = generateTokens(user._id);

        // Save refresh token to db (Expires in 7 days)
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await authRepo.saveRefreshToken(user._id, refreshToken, expiresAt);

        return {
            user: {
                id: user._id,
                fullName: user.name, // Matching frontend expectations
                email: user.email,
                role: user.role
            },
            accessToken,
            refreshToken
        };
    } else {
        throw new Error('Invalid email or password');
    }
};

const refresh = async (tokenStr) => {
    if (!tokenStr) throw new Error('No refresh token provided');

    const tokenDoc = await authRepo.findRefreshToken(tokenStr);
    if (!tokenDoc) throw new Error('Invalid refresh token');

    // Verify token
    try {
        jwt.verify(tokenStr, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
        await authRepo.deleteRefreshToken(tokenStr);
        throw new Error('Refresh token expired');
    }

    const { accessToken } = generateTokens(tokenDoc.userId._id);
    return { accessToken };
};

const logout = async (tokenStr) => {
    if (!tokenStr) return;
    await authRepo.deleteRefreshToken(tokenStr);
};

module.exports = {
    signup,
    login,
    refresh,
    logout
};
