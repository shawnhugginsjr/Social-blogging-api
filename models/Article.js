const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')
const slug = require('slug')
const User = mongoose.model('User')

const ArticleSchema = new mongoose.Schema({
  slug: { type: String, lowercase: true, unique: true },
  title: String,
  description: String,
  body: String,
  favoritesCount: { type: Number, default: 0 },
  tagList: [{ type: String }],
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }]
}, {
    timestamps: true
  })

ArticleSchema.plugin(uniqueValidator, { message: 'is already taken' })

// Generate a unqiue sluge for an Article
ArticleSchema.methods.generateSlug = function () {
  this.slug = slug(this.title) + '-' + (Math.random() * Math.pow(36, 6) | 0).toString(36)
}

// Returns JSON of Article
ArticleSchema.methods.toJSONFor = function (user) {
  return {
    slug: this.slug,
    title: this.title,
    description: this.description,
    body: this.body,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    tagList: this.tagList,
    favoritesCount: this.favoritesCount,
    favorited: user ? user.isFavorite(this._id) : false,
    author: this.author.toProfileJSONFor(user)
  }
}

// Update favorite count by querying the number of favorites
ArticleSchema.methods.updateFavoriteCount = function () {
  const article = this
  return User.count({ favorites: { $in: [this._id] } }).then(function (count) {
    article.favoritesCount = count
    return article.save()
  })
}

ArticleSchema.pre('validate', function (next) {
  if (!this.slug) { this.generateSlug() }
  next()
})

mongoose.model('Article', ArticleSchema);