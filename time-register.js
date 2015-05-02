var ws_base_url = 'http://localhost:1337/'; //url of node.js web server, relative to user browser

var selected_customer_id;

//printable column headers
var dictionary = {
id: 'ID',
name: 'Name',
email: 'Email',
hourly_rate: 'Hourly Rate',
billable_time: 'Time Spent',
billable_amount: 'Amount Due',
bill: '',
start_stop_btn: '',
project_id: 'Project ID',
start: 'Start',
stop: 'Stop',
billed: 'Billed' };

//utility
function get_param(return_this, url) {
    return_this = return_this.replace(/\?/ig, "").replace(/=/ig, ""); // Globally replace illegal chars.
    /* var url = window.location.href; */// Get the URL from browser
    var parameters = url.substring(url.indexOf("?") + 1).split("&"); // Split by "param=value".
    var params = []; // Array to store individual values.
    for (var i = 0; i < parameters.length; i++)
        if (parameters[i].search(return_this + "=") != -1)
            return parameters[i].substring(parameters[i].indexOf("=") + 1).split("+");
    return "Parameter not found";
}
//utility
function get_previous_sibling(element) {
    var p = element;
    do
        p = p.previousSibling;
    while (p && p.nodeType != 1);
    return p;
}

//renders table from JSON array
function replace_table(table, data, row_clickable, row_onclick, extra_fields, selected_id) {
    table.className = "table";
    if (row_clickable)
        table.className += " table-hover";

    while (table.hasChildNodes()) {
        table.removeChild(table.lastChild);
    }
    var thead = document.createElement('thead');
    table.appendChild(thead);
    thdata = data[0];
    var thr = document.createElement('tr');
    for (field in thdata) {
        if (dictionary.hasOwnProperty(field)) {
            var th = document.createElement('th');
            th.innerHTML = dictionary[field];
            thr.appendChild(th);
        }
    }
    thead.appendChild(thr);
    if (extra_fields != null) {
        for (var i = 0; i < extra_fields.length; i++) {
            console.log('append_table_field:' + extra_fields[i]);
            var th = document.createElement('th');
            thr.appendChild(th);
            th.innerHTML = (dictionary.hasOwnProperty(extra_fields[i])) ? dictionary[extra_fields[i]] : extra_fields[i];
        }
    }

    var tbody = document.createElement('tbody');
    table.appendChild(tbody);
    for (key in data) {
        var rowdata = data[key];
        var row = document.createElement('tr');
        if (rowdata['id'] == selected_id)
            row.className += " success";
        if (row_clickable)
            row.className += " special";
        for (field in rowdata) {
            if (dictionary.hasOwnProperty(field)) {
                var td = document.createElement('td');
                td.innerHTML = rowdata[field];
                row.appendChild(td);
            }
        }
        tbody.appendChild(row);
        if (extra_fields != null) {
            for (var i = 0; i < extra_fields.length; i++) {
                var td = document.createElement('td');
                row.appendChild(td);
                append_extra_field(td, extra_fields[i], rowdata);
            }
        }
        if (row_clickable)
            row.onclick = row_onclick(row, rowdata);
    }
}

//clicked on customer table row. row is clicked DOMElement, rowdata is corresponding row for JSON array 
function customer_row_onclick(row, rowdata) {
    return function() {
        var trs = row.parentNode.childNodes;
        for (var i = 0; i < trs.length; i++) {
            console.log(trs[i]);
            trs[i].className = trs[i].className.replace(" success", "");
        }
        row.className += " success";
        selected_customer_id = rowdata['id'];
        var detail_panel = document.getElementById("detail_panel");
        detail_panel.className = detail_panel.className.replace("hidden", "");
        var detail_new_panel = document.getElementById("detail_new_panel");
        detail_new_panel.className = detail_new_panel.className.replace("hidden", "");
        get_projects(rowdata['id']); // customer rowdata
    };
}

//adds an extra column to a table as it is being rendered, to add action buttons to a row
function append_extra_field(parent_element, field, rowdata) {
    switch (field) {
        case ('bill'):
            if (rowdata['billable_amount'] != null) {
                parent_element.setAttribute('style', 'text-align: right');
                var child = document.createElement('button');
                child.setAttribute('type', 'button');
                child.innerHTML = 'bill';
                child.className = "btn btn-primary";
                child.onclick = function(e) {
                    e.stopPropagation();
                    bill(rowdata);
                };
                parent_element.appendChild(child);
            }
            break;
        case ('start_stop_btn'):
            parent_element.setAttribute('style', 'text-align: right');
            var child = document.createElement('button');
            child.setAttribute('type', 'button');
            if (rowdata['running_period_id'] != null) {
                child.innerHTML = 'stop';
                child.className = "btn btn-danger";
                child.onclick = function(e) {
                    project_stop(rowdata);
                    e.stopPropagation();
                };
            } else {
                child.innerHTML = 'start';
                child.className = "btn btn-primary";
                child.onclick = function(e) {
                    project_start(rowdata);
                    e.stopPropagation();
                };
            }
            parent_element.appendChild(child);
            break;
    }
}

//produces invoice with lines from billable projects
function bill(rowdata) { // customer rowdata

    var params = {
        customer_id: rowdata['id'] };

    document.getElementById("issue_invoice_btn").onclick = function(e) {
        issue_bill(params.customer_id)
    }

    $.getJSON(ws_base_url + 'projects', params, function(data) {
        var table = document.getElementById("invoice_table");
        console.log(data);
        var billable_rows = new Array();
        for (var i = 0; i < data.length; i++) {
            if (data[i]['billable_amount'] != null) {
                billable_rows.push(data[i]);
            }
        }
        console.log(billable_rows);
        replace_table(table, billable_rows, false /* not show periods */, null, null, null);

        var tbody = table.getElementsByTagName('tbody')[0];
        var last_td;
        var row = document.createElement('tr');
        for (field in billable_rows[0]) {
            if (dictionary.hasOwnProperty(field)) {
                var td = document.createElement('td');
                row.appendChild(td);
                last_td = td;
            }
        }
        tbody.appendChild(row);
        td.innerHTML = '<strong>' + rowdata['billable_amount'] + '</strong>';
        var total_label = get_previous_sibling(td);
        total_label.className = 'text-right';
        total_label.innerHTML = '<strong>' + 'Total:' + '</strong>';
        $('#invoice_modal').modal('show');
    });
}

//closes modal. sets periods as billed.
function issue_bill(customer_id) {
    var params = {
    action: 'bill',
    customer_id: customer_id };
    $.getJSON(ws_base_url + 'periods', params, function(data) {
        get_customers(function() {
            $('#invoice_modal').modal('hide');
            get_projects(selected_customer_id);
        });
    });
}

//work has started
function project_start(rowdata) { // project rowdata
    var url = ws_base_url + 'periods?' + 'project_id=' + encodeURIComponent(rowdata['id']) + '&action=start';
    console.log(url);
    $.getJSON(url, function(data) {
        get_projects(rowdata['customer_id']);
    });
}

//work has stop
function project_stop(rowdata) { // project rowdata
    var url = ws_base_url + 'periods?' + 'project_id=' + encodeURIComponent(rowdata['id']) + '&action=stop';
    console.log(url);
    $.getJSON(url, function(data) {
        get_customers(function() {
            get_projects(rowdata['customer_id']);
        });
    });
}

//produces customers table
function get_customers(callback) {
    $.getJSON(ws_base_url + "customers", function(data) {
        var table = document.getElementById("master_table");
        replace_table(table, data, true, customer_row_onclick, [ 'bill' ], selected_customer_id);
        callback();
    });
}

//produces projects table
function get_projects(customer_id) {
    $.getJSON(ws_base_url + "projects?customer_id=" + customer_id, function(data) {
        document.getElementById('input_new_project_customer_id').value = customer_id;
        var table = document.getElementById("detail_table");
        replace_table(table, data, false, null, [ 'start_stop_btn' ], null);
    });
}

//inserts new customer
document.getElementById('new_customer_btn').onclick = function(e) {
    var url = ws_base_url + 'customers';

    var params = {
    action: 'new',
    customer_name: document.getElementById('input_new_customer_name').value,
    customer_email: document.getElementById('input_new_customer_email').value,
    customer_hourly_rate: document.getElementById('input_new_customer_hourly_rate').value };

    document.getElementById('new_customer_form').reset();
    console.log(url);
    $.getJSON(url, params, function(data) {
        get_customers();
    });
};

//inserts new project
document.getElementById('new_project_btn').onclick = function(e) {
    var url = ws_base_url + 'projects';

    var params = {
    action: 'new',
    project_name: document.getElementById('input_new_project_name').value,
    customer_id: document.getElementById('input_new_project_customer_id').value };

    document.getElementById('new_project_form').reset();
    console.log(url);
    $.getJSON(url, params, function(data) {
        get_projects(params['customer_id']);
    });
};

get_customers(); //draw customer table on load
