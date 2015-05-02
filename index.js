var server = require("./server");
var router = require("./router");
var requesthandlers = require("./requesthandlers");

var handle = {};

handle["/"] = requesthandlers.index;
handle["/customers"] = requesthandlers.customers;
handle["/projects"] = requesthandlers.projects;
handle["/periods"] = requesthandlers.periods;

//if not exists create and populate database
server.db_connection = server.mysql.createConnection({
    multipleStatements : true,
    host : 'localhost',
    user : 'root',
    password : ''
});

var schema = server.fs.readFileSync('create_database.sql', {
    encoding : 'utf8'
});

server.db_connection.query(schema, function(err, rows, fields) { console.log('database populated');});
server.start(router.route, handle, server.io, server.fs);
