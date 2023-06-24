const jwt = require('jsonwebtoken');
const { AppError, STATUS_UNAUTHORIZED } = require('../errors/AppError');

const { NODE_ENV } = process.env;
const JWT_SECRET = NODE_ENV === 'production' ? process.env.JWT_SECRET : 'dev';

module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return next(new AppError('Необходима авторизация', STATUS_UNAUTHORIZED));
  }

  const token = authorization.replace('Bearer ', '');

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    next(new AppError('Необходима авторизация', STATUS_UNAUTHORIZED));
  }
};
