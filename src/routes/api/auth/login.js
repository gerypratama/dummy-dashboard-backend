const express = require('express')
const { handleLogin } = require('../../../controller/authController')
const router = express.Router()

router.post('/', handleLogin)

module.exports = router