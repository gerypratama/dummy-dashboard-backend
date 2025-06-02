const fs = require('fs')
const fsPromises = require('fs').promises
const path = require('path')
const { format } = require('date-fns')
const { v4: uuid } = require('uuid')

const logEvents = async (msg, fileName) => {
  const dateTime = format(new Date(), 'yyyyMMdd\tHH:mm:ss')
  const logItem = `${dateTime}\t${uuid()}\t${msg}\n`

  try {
    const logDir = path.join(__dirname, '..', '..', 'logs')
    if (!fs.existsSync(logDir)) {
      await fsPromises.mkdir(logDir)
    }
    await fsPromises.appendFile(path.join(logDir, fileName), logItem)
  } catch (error) {
    console.error(error);
  }
}

const logger = (req, res, next) => {
  logEvents(`${req.method}\t${req.headers.origin}\t${req.url}`, 'req.log')
  console.log(`${req.method} ${req.path}`)
  next()
}

module.exports = { logger, logEvents }