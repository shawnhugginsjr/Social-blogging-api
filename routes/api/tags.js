var router = require('express').Router()
var mongoose = require('mongoose')
var Article = mongoose.model('Article')

// Find all unique Tags across all Articles
router.get('/', function (req, res, next) {
  Article.find().distinct('tagList').then(function (tags) {
    res.json({ tags: tags })
  }).catch(next)
})

module.exports = router