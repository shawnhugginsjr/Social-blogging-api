const mongoose = require('mongoose')
const router = require('express').Router()
const passport = require('passport')
const User = mongoose.model('User')
const auth = require('../auth')

// Sign up a new User
router.post('/users', function (req, res, next) {
  const newUser = new User()

  newUser.username = req.body.user.username
  newUser.email = req.body.user.email
  newUser.setPassword(req.body.user.password)

  newUser.save().then(function () {
    res.json({ user: user.toAuthJSON() })
  }).catch(next)
})

// Login a User
router.post('/users/login', function (req, res, next) {
  if (!req.body.user.email) {
    return res.status(422).json({ errors: { email: "can't be blank" } })
  }
  if (!req.body.user.password) {
    return res.status(422).json({ errors: { password: "can't be blank" } })
  }

  passport.authenticate('local', { session: false }, function (err, user, info) {
    // This function is the callback for the local passport strategy
    if (err) { return next(err) }

    if (user) {
      user.token = user.generateJWT()
      return res.json({ user: user.toAuthJSON() })
    } else {
      return res.status(422).json(info)
    }
  })(req, res, next)
})

// Update the current user
router.put('/user', auth.required, function (req, res, next) {
  User.findById(req.payload.id).then(function (user) {
    if (!user) { return res.sendStatus(401) }

    // Only update fields with values provided
    if (typeof req.body.user.username !== 'undefined') {
      user.username = req.body.user.username
    }
    if (typeof req.body.user.email !== 'undefined') {
      user.email = req.body.user.email
    }
    if (typeof req.body.user.image !== 'undefined') {
      user.image = req.body.user.image
    }
    if (typeof req.body.user.bio !== 'undefined') {
      user.bio = req.body.user.bio
    }
    if (typeof req.body.user.password !== 'undefined') {
      user.setPassword(req.body.user.password)
    }

    return user.save().then(function () {
      return res.json({ user: user.toAuthJSON() })
    })
  }).catch(next)
})

// Get current user's auth payload from their JWT
router.get('/user', auth.required, function (req, res, next) {
  User.findById(req.payload.id).then(function (user) {
    // This case should only happens when attempting to use a JWT for a
    // deleted User
    if (!user) { return res.sendStatus(401) }

    return res.json({ user: user.toAuthJSON() })
  }).catch(next)
})

module.exports = router