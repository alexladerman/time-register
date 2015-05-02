var http = require("http");
var url = require("url");
var app;
var io = require('socket.io');
var fs = require('fs');
var serv_io;
var mysql = require('mysql');
var db_connection;

function start(route, handle, serv_io, fs) {

    function onRequest(request, response) {
        var pathname = url.parse(request.url).pathname;
        console.log("Request for " + pathname + " received.");
        route(pathname, handle, request, response);
    }

    app = http.createServer(onRequest);
    app.listen(1337);
    console.log("Server has started.");
}

exports.start = start;
exports.io = io;
exports.fs = fs;
exports.mysql = mysql;
exports.db_connection = db_connection;