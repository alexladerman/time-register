//routes request to request handlers

var fs = require('fs');
function route(pathname, handle, request, response) {
    console.log("About to route a request for " + pathname);

    if (typeof handle[pathname] === 'function') {
        handle[pathname](request, response);
    } else {
        console.log("No request handler found for " + pathname);
        response.writeHead(404, {
            "Content-Type": "text/html" });
        response.write("404 Not found");
        response.end();
    }
}

exports.route = route;