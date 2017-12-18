var Q = require('q');
var fs = require('fs');
var exec = require('child_process').exec;
var mysql_i = require('./../config').mysql;
var mysql      = require('mysql');

	function permission1(database, user_db, prefix, project, host){
		
		return Q.Promise((res) => {
		    var connection = mysql.createConnection({
		    	multipleStatements: true,
		    	dateStrings: true,
                connectionLimit : 10,
       		   	host : `${mysql_i.host}`,
             	user : `${mysql_i.user}`,
	           	password : `${mysql_i.password}`,
	        });
		    process.chdir(`/var/www/web/${project}/workspace/`);
		    var new_db = `CREATE DATABASE ${database}`;
			var privile = "grant all privileges on " + "\`" + database + "\`" + "\." + "*" + " to " + "\'" + user_db + "\'" + "@" + "\'" + host + "\'";
				connection.query(`${new_db};${privile}`, [1, 2], function(error, results, fields){
				if(error){
					res({'status': '0', 'results': error});
					connection.end();
				}else{
					res({'status': '1', 'results1': results[0], 'results2': results[1]});
					connection.end();
				}
			});
		});
	}	

	function finddatabase(callback){
		exec('find database -name \"*.sql\"', function(error, data){
			// data.replace(/\n/gi, '');
			callback(data);
		});
	}

	function create_config(project, callback){
		fs.readFile(__dirname + '/conig_file/wp-config.txt', (error, data)=>{
			if(error) callback(error);
			var wpconfig = data.toString();
			wpconfig = wpconfig.replace('db\_name', project.database);
			wpconfig = wpconfig.replace('db\_user', project.user_db);
			wpconfig = wpconfig.replace('db\_password', project.password);
			wpconfig = wpconfig.replace('db\_host', project.host);
			var search_domain = 'SELECT \`option_value\` FROM \`' + project.prefix +'options' +'\` WHERE \`option_name\` = "siteurl"'
			fs.writeFile(`/var/www/web/${project.project}/workspace/wp-config.php`, wpconfig, function(err){
				if(!err){
					permission1(project.database, project.user_db, project.prefix, project.project, project.host)
					.then(function(data1){
						if(data1.status == '1'){
							finddatabase((db)=>{
								exec(`wpan db import ${db} --allow-root`.replace(/\n/gi, ' '), function(er){
									if(er){
										callback({status: 'error', results: er.message});
									}else{
										exec(`wpan db query '${search_domain}' --allow-root`.replace(/\n/gi, ' '), function(err1, data){
											if(err1){
												callback({status: 'error', results: err1.message});
											}else{
												let url_domain = data.replace(/\n/gi, '').replace('option\_value','').replace(/ /gi, '');
												exec(`wpan search-replace ${url_domain} http://${project.project} --all-tables --allow-root`.replace(/\n/gi, ' '), (err2)=>{
													if(err2) callback({status: 'error', results: err2.message});
													callback({status: 'suscess', results: 'suscess'});
												});
											}									
										});
									}
								});
							});
						}else{
							callback({status: 'error', results:data1.results});
						}
					});
				}else{
					callback({status: 'error', results: err});
				}
			});
			fs.readFile(__dirname + '/conig_file/htaccess.txt', (error3, htaccess)=>{
				fs.writeFile(`/var/www/web/${project.project}/workspace/.htaccess`, htaccess, function(err3){
					if(err3) throw err3;
				});
			});
		});
	}


// permission1('vicoders_mimo_db', 'vmmsnew', 'wp_')
// .then(function(data){
// 	console.log(data);
// });

module.exports = {
	create_config:create_config
}
