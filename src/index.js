const cors = require('cors')
const express = require('express')
const cookieParser = require('cookie-parser')
const { logger } = require('./middleware/logEvents')
const errorLogger = require('./middleware/errorLogger')
const corsOptions = require('./config/corsOptions')
const credentials = require('./middleware/credentials')
const app = express()
const PORT = process.env.PORT || 3500

app.use(logger)
app.use(credentials)
app.use(cors(corsOptions))
app.use(express.json())
app.use(cookieParser())
app.use('/', require('./routes/root'))
app.use('/api/auth', require('./routes/api/auth'))
app.use((req, res) => {
  res.status(404);
  res.json({ error: '404 Not Found' })
})
app.use(errorLogger)

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`))