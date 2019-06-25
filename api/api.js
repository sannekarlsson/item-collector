'use strict'

const express = require('express')
const helmet = require('helmet')
const logger = require('morgan')

const validate = require('./controllers/validate')
const items = require('./controllers/items')

const app = express()
const router = express.Router()


//================================================
// Middleware
//================================================
if (app.get('env') === 'development') {
    app.use(logger('dev'))
}

// data sent as JSON, using Content-Type: application/json
app.use(express.json())
// data sent using Content-Type: application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }))

app.use(helmet())

// From CS50 js bootcamp
router.param('id', (req, res, next, id) => {
    if (!id.match(/^[0-9a-fA-F]{24}$/))
        return res.status(400).send('Invalid ID');
    next();
});


//================================================
// Routes
//================================================
router.route('/items')
    .get(items.getItems)
    .post(validate.name, items.createItem)
    .delete(items.deleteAllItems)

router.route('/items/:id')
    .get(items.getItem)
    .put(validate.name, items.updateItem)
    .delete(items.deleteItem)

app.use('/api', router)


//================================================
// Error handling
//================================================
app.use((req, res, next) => {
    const error = new Error(`Not Found -- ${req.originalUrl}`)
    error.status = 404
    next(error)
})

app.use((error, req, res, next) =>
    res.status(error.status || 500).send(error.message)
)

module.exports = app
