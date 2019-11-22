const Aritcle = require('../models/article');
const {
  BadRequestError, NotFoundError, ValidationError, ServerError,
} = require('../errors/error-handler');
const constants = require('../constants');

// Возвращает все статьи
function getAllArticles(req, res, next) {
  Aritcle.find({})
    .populate('user')
    .then((article) => {
      if (!article.length > 0) {
        throw new NotFoundError(constants.NO_SAVED_ARTICLES);
      } else res.send({ data: article });
    })
    .catch(next);
}

function createArticle(req, res, next) {
  const {
    keyword, title, text, date, source, link, image,
  } = req.body;
  Aritcle.create({
    keyword, title, text, date, source, link, image, owner: req.user._id,
  })
    .then((article) => res.send({ data: article }))
    .catch(() => { throw new BadRequestError(constants.WRONG_DATA); })
    .catch(next);
}

function deleteArticle(req, res, next) {
  Aritcle.findById(req.params.id).select('+owner')
    .then((article) => {
      if (!article) throw new NotFoundError(constants.NO_ARTICLE);
      if (JSON.stringify(article.owner) !== JSON.stringify(req.user._id)) {
        throw new ValidationError(constants.NO_RIGHTS);
      }
      Aritcle.deleteOne(article)
        .then(() => res.send(article))
        .catch(() => { throw new ServerError(constants.DELETE_ERROR); });
    })
    .catch(next);
}

module.exports = {
  getAllArticles, createArticle, deleteArticle,
};
