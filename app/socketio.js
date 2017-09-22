var Q = require('q');
var exec = require('child_process').exec;

module.exports = function(io){

	io.on('connection', function(socket){
		socket.on('send command', function(command){
			try {
				process.chdir(`/var/www/web/${command.domain}/workspace`);
				var promise = function(){
					return Q.promise((res) => {
						var cmd = command.command.split(" ");
						switch (cmd[0]){
							case 'pwd':
							case 'php':
							case 'composer':
								exec(command.command, function(error, resutls){
									if (error) {
										return res({'status': 'error', 'error': error.stack});
									}else {
										return res({'status': 'suscess', 'data':resutls});
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
				// console.log(err.message);
			}

		});
	})

}