# Social-blogging-api

A Node.js and mongoDB backed API that supports CRUD operation of articles along with the creation of Users. The API is intended to be consumed by the [Social-blogging-client](https://github.com/shawnhugginsjr/Social-blogging-client).

## Getting started

To get the Node server running locally:

- Clone this repo
- `npm install` to install all required dependencies
- Install MongoDB Community Edition ([instructions](https://docs.mongodb.com/manual/installation/#tutorials)) and run it by executing `mongod`
- `npm run dev` to start the local server

## General Functionality

- Authenticate users via JWT (login/signup pages + logout button on settings page)
- CRU* users (sign up & settings page - no deleting required)
- CRUD Articles
- CR*D Comments on articles (no updating required)
- GET and display paginated lists of articles
- GET Articles by tags and favorited authors
- Favorite articles
- Follow other users
