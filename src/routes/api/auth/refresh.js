const express = require('express')
const { handleRefreshToken } = require('../../../controller/authController')
const router = express.Router()

router.get('/', handleRefreshToken)

module.exports = router