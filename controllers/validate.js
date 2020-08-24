const { body, validationResult } = require('express-validator/check')
const { sanitizeBody } = require('express-validator/filter')

exports.name = [
    body('name').trim().isLength({ min: 1 }),

    sanitizeBody('name').escape(),

    validateResult
]

function validateResult(req, res, next) {

    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() })
    }

    next()
}
