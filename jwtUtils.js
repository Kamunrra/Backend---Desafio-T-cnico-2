// jwtUtils.js

const jwt = require('jsonwebtoken');
const fs = require('fs');

function generateToken(payload, secretKey, options) {
    // ... código jwt.sign()
}

function verifyToken(token, secretKey, callback) {
    // ... código jwt.verify()
}

module.exports = { generateToken, verifyToken };
