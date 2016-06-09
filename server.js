"use strict";

let express = require("express");
let app = express();
app.use(express.static("./"));
let server = app.listen(8080, () => {
    let host = server.address().address;
    let port = server.address().port;

    console.log(`Express web server started; -listening on port ${port} (host: ${host})`);
});