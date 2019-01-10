const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const mongoose = require('mongoose')
const User = mongoose.model('User')

/* Authenticates the User.
JSON request body
{
  "user": {
    "email": "email@example.com".
    "password": "password"
  }
}*/
passport.use(new LocalStrategy({
  usernameField: 'user[email]',
  passwordField: 'user[password]'
}, function(email, password, done) {
  User.findOne({email: email}).then(function(user){
    if(!user || !user.isPasswordCorrect(password)){
      return done(null, false, {errors: {'email or password': 'is invalid'}})
    }
    return done(null, user);
  }).catch(done)
}))