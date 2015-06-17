# time-register
A time registration and billing program written for a developer challenge.

# Developer challenge

As a part of our recruitment process we always ask our candidates to complete a practical development challenge. The challenge consists of two parts:

1. You do your magic and solve the provided task
2. We host a session where you present your solution to us, and we all have a nice talk about it

The actual task is to implement a simple solution to the following two user stories:

1. As a freelancer I want to be able to register the time I spend on my projects, so that I can create correct invoices for my customers.
2. As a freelancer I want to be able to get an overview of my time registrations, so that I can create correct invoices for my customers.

Keep in mind that we do not expect your code to be production ready. What we're looking for is to see if you have the ability to transform a set of user requirements into a working tool.

PS: While we are spending a lot of our time writing JavaScript and C#, you will be able to impress us using any platform and language.

Hand in
=======

Here is my version of the development challenge. I chose to write it in web client/server architecture using javascript/node.js given that is what we touched upon most when talking over the phone and because it shows the use of a stack, similar to that which is mentioned in one of your job descriptions:

"Highlights of the e-conomic stack include a thick JavaScript client, a RESTful API, a backend running mainly on C#, a large MS SQL mirror, and a lot of Node.js micro-services."

Also it is closer to the sort of software you sell than an alternative .NET Windows Form program would have been. I used MySQL for the database engine. I think SQL is an adequate choice for a small scale relational database and I had the tools to hand on my machine);

Here are the setup instructions:

* The test machine requires Node.js and MySQL (running).
* Open a command line to the directory location.
* Edit the "index.js" accordingly file for a user with create database permissions on the MySQL server. (see "mysql.createConnection")
* Run "node index.js" (or you can use "nodemon"). That should create the database and populate it with some sample data.
* If this fails you may need to run "npm install" to fetch dependencies.
* Open index.html in you browser.

Optionally you can also make the app public (e.g. for mobile) Put the files into a webserver directory. Modify "ws_base_url" in "economic_test.js" to the public address of the machine. This may require the setting Access-Control-Allow-Origin on the server. I have included a .htaccess file.

Included are some screenshots. As you can see, the view comprises of a master-detail layout in two columns, side by side. You get a list of customers on the left and, when you click, a list of projects for the customer on the right. You can start and stop time spent on a project. This is backed internally by a third table of intervals or periods. The program works out total time of all yet to be billed periods and calculates the amount due at the hourly rate set for that customer. You can also produce an invoice for the time spent pending payment. Issuing the invoice flags the corresponding periods as billed and removes them from view. I gave some thought to additional features one would consider implementing were this a real-world application. See attached list.

Most of the client side view is rendered dynamically from Javascript with a little jQuery and uses styling from the Bootstrap library. The server-side is an HTTP server in node. Upon requests from the client it queries the database, which joins tables and calculates sums of time and amounts due and produces data in JSON format.

Ideas for for additional features
=================================

* Edit customer, project.
* Search for customers or projects.
* Recent customers, projects views. Multiple tabs.
* Manually add a period by specifying start stop time.
* Customer detail. Project detail. Attach other data.
* Mobile app. Local or connected via JSON web service.
* Add invoice debit entry to customer account ledger.
* Option to save hourlyrate with period to decouple consumed period from future variations.
* Option to set per project rates.
* Customers just local or connected to accounting package and or contacts database.
* Option to set a default stop of period after say 8 hours. In case forgotten to stop.
* Option to give customer access to project and account ledgers.
* Checkboxes to choose only to invoice certain projects.
* Option to bulk send out billing to all customers all projects on due billing date.
* List running projects first.
* Set row limits, add column sorting, add pagination.
* Option to edit a period, edit/delete a bill.
* Option to add extra lines to invoice or send lines to external billing software.
* View issued invoices summary and detail.
