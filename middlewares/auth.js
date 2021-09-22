const jwt = require('jsonwebtoken'); // импортируем модуль jsonwebtoken
const Error401 = require('../errors/Error401');

module.exports = (req, res, next) => {
  const { JWT_SECRET = 'strongest-key-ever' } = process.env;
  const { authorization } = req.headers;
  // Проверяем есть ли заголовок и начинается ли он с Bearer
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return next(new Error401('Необходима авторизация'));
  }
  // Отделяем токен от Bearer
  const token = authorization.replace('Bearer ', '');
  let payload;

  // Чтобы отловить ошибки оборачиваем в try-catch
  try {
    // Вытаскиваем айди из токена
    payload = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    next(new Error401('Необходима авторизация'));
  }

  req.user = payload; // записываем пейлоуд в объект запроса

  return next(); // пропускаем запрос дальше
};
