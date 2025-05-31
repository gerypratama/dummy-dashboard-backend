const express = require('express')
const app = express()
const PORT = 3500

app.get('/', (req, res) => {
  res.send(`App is up and running on port ${PORT}`)
})

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`))