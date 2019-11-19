const userRouter = require('express').Router();
const auth = require('../middlewares/auth');

const {
  getUserById,
} = require('../controllers/user');

// роут вернуть юзера по id

userRouter.get('/users/me', auth, getUserById);


module.exports = userRouter;

