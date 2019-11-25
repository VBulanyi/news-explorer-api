const router = require('express').Router();

const userRouter = require('./user');
const articleRouter = require('./article');

router.use(userRouter);
router.use(articleRouter);

module.exports = router;
