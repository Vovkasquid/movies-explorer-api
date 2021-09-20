const router = require("express").Router();
const { celebrate, Joi } = require("celebrate");
const {
  getAllMovies, createMovie, deleteMovie,
} = require("../controllers/movies");
const urlValidator = require("../utils/urlValidator");

/* # возвращает все сохранённые пользователем фильмы
GET /movies

# создаёт фильм с переданными в теле
# country, director,duration, year, description, image, trailer, nameRU,nameEN и thumbnail, movieId
POST /movies

# удаляет сохранённый фильм по id
DELETE /movies/movieId
*/

router.get("/movies", getAllMovies);


router.post("/movies", celebrate({
  body: Joi.object().keys({
    country: Joi.string().required(),
    director: Joi.string().required(),
    duration: Joi.number().required(),
    year: Joi.string().required(),
    description: Joi.string().required(),
    image: Joi.string().required().custom(urlValidator),
    trailer: Joi.string().required().custom(urlValidator),
    nameRU: Joi.string().required(),
    nameEN: Joi.string().required(),
    thumbnail: Joi.string().required().custom(urlValidator),
    movieId: Joi.number().required(),
  }),
}), createMovie);

router.delete("/movies/:cardId", celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().length(24).hex(),
  }),
}), deleteMovie);

module.exports = router;
