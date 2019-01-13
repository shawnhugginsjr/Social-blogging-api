# Social-blogging-api

A Node.js and mongoDB backed API that supports CRUD operation of articles along with the creation of Users. The API is intended to be consumed by the [Social-blogging-client](https://github.com/shawnhugginsjr/Social-blogging-client).

## Getting started

To get the Node server running locally:

- Clone this repo
- `npm install` to install all required dependencies
- Install MongoDB Community Edition ([instructions](https://docs.mongodb.com/manual/installation/#tutorials)) and run it by executing `mongod`
- `npm run dev` to start the local server

## General Functionality

- Authenticate users via JSON Web tokens
- CRU* users (sign up & login users, update user profiles)
- CRUD Articles
- CR*D Comments on articles
- Favorite articles
- Follow other users
- GET a paginated lists of articles, can be sorted by tags and favorited authors

