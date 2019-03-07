const fs = require('fs');
const jwt = require('jsonwebtoken');
var privateKEY = fs.readFileSync('./private.key', 'utf8');
var publicKEY = fs.readFileSync('./public.key', 'utf8');

module.exports = { 
  sign: (payload) => {
    var signOptions = {
      expiresIn: "30d",
      algorithm: "RS256"
    };
    return jwt.sign(payload, privateKEY, signOptions);
  },
  verify: (token) => {
    var verifyOptions = {
      maxAge: "30d",
      algorithm: ["RS256"]
    };
    try {
      return jwt.verify(token, publicKEY, verifyOptions);
    } catch (err) {
      return false;
    }
  },
  decode: (token) => {
    return jwt.decode(token, { complete: true });
  }
}