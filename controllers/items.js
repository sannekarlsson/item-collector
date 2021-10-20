const Item = require('../models/Item')

const errorOn = {
    name: 'No item with that name',
    id: 'No item with that id'
}

// Get all Items
// Return in order last added to first
exports.getItems = (req, res, next) => {

    Item.find({})
        .sort('-created')
        .then(items => {

            if (req.body.ui) {
                return res.render('index', { items });
            }

            return res.json(items);
        })
        .catch(function (error) {
            error.message = 'Could not connect to the database at the moment.'
            next(error);
        });
}

// Create an Item
exports.createItem = (req, res, next) => {

    const newItem = new Item({
        name: req.body.name
    });

    newItem.save()
        .then(item => {
            if (req.body.ui) {
                return res.render('components/item', {
                    enter: 'enter',
                    item
                });
            }

            return res.json(item)
        })
        .catch(error => next(error));
}

// Get an Item
exports.getItem = (req, res, next) => {

    Item.findById(req.params.id)
        .then(item => {
            if (!item) {
                return res.status(404).send(errorOn.id);
            }
            res.json(item);
        })
}

// Update an Item
exports.updateItem = (req, res, next) => {

    Item.findByIdAndUpdate(req.params.id, req.body, {
        new: true, useFindAndModify: false
    })
        .then(item => {
            if (!item) {

                // Request from ui
                if (req.body.ui) {
                    return res.send({ error: 404 });
                }

                // Request from api
                return res.status(404).send(errorOn.id);
            }

            return res.json(item);
        })
        .catch(error => next(error));
}

// Delete an Item
exports.deleteItem = (req, res, next) => {

    Item.findByIdAndDelete(req.params.id)
        .then(item => {
            if (!item) {
                return res.status(404).send(errorOn.id);
            }

            return res.sendStatus(200);
        })
        .catch(error => next(error));
}

// Delete all Items
exports.deleteAllItems = (req, res, next) => {

    Item.deleteMany({})
        .then(result => {

            if (result.deletedCount === 0) {
                return res.status(404).send('Could not delete all items.');
            }

            return res.json(result);
        })
        .catch(error => {
            next(error)
        });
}
