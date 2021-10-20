'use strict';

const express = require('express');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');

const validate = require('./controllers/validate');
const items = require('./controllers/items');
const ui = require('./controllers/ui');

const app = express();
const uiRouter = express.Router();
const apiRouter = express.Router();

const apiPath = '/api/items';

// Path to views 
app.set('views', path.join(__dirname, 'views'));

// Engine extension -- now can use .render('filename') without the file extension
app.set('view engine', 'pug');


//================================================
// Middleware
//================================================
if (app.get('env') === 'development') {
    // Logger
    const logger = require('morgan');
    app.use(logger('dev'));
}

// data sent as JSON, using Content-Type: application/json
app.use(express.json());
// data sent using Content-Type: application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));

app.use(helmet());
app.use(compression());

// From CS50 js bootcamp
apiRouter.param('id', (req, res, next, id) => {
    if (!id.match(/^[0-9a-fA-F]{24}$/))
        return res.status(400).send('Invalid ID');
    next();
});


//================================================
// Routes
//================================================
// UI
uiRouter.route('/')
    .get(ui.createUiRequest);

// API
apiRouter.route('/')
    .get(items.getItems)
    .post(validate.name, items.createItem)
    .delete(items.deleteAllItems);

apiRouter.route('/:id')
    .get(items.getItem)
    .put(validate.name, items.updateItem)
    .delete(items.deleteItem);

app.use(uiRouter);
app.use(apiPath, apiRouter);


//================================================
// Error handling
//================================================
app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
})

app.use((error, req, res, next) => {

    const status = error.status || 500;
    res.status(status);

    // API request
    if (req.path.startsWith(apiPath + '/')) {
        return res.send(error.message);
    }

    // UI request, return error page
    return res.render('error', {
        status,
        message: error.message
    });
});

module.exports = app;
