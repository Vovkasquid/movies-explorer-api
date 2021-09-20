/* GET /cards — возвращает все карточки
   POST /cards — создаёт карточку
   DELETE /cards/:cardId — удаляет карточку по идентификатору
   PUT /cards/:cardId/likes — поставить лайк карточке
   DELETE /cards/:cardId/likes — убрать лайк с карточки
*/

const Card = require("../models/card");
const Error400 = require("../errors/Error400");
const Error404 = require("../errors/Error404");
const Error403 = require("../errors/Error403");
const Error500 = require("../errors/Error500");

const ERROR_NOT_FOUND = 404;

const getAllCards = (req, res, next) => {
  Card.find({})
    .then((cards) => {
      res.status(200).send({ data: cards });
    })
    .catch(() => {
      next(new Error500("Что-то пошло не так :("));
    });
};

const createCard = (req, res, next) => {
  const { name, link } = req.body;
  const owner = req.user._id;
  Card.create({ name, link, owner })
    .then((card) => {
      res.status(200).send({ data: card });
    })
    .catch((err) => {
      if (err.name === "ValidationError") {
        next(new Error400("Переданы некорректные данные при создании карточки"));
      } else {
        next(new Error500("Что-то пошло не так :("));
      }
    });
};

const deleteCard = (req, res, next) => {
  // найдём карточку и удалим её
  Card.findById(req.params.cardId)
    .orFail(() => {
      // Если мы здесь, значит запрос в базе ничего не нашёл
      // Бросаем ошибку и попадаем в catch
      throw new Error404("Карточка с заданным ID отсутствует в базе данных");
    })
    .then((card) => {
      // Надо проверить может ли пользователь удалить эту карточку
      // user._id приходит с типом string, а card.owner._id приходит с форматом object
      // необходимо привести к строке
      if (req.user._id !== card.owner.toString()) {
        // Бросаем ошибку, что пользователь не может это делать
        next(new Error403("Нельзя удалить чужую карточку"));
      } else {
        card.remove();
        res.status(200)
          .send({ message: `Карточка с id ${card.id} успешно удалена!` });
      }
    })
    .catch((err) => {
      if (err.name === "CastError") {
        next(new Error400("Ошибка в формате ID карточки"));
      } else if (err.statusCode === ERROR_NOT_FOUND) {
        next(err);
      } else {
        next(new Error500("Что-то пошло не так :("));
      }
    });
};

const likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
    { new: true },
  )
    .orFail(() => {
      // Если мы здесь, значит запрос в базе ничего не нашёл
      throw new Error404("Карточка с заданным ID отсутствует в базе данных");
    })
    .then((card) => {
      res.status(200).send({ data: card });
    })
    .catch((err) => {
      if (err.name === "CastError") {
        next(new Error400("Ошибка в формате ID карточки"));
      } else if (err.statusCode === ERROR_NOT_FOUND) {
        next(err);
      } else {
        next(new Error500("Что-то пошло не так :("));
      }
    });
};

const dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } }, // убрать _id из массива
    { new: true },
  )
    .orFail(() => {
      // Если мы здесь, значит запрос в базе ничего не нашёл
      throw new Error404("Карточка с заданным ID отсутствует в базе данных");
    })
    .then((card) => {
      res.status(200).send({ data: card });
    })
    .catch((err) => {
      if (err.name === "CastError") {
        next(new Error400("Ошибка в формате ID карточки"));
      } else if (err.statusCode === ERROR_NOT_FOUND) {
        next(err);
      } else {
        next(new Error500("Что-то пошло не так :("));
      }
    });
};

module.exports = {
  getAllCards, createCard, deleteCard, likeCard, dislikeCard,
};
