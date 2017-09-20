var LocalStrategy   = require('passport-local').Strategy;
var jenkinsapi = require('jenkins');
var x = require('./module');

module.exports = function(app , passport){


	app.get('/', function(req, res){
		res.render('index', {'mesage': 'login'});
	});

	app.post('/user', passport.authenticate('login', {failureRedirect: '/'}), 
		function(req, res){
			res.render('load', {'name': req.body.username, 'content': req.user});
		}
	);

	app.get('/project/:id', x.loginM ,function(req, res){
		res.render('project', {'domain': req.params.id});

	});

	passport.serializeUser(function(user, done) {
	  done(null, user);
	});

	passport.deserializeUser(function(user, done) {
	  done(null, user);
	});

	passport.use('login', new LocalStrategy(
		function(user, pass, done) {
			var urllogin = `http://${user}:${pass}@project.vicoders.com`;
			var connect = jenkinsapi({baseUrl: urllogin, crumbIssuer: true});
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