const bcrypt = require('bcryptjs'); // импортируем bcrypt
const jwt = require('jsonwebtoken'); // импортируем модуль jsonwebtoken
const User = require('../models/user');
const Error401 = require('../errors/Error401');
const Error500 = require('../errors/Error500');

const ERROR_CODE_UNAUTHORIZED = 401;

const checkLogin = (req, res, next) => {
  const { email, password } = req.body;
  User.findOne({ email }).select('+password')
    .then((user) => {
      // Надо проверить пароль
      bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            // Если мы здесь, значит Хэши не совпали. Бросаем ошибку и уходим в catch
            const error = new Error401('Указан некорректный email или пароль.');
            throw error;
          }
          const { NODE_ENV, JWT_SECRET } = process.env;
          // Необходимо создать токен и отправить его пользователю
          const token = jwt.sign({ _id: user._id },
            NODE_ENV === 'production' ? JWT_SECRET : 'strongest-key-ever',
            { expiresIn: '7d' });
          res.send({ token });
        })
        .catch((err) => {
          if (err.statusCode === ERROR_CODE_UNAUTHORIZED) {
            next(err);
          } else {
            next(new Error500('Что-то пошло не так :('));
          }
        });
    })
    .catch((err) => {
      if (err.statusCode === ERROR_CODE_UNAUTHORIZED) {
        return next(err);
      } if (err.name === 'TypeError') {
        return next(new Error401('Указан некорректный email или пароль.'));
      }
      return next(new Error500('Что-то пошло не так :('));
    });
};

module.exports = checkLogin;
