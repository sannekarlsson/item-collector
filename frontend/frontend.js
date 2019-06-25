'use strict';

const express = require('express');
const path = require('path');
const helmet = require('helmet');
const logger = require('morgan');

const controllers = require('./controllers');

// Parcel bundler
const Bundler = require('parcel-bundler');
const entryFiles = [path.join(__dirname, 'src/*/main.*'), path.join(__dirname, 'src/images/*')];
const bundler = new Bundler(entryFiles, { outDir: 'public' });

const app = express();
const router = express.Router();

// Path to views 
app.set('views', path.join(__dirname, 'views'));

// Engine extension -- can use .render('filename') without file extension
app.set('view engine', 'pug');


//================================================
//  Middleware
//================================================
if (app.get('env') === 'development') {
    app.use(logger('dev'));
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(helmet());

app.use(bundler.middleware());

app.use(express.static('public'));


//================================================
//  Routes 
//================================================

router.route('/')
    .get(controllers.getItems);

router.route('/items')
    .delete(controllers.deleteAllItems);

router.route('/items/:name')
    .post(controllers.createItem);

router.route('/items/:id')
    .put(controllers.updateItem)
    .delete(controllers.deleteItem);

app.use(router);

//================================================
//  Error handling
//================================================
app.use(function (req, res, next) {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
});

app.use(function (error, req, res, next) {
    res.status(error.status || 500)
    res.render('error', {
        title: 'Error page',
        status: error.status || 500,
        message: error.message
    })
});

module.exports = app;
