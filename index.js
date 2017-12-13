var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var _ = require("lodash");

var bodyParser = require('body-parser');
var flash        = require('connect-flash');
var cookieParser = require('cookie-parser');
var session      = require('express-session');
var passport = require('passport');

app.use(flash());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
    secret: 'ilovescotchscotchyscotchscotch',
    cookie: {maxAge: 300000},
    // store: sessionStore, // connect-mongo session store
    proxy: true,
    resave: true,
    saveUninitialized: true
}));
app.locals._ = _;

app.use(passport.initialize());
app.use(passport.session()); 
app.use(express.static(__dirname + '/'));

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

require('./app/router')(app, passport);
require('./app/socketio')(io);
server.listen('3000');
