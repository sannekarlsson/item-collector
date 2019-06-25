'use strict';

const app = require('./frontend');
const port = process.env.PORT || 3000;

app.listen(port, () =>
    console.log(`\n===== Frontend server started on port: ${port} =====`));
