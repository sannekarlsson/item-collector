// Http requests with axios
const axios = require('axios');
axios.defaults.baseURL = process.env.API_URL || 'http://localhost:5000/api/items';


exports.getItems = function (req, res, next) {
    axios.get('/')
        .then(function (response) {
            return res.render('index', {
                items: response.data
            });
        })
        .catch(function (error) {
            error.message = 'Could not connect to the database at the moment.'
            next(error);
        });
}


// Send a post request to the backend API and render item template of the response.
// Send the pug generated HTML string of the created item to the client js making the initial post request.
exports.createItem = function (req, res, next) {

    axios.post('/', { name: req.params.name })
        .then(function (response) {
            return res.render('components/item', {
                enter: 'enter',
                item: response.data
            });
        })
        .catch(function (error) {
            next(error);
        })
}


exports.updateItem = function (req, res, next) {
    axios.put('/' + req.params.id, req.body)
        .then(function (response) {
            return res.json(response.data)
        })
        .catch(function (error) {
            next(error);
        })
}


exports.deleteItem = function (req, res, next) {
    axios.delete('/' + req.params.id)
        .then(function (response) {
            return res.sendStatus(response.status);
        })
        .catch(function (error) {
            next(error);
        })
}

exports.deleteAllItems = function (req, res, next) {
    axios.delete('/')
        .then(function (response) {
            return res.sendStatus(response.status);
        })
        .catch(function (error) {
            next(error);
        })
}
