var Q = require('q');
var exec = require('child_process').exec;
var path = require('./config').path;
var connection = require('./config');
var fs = require('fs');
module.exports = function(io){
	io.on('connection', function(socket){
		var framework = function(){
			return Q.promise((respose)=>{
				if(fs.existsSync(`wp-admin`)){
					return respose('wordpress');
					return;
				}else{
					return respose('noframeworkk');
				}
			});
		};

		var loadss = function(domain){
			if(!domain){
				exec('ls', function(error, data){
					if(error){
						socket.emit('loads',{'resutls':error.message, 'framework': framework});
					}else{
						socket.emit('loads',{'resutls': data, 'framework': framework});
					}
				});				
			}else{
				try {
					process.chdir(`${path}/web/${domain}`);
					framework()
					.then(function(framework){
						exec('ls', function(error, data){
							if(error){
								socket.emit('loads',{'resutls':error.message, 'framework': framework});
							}else{
								socket.emit('loads',{'resutls': data, 'framework': framework});
							}
						});
					});
				}catch (err){
					socket.emit('loads',{'resutls':err.message});
				}
			}
		};

		var sendcomand = function(){

		}
		socket.on('send command', function(command){
			try {
				var promise = function(){
					return Q.promise((res) => {
						var cmd = command.command.split(" ");
						switch (cmd[0]){
							case 'pwd':
							case 'php':
							case 'composer':
								exec(command.command, function(error, stdout, stderr){
									if (error) {
										return res({'status': 'error', 'error': error.stack});
									}else if (stdout == ''){
										loadss();
										return res({'status': 'suscess', 'data':stderr});
									}else{
										loadss();
										return res({'status': 'suscess', 'data':stdout});
									}
								});
								break;
							default: 
									return res({'status': 'error', 'error':'command not support'});
						}
					});
				}
				promise().then(function(data){
					if (data.status == 'error'){
						socket.emit('false', data.error);
					}else{
						socket.emit('resutls', data.data);
					}
				});
			}catch (err){
				socket.emit('false', err.message);
			}

		});
		socket.on('loads', function(loads){
			var domain = `${loads.domain}/workspace`;
			loadss(domain);
		});

		socket.on('logs', function(logs){
			try{
				exec(`tail -n 20 ${path}/log/${logs.domain}_log`, function(error, data){
					if(error){
						socket.emit('false', error.message);
					}else{
						socket.emit('resutls', data);
					}
				});
			}catch(err){
				socket.emit('false', err.message);
			}
		});
		socket.on('cd', function(cd){
			exec(`find -name "composer.json"`, function(error, data){
				if(error){
					socket.emit('false', error.message);
				}else{
					var arr = data.split("./");
					var arr = arr.slice(1);
					let dem = 0;
					arr.forEach(function(item){
						item  = item.replace(/\n/gi, '');
						if((item.indexOf('vendor') == -1) && (item.indexOf('plugin') == -1) && (item.indexOf('themes') != -1)){
							dem +=1;
							if(dem  == 1){
								var item = item.replace('composer.json', '');
								let domain = `${cd.domain}/workspace/${item}`;
								loadss(domain);
							}else{
								socket.emit('loads', {'resutls': 'not found composer', 'framework': 'noframeworkk'});
							}
						}
					});
				}
			});

		});

		socket.on('build', function(build){
			let connectuser = `${build.user}connect`;
			let connect = connection[connectuser];
			try{
				// var log = connect.build.logStream(build.domain, 4);

				// log.on('data', function(text) {
				//   process.stdout.write(text);
				// });

				// log.on('error', function(err) {
				//   console.log('error', err);
				// });

				// log.on('end', function() {
				//   console.log('end');
				// });
				connect.job.build(build.domain ,function(err, data){
					if(err){
					  	socket.emit('build', {'status': 'error', 'resutls': err});
					}else{
						connect.job.get(build.domain,function(error, data2){
							if(error){
								socket.emit('build', {'status': 'error', 'resutls': error});
							}else{
								// console.log(connect);
								socket.emit('build', {'status': 'suscess', 'resutls': data2.color});
							}
						});
					}
				});
			}catch (error){
				socket.emit('build', {'status': 'error', 'resutls': error});
			}
		});
	})
}