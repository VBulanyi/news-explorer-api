require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const bodyParser = require('body-parser');

const { PORT = 3000 } = process.env;
const { celebrate, Joi } = require('celebrate');
const { errors } = require('celebrate');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const { NotFoundError } = require('./errors/error-handler');
const constants = require('./constants');

const app = express();
const router = require('./routes/router');

const { signin, createUser } = require('./controllers/user');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use(bodyParser.json());
app.use(helmet());
app.use(limiter);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

mongoose.connect(process.env.DB_HOST, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
});

app.listen(PORT, () => {
  console.log(`You listen potr ${PORT}`);
});

app.use(express.static(path.join(__dirname, 'public')));

app.use(requestLogger);

app.use('/', router);

app.post('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), createUser);

app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), signin);

app.use('*', (req, res, next) => {
  next(new NotFoundError(constants.NOT_FOUND_PAGE));
});

app.use(errorLogger);
app.use(errors());

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // если у ошибки нет статуса, выставляем 404
  const { statusCode = 404, message = 'dd' } = err;

  res
    .status(statusCode)
    .send({
      // проверяем статус и выставляем сообщение в зависимости от него
      message: statusCode === 500
        ? constants.SERVER_ERROR
        : message,
    });
});
