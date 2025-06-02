const { logEvents } = require('./logEvents')

const errorLogger = (err, req, res) => {
  logEvents(`${err.name}: ${err.message}`, 'error.log')
  res.status(500).send(err.message)
}

module.exports = errorLogger