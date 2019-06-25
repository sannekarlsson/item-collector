'use strict'

const mongoose = require('mongoose')
const config = require('./config')
const mongoDB = process.env.MONGO_URI || config.MONGO_URI
const app = require('./api')
const port = process.env.PORT || 5000

//================================================
// Connect to Mongo
//================================================
mongoose.connect(mongoDB, { useNewUrlParser: true })
    .then(() => console.log('===== MongoDB connected ====='))
    .catch(err => console.error(err))


//================================================
// Start server
//================================================
app.listen(port, () => console.log(`\n===== API server started on port ${port} =====`))
