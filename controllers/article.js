const Aritcle = require('../models/article');
const { BadRequestError, NotFoundError } = require('../errors/error-handler');

// Возвращает все статьи
function getAllArticles(req, res, next) {
  Aritcle.find({})
  .populate('user')
  .then((article) => {
    if (!article.length > 0) {
      throw new NotFoundError('Нет сохранённых статей');
    } else res.send({ data: article });
  })
  .catch(next);
}

function createArticle(req, res, next) {
  const { keyword, title, text, date, source, link, image } = req.body;
  Aritcle.create({ keyword, title, text, date, source, link, image, owner: req.user._id })
  .then((article) => res.send({ data: article }))
  .catch(() => {throw new BadRequestError('Не верные данные'); })
  .catch(next);
}

// Удаляет статью
function deleteArticle(req, res, next) {
  console.log(req.params.id)
  console.log(req.user._id)
  Aritcle.findOneAndDelete({ _id: req.params.id, owner: req.user._id })
    .then((article) => {
      if (!article) {
        throw new NotFoundError('Вы не можете удалить эту статью');
      } else res.send({ data: article });
    })
    .catch(next);
}

module.exports = {
  getAllArticles, createArticle, deleteArticle
};
