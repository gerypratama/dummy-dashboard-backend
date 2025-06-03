const express = require('express')
const { getStats } = require('../../../controller/dashboardController')
const router = express.Router()

router.get('/', getStats)

module.exports = router