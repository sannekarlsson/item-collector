//================================
// Request a UI response
//================================ 
const ui = { ui: true };
const apiUrl = '/api/items/';

exports.createUiRequest = (req, res, next) => {
    req.body = ui;
    req.url = apiUrl;
    next();
}
