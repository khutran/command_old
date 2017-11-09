var LocalStrategy   = require('passport-local').Strategy;
const objectAssign = require('object-assign');
var jenkinsapi = require('jenkins');
var x = require('./module');
var dump = require('./module').dump;
var connection = require('./config');
// var stream = require('stream');
// var contentsql = new stream.PassThrough();

module.exports = function(app , passport){

	app.get('/', function(req, res){
		if (req.isAuthenticated()){
			res.render('load', {'name': req.session.userlogin, 'content': req.user});
			res.end();
		}else{
			res.render('index', {'mesage': 'login'});
		}
	});

	app.get('/login', function(req, res){
		console.log(req);
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
	app.get('/user', x.loginM, function(req, res){
			var connectuser = req.session.userlogin+'connect';
			connection[connectuser].view.get(req.session.userlogin, function(error, data){
				if(!error){
					objectAssign(req.user, data.jobs);
					res.render('load', {'name': req.session.userlogin, 'content': data.jobs});
				}else{
					res.render('load', {'name': req.session.userlogin, 'content': {}});
				}
			});
		}
	);
	app.get('/logout', function(req, res){
        req.logout();
        res.redirect('/');
	});

	app.get('/download', x.loginM, function(req, res){
		var domain = req.query.domain;
		dump(res, domain);

	});

	app.get('/project/:id', x.loginM ,function(req, res){
		var color = '';
		req.user.forEach(function(item){
			if(item.name == req.params.id){
				color = item.color;
			}
		});
		res.render('project', {'domain': req.params.id, 'user': req.session.userlogin, 'color': color});
	});
	passport.serializeUser(function(user, done) {
	  done(null, user);
	});

	passport.deserializeUser(function(user, done) {
	  done(null, user);
	});

	passport.use('login', new LocalStrategy(
		{
			passReqToCallback : true
		},
		function(req, user, pass, done) {
			var urllogin = `http://${user}:${pass}@${req.body.hosts}`;
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