var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var bodyParser = require('body-parser');
var flash        = require('connect-flash');
var cookieParser = require('cookie-parser');
var session      = require('express-session');
var passport = require('passport');

app.use(flash());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({ secret: 'ilovescotchscotchyscotchscotch' }));
app.use(passport.initialize());
app.use(passport.session()); 
app.use(express.static(__dirname + '/images'));

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

require('./app/router')(app, passport);
require('./app/socketio')(io);
server.listen('3000');
