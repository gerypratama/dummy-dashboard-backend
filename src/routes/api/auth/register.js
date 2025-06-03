const express = require('express')
const { handleRegister } = require('../../../controller/authController')
const router = express.Router()

router.post('/', handleRegister)

module.exports = router