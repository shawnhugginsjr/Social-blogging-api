const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const secret = require('../config').secret

const UserSchema = new mongoose.Schema({
  username: { type: String, lowercase: true, unique: true, required: [true, "can't be blank"], match: [/^[a-zA-Z0-9]+$/, 'is invalid'], index: true },
  email: { type: String, lowercase: true, unique: true, required: [true, "can't be blank"], match: [/\S+@\S+\.\S+/, 'is invalid'], index: true },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Article' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  bio: String,
  image: String,
  hash: String,
  salt: String
}, {
    timestamps: true
  })

// Mongoose lacks built-in validation for unique fields, so a
// plugin is required
UserSchema.plugin(uniqueValidator, { message: 'already in use' })

// Converts the password into a hash for the User
UserSchema.methods.setPassword = function (password) {
  this.salt = crypto.randomBytes(16).toString('hex')
  this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex')
}

// Checks if the argument password is the User's password
UserSchema.methods.isPasswordCorrect = function (password) {
  const hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex')
  return hash === this.hash
}

// Generate JSON webtoken for User
UserSchema.methods.generateJWT = function () {
  const today = new Date()
  const exp = new Date(today)
  exp.setDate(today.getDate() + 60)

  return jwt.sign({
    id: this._id,
    username: this.username,
    exp: parseInt(exp.getTime() / 1000),
  }, secret)
}

// JSON sent to client only for User authentication.
// Only the logged in user should recieve this
UserSchema.methods.toAuthJSON = function () {
  return {
    username: this.username,
    email: this.email,
    token: this.generateJWT(),
    bio: this.bio,
    image: this.image
  }
}

// Returns User profile information as JSON
UserSchema.methods.toProfileJSONFor = function (user) {
  console.log(this._id)
  return {
    username: this.username,
    bio: this.bio,
    image: this.image || 'https://t4.ftcdn.net/jpg/02/15/84/43/240_F_215844325_ttX9YiIIyeaR7Ne6EaLLjMAmy4GvPC69.jpg',
    following: user ? user.isFollowing(this._id) : false
  }
}

// Favorite an article by id
UserSchema.methods.favoriteArticle = function (id) {
  if (this.favorites.indexOf(id) === -1) {
    // mongodb no longer supports $pushAll, so Array.push can't be used
    this.favorites = this.favorites.concat([id])
  }
  console.log('before save of favorite')
  return this.save()
}

// Unfavorite an article by id
UserSchema.methods.unfavoriteArticle = function (id) {
  this.favorites.remove(id)
  return this.save()
}

// Checks if an article is in a User's favorites
UserSchema.methods.isFavorite = function (id) {
  return this.favorites.some(function (favoriteId) {
    return favoriteId.toString() === id.toString()
  })
}

// Follow another user
UserSchema.methods.followUser = function (id) {
  console.log('current follower list')
  console.log(this.following)
  if (this.following.indexOf(id) === -1) {
    console.log('adding follow to list')
    this.following = this.following.concat([id])
    console.log(this.following)
  }
  console.log('before follow user')
  return this.save()
}

// Unfollow another user
UserSchema.methods.unFollowUser = function (id) {
  this.following.remove(id)
  return this.save()
}

// Check if User is follwing another user
UserSchema.methods.isFollowing = function (id) {
  return this.following.some(function (followId) {
    return followId.toString() === id.toString()
  })
}

mongoose.model('User', UserSchema)