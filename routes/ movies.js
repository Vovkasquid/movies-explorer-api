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
    name: Joi.string().min(2).max(30),
    link: Joi.string().required().custom(urlValidator),
  }),
}), createMovie);

router.delete("/movies/:cardId", celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().length(24).hex(),
  }),
}), deleteMovie);

module.exports = router;
