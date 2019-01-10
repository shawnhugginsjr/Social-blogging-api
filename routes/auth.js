const jwt = require('express-jwt')
const secret = require('../config').secret

// Retrieves JWT from header if it exists
function getTokenFromHeader(req) {
  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Token') {
    return req.headers.authorization.split(' ')[1];
  }
  return null;
}

const auth = {
  // Required for logged in User routes
  required: jwt({
    secret: secret,
    userProperty: 'payload',
    getToken: getTokenFromHeader
  }),
  // Optional for public facing routes
  optional: jwt({
    secret: secret,
    userProperty: 'payload',
    getToken: getTokenFromHeader,
    credentialsRequired: false
  })
}

module.exports = auth