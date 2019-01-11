const mongoose = require('mongoose')
const router = require('express').Router()
const User = mongoose.model('User')
const auth = require('../auth')

// Preload req.profile on all routes matching profiles/:username
router.param('username', function (req, res, next, username) {
  User.findOne({ username: username }).then(function (user) {
    if (!user) { return res.sendStatus(404) }
    req.profile = user
    next()
  }).catch(next)
})

// Sends the profile of :username to the client
router.get('/:username', auth.optional, function (req, res, next) {
  if (req.payload) {
    User.findById(req.payload.id).then(function (user) {
      if (!user) { return res.json({ profile: req.profile.toProfileJSONFor(false) }) }
      res.json({ profile: req.profile.toProfileJSONFor(user) })
    })
  } else {
    // Currently isn't a logged in user
    res.json({ profile: req.profile.toProfileJSONFor(false) })
  }
})

module.exports = router