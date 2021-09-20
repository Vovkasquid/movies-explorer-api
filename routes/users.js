const router = require("express").Router();
const { celebrate, Joi } = require("celebrate");
const urlValidator = require("../utils/urlValidator");
const {
  getAllUsers, getUser, getCurrentUser, updateUserInfo, updateUserAvatar,
} = require("../controllers/users");

/*
# возвращает информацию о пользователе (email и имя)
GET /users/me

# обновляет информацию о пользователе (email и имя)
PATCH /users/me
*/


router.get("/users/me", getCurrentUser);

router.patch("/users/me", celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    password: Joi.string().required(),
    email: Joi.string().email().required(),
  }),
}), updateUserInfo);

router.patch("/users/me/avatar", celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().required().custom(urlValidator),
  }),
}), updateUserAvatar);

module.exports = router;
