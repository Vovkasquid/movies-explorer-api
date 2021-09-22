const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const { errors } = require('celebrate');
const helmet = require('helmet');
const Error404 = require('./errors/Error404');
const limiter = require('./utils/limiter');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const corsMiddleware = require('./middlewares/cors-defend');

const app = express();

// Подключаем роуты
const usersRoute = require('./routes/users');
const moviesRoute = require('./routes/ movies');
const authRoute = require('./routes/auth');
const errorsHandler = require('./middlewares/errorsHandler');
const auth = require('./middlewares/auth');

//  задаём порт (ведь мы его вроде как не передаем в окружение)
const { PORT = 3002 } = process.env;

// подключаемся к серверу mongo
mongoose.connect('mongodb://localhost:27017/moviesdb', {
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

// Прописываем маршруты
app.use(authRoute);
// Защищаем пути авторизацией
app.use(auth);
app.use(usersRoute);
app.use(moviesRoute);
// Обработаем некорректный маршрут и вернём ошибку 404
app.use('*', (req, res, next) => {
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
