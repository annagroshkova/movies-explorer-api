require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const helmet = require('helmet');
const { celebrate, errors, Joi } = require('celebrate');
const usersRouter = require('./routes/users');
const moviesRouter = require('./routes/movies');
const { login, createUser } = require('./controllers/users');
const auth = require('./middlewares/auth');
const { AppError, STATUS_NOT_FOUND } = require('./errors/AppError');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const { PORT = 3000, DB_URL = 'mongodb://127.0.0.1:27017/bitfilmsdb' } = process.env;

const app = express();

mongoose.connect(DB_URL);

const allowedCors = [
  'https://anna.nomoredomains.rocks',
  'http://anna.nomoredomains.rocks',
  'http://localhost:3000',
];

app.use((req, res, next) => {
  const { origin } = req.headers;

  if (allowedCors.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }

  const { method } = req;

  if (method === 'OPTIONS') {
    const requestHeaders = req.headers['access-control-request-headers'];
    res.header('Access-Control-Allow-Headers', requestHeaders);
    const DEFAULT_ALLOWED_METHODS = 'GET,HEAD,PUT,PATCH,POST,DELETE';
    res.header('Access-Control-Allow-Methods', DEFAULT_ALLOWED_METHODS);
    res.header('Access-Control-Max-Age', '86400');
    return res.end();
  }

  next();
});

app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(requestLogger);

app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});

app.post(
  '/signin',
  celebrate({
    body: {
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    },
  }),
  login,
);

app.post(
  '/signup',
  celebrate({
    body: {
      email: Joi.string().email().required(),
      password: Joi.string().required(),
      name: Joi.string().min(2).max(30).optional(),
    },
  }),
  createUser,
);

app.use(auth);

app.use('/users', usersRouter);
app.use('/movies', moviesRouter);

app.use((req, res, next) => next(new AppError('Путь не найден', STATUS_NOT_FOUND)));

app.use(errorLogger);
app.use(errors());

app.use((err, req, res, _next) => {
  const { statusCode = 500, message } = err;
  res.status(statusCode).send({ message: message || 'На сервере произошла ошибка' });
});

app.listen(PORT);
console.log(`listening on http://localhost:${PORT}`);
