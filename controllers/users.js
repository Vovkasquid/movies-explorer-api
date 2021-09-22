const bcrypt = require('bcryptjs'); // импортируем bcrypt
const User = require('../models/user');
const Error400 = require('../errors/Error400');
const Error404 = require('../errors/Error404');
const Error409 = require('../errors/Error409');
const Error500 = require('../errors/Error500');

const ERROR_NOT_FOUND = 404;

// Колбек получения данных текущего пользователя
const getCurrentUser = (req, res, next) => {
  // Ищем пользователя по сохраннёному полю в мидлвэре
  User.findById(req.user)
    .orFail(() => {
      // Если мы здесь, значит запрос в базе ничего не нашёл
      next(new Error404('Пользователь по заданному ID отсутствует в базе данных'));
    })
    .then((user) => {
      res.send({ data: user });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new Error400('Ошибка в формате ID пользователя'));
      } if (err.statusCode === ERROR_NOT_FOUND) {
        return next(err);
      }
      return next(new Error500('Что-то пошло не так :('));
    });
};

// колбек для создания нового пользователя
const createUser = (req, res, next) => {
  const {
    name, email, password,
  } = req.body;
  bcrypt.hash(password, 10)
    .then((hash) => {
      User.create({
        name, email, password: hash,
      })
        .then((user) => {
          res.send({
            data: {
              name: user.name,
              email: user.email,
            },
          });
        })
        .catch((err) => {
          if (err.name === 'ValidationError') {
            return next(new Error400('Переданы некорректные данные при создании пользователя'));
          } if (err.name === 'MongoError' && err.code === 11000) {
            return next(new Error409('Данный пользователь уже зарегистрирован'));
          }
          return next(new Error500('Что-то пошло не так :('));
        });
    })
    .catch(() => {
      next(new Error400('Проблема с хешированием пароля'));
    });
};

/*  PATCH /users/me — обновляет профиль
*/

const updateUserInfo = (req, res, next) => {
  const { name, email } = req.body;
  const userID = req.user._id;
  // найдём пользователя по ID
  User.findByIdAndUpdate(userID, { name, email }, {
    new: true,
    runValidators: true,
    upsert: false,
  })
    .orFail(() => {
      // Если мы здесь, значит запрос в базе ничего не нашёл
      next(new Error404('Пользователь по заданному ID отсутствует в базе данных'));
    })
    .then((newUserInfo) => {
      res.status(200).send({ data: newUserInfo });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new Error400('Ошибка в формате ID пользователя'));
      } if (err.name === 'ValidationError') {
        return next(new Error400('Переданы некорректные данные при обновлении данных пользователя'));
      } if (err.statusCode === ERROR_NOT_FOUND) {
        return next(err);
      } if (err.codeName === 'DuplicateKey') {
        return next(new Error409('Нельзя присвоить себе чужой email'));
      }
      return next(new Error500('Что-то пошло не так :('));
    });
};

module.exports = {
  createUser, updateUserInfo, getCurrentUser,
};
