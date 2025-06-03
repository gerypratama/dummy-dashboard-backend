const express = require('express')
const router = express.Router()

router.use('/login', require('./login'))
router.use('/register', require('./register'))
router.use('/refresh', require('./refresh'))

module.exports = router