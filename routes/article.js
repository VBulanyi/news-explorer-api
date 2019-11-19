const articleRouter = require('express').Router();
const auth = require('../middlewares/auth');

const {
  getAllArticles, createArticle, deleteArticle
} = require('../controllers/article');

//возвращает все сохранённые статьи
articleRouter.get('/articles', auth, getAllArticles)


//создаёт статью с переданными в теле keyword, title, text, date, source, link и image
articleRouter.post('/articles', auth, createArticle);

//удаляет статью по _id
articleRouter.delete('/articles/:id', auth, deleteArticle);

module.exports = articleRouter;