const express = require('express')
const verifyJWT = require('../../middleware/verifyJWT')
const router = express.Router()

router.use('/auth', require('./auth/index'))
router.use(verifyJWT)
router.use('/dashboard', require('./dashboard/index'))

module.exports = router