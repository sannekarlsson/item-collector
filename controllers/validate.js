const { body, validationResult } = require('express-validator');

exports.name = [
    body('name').trim().isLength({ min: 1 }),

    body('name').escape(),

    validateResult
]

function validateResult(req, res, next) {

    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() })
    }

    next()
}
