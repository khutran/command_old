var connection = require('./config');
var path = require('./config').path;
var mysql = require('./config').mysql;
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;

var loginM = function(req, res, next){
	if (req.isAuthenticated())
			return next();
	res.redirect('/');
}

var finddatabase = function(domain, callback){
	var WPDBNAME=`cat ${path}/web/${domain}/workspace/wp-config.php | grep DB_NAME`;
	exec(WPDBNAME, function(error, data){
		if(error){
			return callback({'stt': 'error', 'error': error.message});
		}else{
			var arr = data.split("\n");
			return callback({'stt': 'suscess', 'data':arr[0].replace(/ /gi, '').slice(18, -3)});
		}
	});		
};

var dump = function(res, domain, callback){
	finddatabase(domain, function(resutls){
		if(resutls.stt == 'error'){
			res.end();
		}else if(resutls.stt == 'suscess'){
			var dumpdatabase = spawn('mysqldump', [
					 '-u' + mysql.user,
					 '-p' + mysql.password,
					 '-h' + mysql.host,
					 resutls.data,
					 '--default-character-set=utf8',
					 '--comments'
					],{
						highWaterMark: 16 * 1024
					});
			res.setHeader('Content-Type','application/octet-stream');
			res.setHeader('Content-disposition', `filename=${resutls.data}.sql`);
			dumpdatabase.stdout.pipe(res);
		}else{
			res.end();
		}
	});
}

module.exports = {
	loginM:loginM,
	dump:dump
}
