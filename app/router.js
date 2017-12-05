var LocalStrategy   = require('passport-local').Strategy;
const objectAssign = require('object-assign');
var jenkinsapi = require('jenkins');
var x = require('./module');
var dump = require('./module').dump;
var connection = require('./config');
var listuser = require('./config').listuser;
var admin = require('./config').admin;
var user_login = require('./config').user_login;
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

	app.post('/user', passport.authenticate('login', {failureRedirect: '/'}), 
		function(req, res){
			req.session.userlogin = req.body.username;
			let a = user_login.find(x => x.user === req.session.userlogin);
			res.render('load', {'name': req.session.userlogin, 'content': req.user, administrator: a.administrator});
		}
	);
	app.get('/user', x.loginM, function(req, res){

			let a = user_login.find(x => x.user === req.session.userlogin);
			var connectuser = req.session.userlogin+'connect';
			connection[connectuser].view.get(req.session.userlogin, function(error, data){
				if(!error){
					res.render('load', {'name': req.session.userlogin, 'content': data.jobs, administrator: a.administrator});
				}else{
					res.render('load', {'name': req.session.userlogin, 'content': {}});
				}
			});
		}
	);

	app.get('/admin', x.loginM, function(req, res){
		let a = user_login.find(x => x.user === req.session.userlogin);
		if(a.administrator != 1){
			res.send('not permission');
		}else{
			res.render('admin', {'name': req.session.userlogin, administrator: a.administrator});
		}
	});

	app.get('/logout', function(req, res){
		user_login.forEach(function(value, key){
			if(value.user == req.session.userlogin){
				user_login.splice(key, 1);
			}
		});
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
			let administrator = 0;
			var urllogin = `http://${user}:${pass}@${req.body.hosts}`;
			var connect = jenkinsapi({baseUrl: urllogin, crumbIssuer: true});
			var userconnects = user+'connect'
			var userconnect = [];
			if ( admin.indexOf(`${user}`) != -1){
				administrator = 1;
			}
			user_login.push({'user': user, 'administrator': administrator});
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
