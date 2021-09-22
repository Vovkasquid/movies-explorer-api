const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const {
  getCurrentUser, updateUserInfo,
} = require('../controllers/users');

router.get('/users/me', getCurrentUser);

router.patch('/users/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    email: Joi.string().email().required(),
  }),
}), updateUserInfo);

module.exports = router;
