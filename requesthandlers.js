var exec = require("child_process").exec;
var querystring = require("querystring");
var url = require("url");
var server = require("./server");

var json_response_header = {
"Content-Type": "application/json",
"Access-Control-Allow-Origin": "*" }

//queries the database and outputs rows as JSON
function execute_json_query(query, response) {
    console.log(query);
    server.db_connection.query(query, function(err, rows, fields) {
        if (err) {
            throw err;
        }
        response.write(JSON.stringify(rows));
        response.end();
    });
}

//handles queries for the customer table
function customers(request, response) {
    response.writeHead(200, json_response_header);
    var action = url.parse(request.url, true).query.action;
    console.log(request.url);
    switch (action) {
        case 'new':
            var customer_name = url.parse(request.url, true).query.customer_name;
            var customer_email = url.parse(request.url, true).query.customer_email;
            var customer_hourly_rate = url.parse(request.url, true).query.customer_hourly_rate;
            var query = 'INSERT INTO `customer` (`name`, `email`, `hourly_rate`) VALUES (';
            query += server.mysql.escape(customer_name) + ',';
            query += server.mysql.escape(customer_email) + ',';
            query += server.mysql.escape(customer_hourly_rate) + ')'
            console.log(query);
            server.db_connection.query(query, function(err, rows, fields) {
                if (err) {
                    throw err;
                }
                response.write('0');
                response.end();
            });
            return;
        default:
            var customer_id = url.parse(request.url, true).query.customer_id;
            var query = 'SELECT customer.id, customer.name, customer.email, FORMAT(customer.hourly_rate, 2) AS hourly_rate, TIME_FORMAT(SEC_TO_TIME(sum_periods), \'%H:%i:%s\') AS billable_time, FORMAT(sum_periods * customer.hourly_rate / 3600, 2) AS billable_amount FROM customer LEFT JOIN (SELECT customer.id AS customer_id, sum(TIMESTAMPDIFF(SECOND, period.start, period.stop)) AS sum_periods FROM customer JOIN project ON customer.id = project.customer_id JOIN period ON period.project_id = project.id WHERE period.billed = 0 ? GROUP BY customer.id) AS total ON customer.id = total.customer_id';
            var customer_id = url.parse(request.url, true).query.customer_id;
            var whereclause = (customer_id > 0) ? 'AND customer_id = ' + server.mysql.escape(customer_id) : '';
            query = query.replace('?', whereclause);
    }
    execute_json_query(query, response);
}

//handles queries for the project table
function projects(request, response) {
    response.writeHead(200, json_response_header);
    var customer_id = url.parse(request.url, true).query.customer_id;
    var action = url.parse(request.url, true).query.action;
    console.log(request.url);
    switch (action) {
        case 'new':
            var project_name = url.parse(request.url, true).query.project_name;
            var query = 'INSERT INTO `project` (`name`, `customer_id`) VALUES (';
            query += server.mysql.escape(project_name) + ',';
            query += server.mysql.escape(customer_id) + ')'
            console.log(query);
            server.db_connection.query(query, function(err, rows, fields) {
                if (err) {
                    throw err;
                }
                response.write('0');
                response.end();
            });
            return;
        default:
            var query = 'SELECT project.id, project.customer_id, project.name, TIME_FORMAT(SEC_TO_TIME(sum_periods), \'%H:%i:%s\') AS billable_time, FORMAT(sum_periods * customer.hourly_rate / 3600, 2) AS billable_amount, (SELECT period.id AS running_period_id FROM period WHERE period.stop IS NULL AND period.project_id = project.id) AS running_period_id FROM project LEFT JOIN (SELECT project.id AS id, SUM(TIMESTAMPDIFF(SECOND, period.start, period.stop)) AS sum_periods FROM project JOIN period ON period.project_id = project.id WHERE period.billed = 0 GROUP BY project.id) AS total ON project.id = total.id JOIN customer ON project.customer_id = customer.id ?';
            var whereclause = (customer_id > 0) ? 'WHERE customer_id = ' + server.mysql.escape(customer_id) : '';
            query = query.replace('?', whereclause);
    }
    execute_json_query(query, response);
}

//handles queries for the period table
function periods(request, response) {
    response.writeHead(200, json_response_header);
    var project_id = url.parse(request.url, true).query.project_id;
    var customer_id = url.parse(request.url, true).query.customer_id;
    var action = url.parse(request.url, true).query.action;
    switch (action) {
        case 'bill':
            if (customer_id != null) {
                var query = 'UPDATE period SET billed = 1 ?';
                var whereclause = 'WHERE period.project_id IN (SELECT id FROM project WHERE customer_id = ' + server.mysql.escape(customer_id) + ')';
                query = query.replace('?', whereclause);
                console.log(query);
                server.db_connection.query(query, function(err, rows, fields) {
                    if (err) {
                        throw err;
                    }
                    response.write('0');
                    response.end();
                });
            }
            return;
        case 'start':
            console.log("start case");
            var query = 'INSERT INTO `period` (`project_id`) VALUES(?);';
            query = query.replace('?', server.mysql.escape(project_id));
            console.log(query);
            server.db_connection.query(query, function(err, rows, fields) {
                if (err) {
                    throw err;
                }
                response.write('0');
                response.end();
            });
            return;
        case 'stop':
            console.log("stop case");
            if (project_id > 0) {
                var query = 'SELECT period.id AS running_period_id FROM period ?;';
                var whereclause = 'WHERE period.stop IS NULL AND period.project_id = ' + server.mysql.escape(project_id);
                query = query.replace('?', whereclause);
                server.db_connection.query(query, function(err, rows, fields) {
                    if (err) {
                        throw err;
                    }
                    console.log(rows);
                    if (rows.length > 0) {
                        var running_period_id = rows[0]['running_period_id'];
                        if (running_period_id != null) {
                            var query = 'UPDATE period SET stop = CURRENT_TIMESTAMP ?;';
                            var whereclause = 'WHERE id = ' + server.mysql.escape(running_period_id);
                            query = query.replace('?', whereclause);
                            console.log(query);
                            server.db_connection.query(query, function(err, rows, fields) {
                                if (err) {
                                    throw err;
                                }
                                response.write('0');
                                response.end();
                            });
                        }
                    }
                });
            }
            return;
        default:
            var query = 'SELECT * FROM period ?';
            var whereclause = (project_id > 0) ? 'WHERE project_id = ' + server.mysql.escape(project_id) : '';
            query = query.replace('?', whereclause);
            query += ' ORDER BY start DESC';
    }
    execute_json_query(query, response);
}

exports.customers = customers;
exports.projects = projects;
exports.periods = periods;
