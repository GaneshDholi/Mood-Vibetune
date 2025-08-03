const express = require("express")
const trackRoutes = require("./routes/trackRoutes")
const cors = require('cors')


const app = express();
app.use(express.json())
app.use(cors())

app.use('/api', trackRoutes)


module.exports = app;