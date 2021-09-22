const validator = require('validator');
const Error400 = require('../errors/Error400');

const urlCheckMethod = (value) => {
  const result = validator.isURL(value);
  if (result) {
    return value;
  }
  // Если условие некорректно, то бросаем ошибку 400
  throw new Error400('Введённый URL некорректный');
};

module.exports = urlCheckMethod;
