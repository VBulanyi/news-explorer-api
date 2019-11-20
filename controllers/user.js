const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const constants = require('../constants');

const { BadRequestError, NotFoundError, ValidationError } = require('../errors/error-handler');

const { NODE_ENV, JWT_SECRET } = process.env;

// возвращает информацию о пользователе
function getUserById(req, res, next) {
  User.find({ _id: req.user._id }, { _id: 0, __v: 0 })
    .then((user) => {
      if (!user.length > 0) {
        throw new NotFoundError(constants.USER_IS_NOT_AUTHORISED);
      }
      res.send({ data: user });
    })
    .catch(next);
}

// создаёт юзера
function createUser(req, res, next) {
  const {
    email, password, name,
  } = req.body;
  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      email, password: hash, name,
    }))
    .then((user) => res.send({
      _id: user._id,
      email: user.email,
      name: user.name,
    }))
    .catch(() => { throw new BadRequestError(constants.WRONG_DATA); })
    .catch(next);
}

// Котроллер входа
function signin(req, res, next) {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      if (!user) {
        throw new ValidationError(constants.WRONG_DATA_OR_PASSWORD);
      }
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret', { expiresIn: '2 days' },
      );
      res.cookie('jwt', token, {
        maxAge: 3600000,
        httpOnly: true,
        sameSite: true,
      })
        .end();
    })
    .catch(next);
}

module.exports = {
  getUserById, createUser, signin,
};
