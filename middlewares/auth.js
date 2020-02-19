const jwt = require('jsonwebtoken');

const { NODE_ENV, JWT_SECRET } = process.env;
const { DEV_SECRET_KEY } = require('../config');

const constants = require('../constants');

const handleAuthError = (res) => {
  res
    .status(401)
    .send({ message: constants.AUTHORISATION_NEEDED });
};

// eslint-disable-next-line consistent-return
module.exports = (req, res, next) => {
  const token = req.cookies.jwt;
  let payload;

  try {
    payload = jwt.verify(token, NODE_ENV === 'production' ? JWT_SECRET : DEV_SECRET_KEY);
  } catch (err) {
    return handleAuthError(res);
  }
  req.user = { _id: payload._id };
  next();
};
