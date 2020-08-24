'use strict'

const mongoose = require('mongoose')
const mongoDB = process.env.MONGO_URI
const app = require('./app')
const port = process.env.PORT || 5000

//================================================
// Connect to Mongo
//================================================
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('===== MongoDB connected ====='))
    .catch(err => console.error(err))


//================================================
// Start server
//================================================
app.listen(port, () => console.log(`\n===== Server started on port ${port} =====`))
