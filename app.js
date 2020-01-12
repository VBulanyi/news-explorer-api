require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors')
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

const { NODE_ENV, DB_HOST } = process.env;
const { DEV_DB_HOST } = require('./config');

const router = require('./routes/router');
const { signin, createUser, logout } = require('./controllers/user');

const app = express();
app.set('trust proxy', 1);
app.use(cors(({
  credentials: true,
  origin: true,
})));


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use(bodyParser.json());
app.use(helmet());
app.use(limiter);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

mongoose.connect(NODE_ENV === 'production' ? DB_HOST : DEV_DB_HOST, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

app.listen(PORT, () => {
  console.log(`You listen potr ${PORT}`);
});

app.use(express.static(path.join(__dirname, 'public')));

app.use(requestLogger);

app.use('/', router);

app.post('/signup', celebrate({
  body: Joi.object().keys({
    password: Joi.string().required(),
    email: Joi.string().required().email(),
    name: Joi.string().required().min(2).max(30),
  }),
}), createUser);

app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), signin);

app.post('/logout', logout)

app.use('*', (req, res, next) => {
  next(new NotFoundError(constants.NOT_FOUND_PAGE));
});

app.use(errorLogger);
app.use(errors());

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  res.status(err.statusCode ? err.statusCode : 500)
    .send({ message: err.message });
});
