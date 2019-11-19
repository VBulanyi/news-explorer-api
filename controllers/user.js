const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const { BadRequestError, NotFoundError, ValidationError } = require('../errors/error-handler');

const { NODE_ENV, JWT_SECRET } = process.env;

//возвращает информацию о пользователе
function getUserById(req, res, next) {
  User.find({ _id: req.user._id }, {email:1, name:1})
    .then((user) => {
      if (!user.length > 0) {
        throw new NotFoundError('Пользователь не зарегистрирован');
      }
      res.send({ data: user });
    })
    .catch(next);
}

//создаёт юзера
function createUser(req, res, next) {
  const {
    email, password, name
  } = req.body;
  bcrypt.hash(password, 10)
  .then((hash) => User.create({
    email, password: hash, name,
  }))
  .then((user) => res.send({ data: user}))
  .catch(() => { throw new BadRequestError('не верные данные'); } )
  .catch(next);
}

// Котроллер входа
function signin(req, res, next) {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      if (!user) {
        throw new ValidationError('Не верный логин или пароль');
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