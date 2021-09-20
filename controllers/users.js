const bcrypt = require("bcryptjs"); // импортируем bcrypt
const User = require("../models/user");
const Error400 = require("../errors/Error400");
const Error404 = require("../errors/Error404");
const Error409 = require("../errors/Error409");
const Error500 = require("../errors/Error500");

const ERROR_NOT_FOUND = 404;

// колбек для получения всех пользователей
const getAllUsers = (req, res, next) => {
  User.find({})
    .then((users) => {
      res.status(200).send({ data: users });
    })
    .catch(() => {
      next(new Error500("Что-то пошло не так :("));
    });
};

// колбек для получения определённого пользователя
const getUser = (req, res, next) => {
  User.findById(req.params.userId)
    .orFail(() => {
      // Если мы здесь, значит запрос в базе ничего не нашёл
      // Кидаем ошибку, потому что иначе orFail все равно вызовет catch >_<
      throw (new Error404("Пользователь по заданному ID отсутствует в базе данных"));
    })
    .then((user) => {
      res.status(200).send({ data: user });
    })
    .catch((err) => {
      if (err.name === "CastError") {
        next(new Error400("Ошибка в формате ID пользователя"));
      } else if (err.statusCode === ERROR_NOT_FOUND) {
        next(err);
      } else {
        next(new Error500("Что-то пошло не так :("));
      }
    });
};

// Колбек получения данных текущего пользователя
const getCurrentUser = (req, res, next) => {
  // Ищем пользователя по сохраннёному полю в мидлвэре
  User.findById(req.user)
    .orFail(() => {
      // Если мы здесь, значит запрос в базе ничего не нашёл
      next(new Error404("Пользователь по заданному ID отсутствует в базе данных"));
    })
    .then((user) => {
      res.send({ data: user });
    })
    .catch((err) => {
      if (err.name === "CastError") {
        next(new Error400("Ошибка в формате ID пользователя"));
      } else if (err.statusCode === ERROR_NOT_FOUND) {
        next(err);
      } else {
        next(new Error500("Что-то пошло не так :("));
      }
    });
};

// колбек для создания нового пользователя
const createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  bcrypt.hash(password, 10)
    .then((hash) => {
      User.create({
        name, about, avatar, email, password: hash,
      })
        .then((user) => {
          res.send({
            data: {
              name: user.name,
              about: user.about,
              avatar: user.avatar,
              email: user.email,
            },
          });
        })
        .catch((err) => {
          if (err.name === "ValidationError") {
            next(new Error400("Переданы некорректные данные при создании пользователя"));
          } else if (err.name === "MongoError" && err.code === 11000) {
            next(new Error409("Данный пользователь уже зарегистрирован"));
          } else {
            next(new Error500("Что-то пошло не так :("));
          }
        });
    })
    .catch(() => {
      next(new Error400("Проблема с хешированием пароля"));
    });
};

/*  PATCH /users/me — обновляет профиль
    PATCH /users/me/avatar — обновляет аватар
*/

const updateUserInfo = (req, res, next) => {
  const { name, about } = req.body;
  const userID = req.user._id;
  // найдём пользователя по ID
  User.findByIdAndUpdate(userID, { name, about }, {
    new: true,
    runValidators: true,
    upsert: false,
  })
    .orFail(() => {
      // Если мы здесь, значит запрос в базе ничего не нашёл
      next(new Error404("Пользователь по заданному ID отсутствует в базе данных"));
    })
    .then((newUserInfo) => {
      res.status(200).send({ data: newUserInfo });
    })
    .catch((err) => {
      if (err.name === "CastError") {
        next(new Error400("Ошибка в формате ID пользователя"));
      } else if (err.name === "ValidationError") {
        next(new Error400("Переданы некорректные данные при обновлении данных пользователя"));
      } else if (err.statusCode === ERROR_NOT_FOUND) {
        next(err);
      } else {
        next(new Error500("Что-то пошло не так :("));
      }
    });
};

const updateUserAvatar = (req, res, next) => {
  const { avatar } = req.body;
  const userID = req.user._id;
  // найдём пользователя по ID
  // Не дадим обновить пустой строкой
  if (!avatar) {
    next(new Error400("Переданы некорректные данные при обновлении данных пользователя"));
  }
  User.findByIdAndUpdate(userID, { avatar }, {
    new: true,
    runValidators: true,
    upsert: false,
  })
    .orFail(() => {
      // Если мы здесь, значит запрос в базе ничего не нашёл
      next(new Error404("Пользователь по заданному ID отсутствует в базе данных"));
    })
    .then((newUserData) => {
      res.status(200).send({ data: newUserData });
    })
    .catch((err) => {
      if (err.name === "CastError") {
        next(new Error400("Ошибка в формате ID пользователя"));
      } else if (err.name === "ValidationError") {
        next(new Error400("Переданы некорректные данные при обновлении данных пользователя"));
      } else if (err.statusCode === ERROR_NOT_FOUND) {
        next(err);
      } else {
        next(new Error500("Что-то пошло не так :("));
      }
    });
};

module.exports = {
  getAllUsers, getUser, createUser, updateUserInfo, updateUserAvatar, getCurrentUser,
};
