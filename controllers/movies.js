/* # возвращает все сохранённые пользователем фильмы
GET /movies

# создаёт фильм с переданными в теле
# country,director,duration,year, description, image, trailer, nameRU, nameEN и thumbnail, movieId
POST /movies

# удаляет сохранённый фильм по id
DELETE /movies/movieId
*/

const Movie = require('../models/movie');
const Error400 = require('../errors/Error400');
const Error404 = require('../errors/Error404');
const Error403 = require('../errors/Error403');
const Error500 = require('../errors/Error500');

const ERROR_NOT_FOUND = 404;

const getAllMovies = (req, res, next) => {
  Movie.find({})
    .then((cards) => {
      res.status(200).send({ data: cards });
    })
    .catch(() => {
      next(new Error500('Что-то пошло не так :('));
    });
};

const createMovie = (req, res, next) => {
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
  } = req.body;
  const owner = req.user._id;
  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
    owner,
  })
    .then((movie) => {
      res.status(200).send({ data: movie });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new Error400('Переданы некорректные данные при создании фильма'));
      } else {
        next(new Error500('Что-то пошло не так :('));
      }
    });
};

const deleteMovie = (req, res, next) => {
  // найдём фильм и удалим его
  Movie.findById(req.params.movieId)
    .orFail(() => {
      // Если мы здесь, значит запрос в базе ничего не нашёл
      // Бросаем ошибку и попадаем в catch
      throw new Error404('Фильм с заданным ID отсутствует в базе данных');
    })
    .then((movie) => {
      // Надо проверить может ли пользователь удалить этот фильм
      // user._id приходит с типом string, а movie.owner._id приходит с форматом object
      // необходимо привести к строке
      if (req.user._id !== movie.owner.toString()) {
        // Бросаем ошибку, что пользователь не может это делать
        return next(new Error403('Нельзя удалить чужой фильм'));
      }
      return movie.remove()
        .then(() => {
          res.status(200).send({ message: `Фильм с id ${movie.id} успешно удалён!` });
        });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new Error400('Ошибка в формате ID фильма'));
      } else if (err.statusCode === ERROR_NOT_FOUND) {
        next(err);
      } else {
        next(new Error500('Что-то пошло не так :('));
      }
    });
};

module.exports = {
  getAllMovies, createMovie, deleteMovie,
};
