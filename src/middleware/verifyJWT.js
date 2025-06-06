const jwt = require('jsonwebtoken')
const { ACCESS_TOKEN_SECRET } = require('../constants')

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization

  if (!authHeader?.startsWith("Bearer ")) return res.sendStatus(401)

  const token = authHeader.split(' ')[1]
  jwt.verify(token, ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) return res.sendStatus(403)
    req.user = decoded.user_info.username
    req.role = decoded.user_info.role
    next()
  })
}

module.exports = verifyJWT