const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const { errors, celebrate, Joi } = require("celebrate");
const helmet = require("helmet");
const Error404 = require("./errors/Error404");
const limiter = require("./utils/limiter");
const { requestLogger, errorLogger } = require("./middlewares/logger");
const corsMiddleware = require("./middlewares/cors-defend");

const app = express();

// Подключаем роуты
const usersRoute = require("./routes/users");
const moviesRoute = require("./routes/ movies");
const { createUser } = require("./controllers/users");
const checkLogin = require("./controllers/login");
const errorsHandler = require("./middlewares/errorsHandler");
const auth = require("./middlewares/auth");

//  задаём порт (ведь мы его вроде как не передаем в окружение)
const { PORT = 3001 } = process.env;

// подключаемся к серверу mongo
mongoose.connect("mongodb://localhost:27017/bitfilmsdb", {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

// подключаем мидлвары, роуты и всё остальное...
// bodyparser теперь часть экспресса, поэтому подключаем его так
app.use(express.json());

// Подключаем мидлвару для работы с CORS
app.use(corsMiddleware);

// Включаем логгер запросов
app.use(requestLogger);

// Подключаем ограничитель запросов
app.use(limiter);

// Включаем защиту заголовков
app.use(helmet());


// Маршруты для регистрации и авторизации
app.post("/signin", celebrate({
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
}), checkLogin);
app.post("/signup", celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    email: Joi.string().email().required(),
    password: Joi.string().required().min(8).max(35),
  }),
}), createUser);
// Защищаем пути авторизацией
app.use(auth);
// Прописываем маршруты
app.use("/", usersRoute);
app.use("/", moviesRoute);
// Обработаем некорректный маршрут и вернём ошибку 404
app.use("*", (req, res, next) => {
  next(new Error404(`Страницы по адресу ${req.baseUrl} не существует`));
});
// Подключаем логгер ошибок
app.use(errorLogger);
// Добавим обработчик ошибок для celebrate
app.use(errors());
// Добавим обработчик ошибок
app.use(errorsHandler);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
