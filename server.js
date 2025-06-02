const express = require('express')
const { logger } = require('./middleware/logEvents')
const errorLogger = require('./middleware/errorLogger')
const app = express()
const PORT = process.env.PORT || 3500

app.use(logger)
app.use(express.json())
app.use('/', require('./routes/root'))
app.use((req, res) => {
  res.status(404);
  res.json({ error: '404 Not Found' })
})
app.use(errorLogger)

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`))