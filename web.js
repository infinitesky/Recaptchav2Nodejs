var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var flash = require('connect-flash');
/*
const key = process.env.private_key;
var email = process.env.client_email;
var creds = {client_email:email,private_key:key.replace(/\\n/g, '\n')};
*/

var app = express();
var sess = {
		secret: 'secret#423#3!',
		resave: true,
		saveUninitialized: true
}
app.use(cookieParser('secret#423#3!'));
app.use(session(sess));
app.use(flash());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));


//set static path
app.use(express.static(path.join(__dirname,'public')));	

var router = express.Router();

app.use(function (req, res, next) {
	res.locals.messages = require('express-messages')(req, res);
	next();
});

app.set('view engine', 'pug');
app.set('views',path.join(__dirname,'views'));
/*var logger = function(req, res, next){
	console.log('logging....');
	next();
}
app.use(logger);*/

var mail = require('./mailer/sendMail');
app.use('/mail', mail);


app.get('/', function(request, response) {
	console.log("routing from route")
	response.render('index.html');
});
app.get('/contact', function(request, response) {
	console.log("routing from route");

	response.render('contact');
});


var port = process.env.PORT || 5000;
app.listen(port, function() {
	console.log("Listening on " + port);
});

module.exports = app;