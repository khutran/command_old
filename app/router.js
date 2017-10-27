var LocalStrategy   = require('passport-local').Strategy;
const objectAssign = require('object-assign');
var jenkinsapi = require('jenkins');
var x = require('./module');
var dump = require('./module').dump;
var connection = require('./config');
var url = require('./config').url;

module.exports = function(app , passport){

	app.get('/', function(req, res){
		if (req.isAuthenticated()){
			res.render('load', {'name': req.session.userlogin, 'content': req.user});
			res.end();
		}else{
			res.render('index', {'mesage': 'login'});
		}
	});

	app.post('/user', passport.authenticate('login', {failureRedirect: '/'}), 
		function(req, res){
			req.session.userlogin = req.body.username;
			res.render('load', {'name': req.session.userlogin, 'content': req.user});
		}
	);

	app.get('/logout', function(req, res){
        req.logout();
        res.redirect('/');
	});

	app.get('/project/:id', x.loginM ,function(req, res){
		res.render('project', {'domain': req.params.id, 'user': req.session.userlogin});
	});
	passport.serializeUser(function(user, done) {
	  done(null, user);
	});

	passport.deserializeUser(function(user, done) {
	  done(null, user);
	});

	passport.use('login', new LocalStrategy(
		function(user, pass, done) {
			var urllogin = `http://${user}:${pass}@${url}`;
			var connect = jenkinsapi({baseUrl: urllogin, crumbIssuer: true});
			var userconnects = user+'connect'
			var userconnect = [];
			userconnect[userconnects] = connect;
			objectAssign(connection, userconnect);
			connect.view.get(user,function(err, data){
				if (err){
					return done(null, false, err);
				}else{
					return done(null, data.jobs);
				}
			});				
		}
	));
}