const jwt = require('jsonwebtoken');
const SK = require('/secret');

const secretKey = SK;

/**
 * функция создания токена
 * @param {Object} payload - Загрузка объектов в токен
 * @param {String} expiresIn - время жизни токена
 * @returns {String} - Созданный токен
 */
function generateToken(payload, expiresIn = '1h') {
  return jwt.sign(payload, secretKey, { expiresIn });
}

module.exports = { generateToken };