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

    // Parcel bundler
    const Bundler = require('parcel-bundler');
    const entryFiles = [path.join(__dirname, 'src/*/main.*'), path.join(__dirname, 'src/images/*')];
    const bundler = new Bundler(entryFiles, { outDir: 'public' });
    app.use(bundler.middleware());
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
app.use('/api/items', apiRouter);


//================================================
// Error handling
//================================================
app.use((req, res, next) => {
    const error = new Error(`Not Found -- ${req.originalUrl}`);
    error.status = 404;
    next(error);
})

app.use((error, req, res, next) => {
    res.status(error.status || 500).send(error.message);
});

module.exports = app;
