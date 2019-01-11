const mongoose = require('mongoose')
const router = require('express').Router()
const User = mongoose.model('User')
const Article = mongoose.model('Article')
const passport = require('passport')
const auth = require('../auth')
const Comment = mongoose.model('Comment')

// Create a new Article
router.post('/', auth.required, function (req, res, next) {
  User.findById(req.payload.id).then(function (user) {
    if (!user) { return res.sendStatus(401) }
    const article = new Article(req.body.article)
    article.author = user

    return article.save().then(function () {
      return res.json({ article: article.toJSONFor(user) })
    })
  }).catch(next)
})

// Preload req.article for any routes with paramater :slug
router.param('slug', function (req, res, next, slug) {
  Article.findOne({ slug: slug })
    .populate('author')
    .then(function (article) {
      if (!article) { return res.sendStatus(404) }
      req.article = article
      next()
    }).catch(next)
})

// Fetch an article using a slug
router.get('/:slug', auth.optional, function (req, res, next) {
  Promise.all([
    req.payload ? User.findById(req.payload.id) : null,
    req.article.populate('author').execPopulate()
  ]).then(function (results) {
    const user = results[0]
    res.json({ article: req.article.toJSONFor(user) })
  }).catch(next)
})

// Update an Article using a slug
router.put('/:slug', auth.required, function (req, res, next) {
  User.findById(req.payload.id).then(function (user) {
    // Confirm current user is author of the article
    if (req.article.author._id.toString() === req.payload.id.toString()) {
      if (typeof req.body.article.title !== 'undefined') {
        req.article.title = req.body.article.title
      }
      if (typeof req.body.article.description !== 'undefined') {
        req.article.description = req.body.article.description
      }
      if (typeof req.body.article.body !== 'undefined') {
        req.article.body = req.body.article.body
      }

      req.article.save().then(function (article) {
        res.json({ article: article.toJSONFor(user) })
      }).catch(next)
    } else {
      res.sendStatus(403)
    }
  })
})

// Delete an article using a slug
router.delete('/:slug', auth.required, function (req, res, next) {
  User.findById(req.payload.id).then(function () {
    if (req.article.author._id.toString() === req.payload.id.toString()) {
      req.article.remove().then(function () {
        res.sendStatus(204)
      })
    } else {
      res.sendStatus(403)
    }
  })
})

// Favorite an article
router.post('/:slug/favorite', auth.required, function (req, res, next) {
  User.findById(req.payload.id).then(function (user) {
    if (!user) { return res.sendStatus(401) }

    return user.favoriteArticle(req.article._id).then(function () {
      return req.article.updateFavoriteCount().then(function (article) {
        return res.json({ article: article.toJSONFor(user) })
      })
    })
  }).catch(next)
})

// Unfavorite an article
router.delete('/:slug/favorite', auth.required, function (req, res, next) {
  User.findById(req.payload.id).then(function (user) {
    if (!user) { return res.sendStatus(401) }

    return user.unfavoriteArticle(req.article._id).then(function () {
      return req.article.updateFavoriteCount().then(function (article) {
        return res.json({ article: article.toJSONFor(user) })
      })
    })
  }).catch(next)
})

// Get all comments of an Article
router.get('/:slug/comments', auth.optional, function (req, res, next) {
  Promise.resolve(req.payload ? User.findById(req.payload.id) : null).then(function (user) {
    return req.article.populate({
      path: 'comments',
      populate: {
        path: 'author'
      },
      options: {
        sort: {
          createdAt: 'desc'
        }
      }
    }).execPopulate().then(function (article) {
      return res.json({
        comments: req.article.comments.map(function (comment) {
          return comment.toJSONFor(user)
        })
      })
    })
  }).catch(next)
})

// Add a comment to an Article
router.post('/:slug/comments', auth.required, function (req, res, next) {
  User.findById(req.payload.id).then(function (user) {
    if (!user) { return res.sendStatus(401) }

    const comment = new Comment(req.body.comment)
    comment.article = req.article
    comment.author = user

    return comment.save().then(function () {
      //req.article.comments.push(comment)
      req.article.comments = req.article.comments.concat([comment])

      return req.article.save().then(function (article) {
        res.json({ comment: comment.toJSONFor(user) })
      })
    })
  }).catch(next)
})

router.param('comment', function (req, res, next, id) {
  Comment.findById(id).then(function (comment) {
    if (!comment) { return res.sendStatus(404) }
    req.comment = comment
    next()
  }).catch(next)
})

// Delete an comment from an Article
router.delete('/:slug/comments/:comment', auth.required, function (req, res, next) {
  if (req.comment.author.toString() === req.payload.id.toString()) {
    req.article.comments.remove(req.comment._id)
    req.article.save()
      .then(Comment.find({ _id: req.comment._id }).remove().exec())
      .then(function () {
        res.sendStatus(204)
      })
  } else {
    res.sendStatus(403)
  }
})

module.exports = router