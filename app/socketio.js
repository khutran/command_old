var Q = require('q');
var request = require('request');
var exec = require('child_process').exec;
var path = require('./config').path;
var connection = require('./config');
const fs = require('fs');
var spawn = require('child_process').spawn;
var listuser = require('./config').listuser;
var createweb = require('./create_project/createweb.js').create_config;
var listrooms = [];

module.exports = function(io){
    // console.log(Object.values(io.nsps));
    // ns = io.of('rooms1');
    // ns.on('connection', (socket)=>{
    //  socket.join('rooms');
    //  socket.on('rooms', (data)=>{
    //      console.log(data);
    //  });
    // });
    io.on('connection', function(socket){
        // socket.broadcast.to('khu_idmimoW1').emit('chat', 'hello');
        socket.on('create_rooms', (name_rooms)=>{
            listrooms.push(name_rooms);
            socket.join(name_rooms);
            console.log(socket.adapter.rooms);
        });

        socket.on('out_rooms', (name_rooms)=>{
            socket.leave(name_rooms);
            console.log(socket.adapter.rooms);
        });

        io.engine.generateId = function (req) {
            return `${req._query['user']}_idmimoW1`
        }
        
        socket.on('userlogin', function(data){
            var user = {'user': data.user, 'id_socket': socket.id};
            listuser.forEach(function(value, key){
                if(value.user == data.user){
                    listuser.splice(key, 1);
                }
            });
            listuser.push(user);
            socket.broadcast.emit('noticationalluser', user);
        });

        socket.on('checklogin', function(data){
            listuser.forEach(function(xxx, key){
                if(xxx.user == data.user){
                    socket.emit('checklogin', data);
                }
            });
        });

        socket.on('disconnect', function(data){
            var userout = ''
            listuser.forEach(function(value, key){
                if(value.id_socket == socket.id){
                    listuser.splice(key, 1);
                    userout = value.user;
                }
            });
            socket.broadcast.emit('noticationalluserout', userout);
        });

        socket.on('loaduser_online', function(){
            socket.emit('loaduser_online', listuser);
        });

        var checknextbuild = function(domain, connect){
            return Q.promise((respose)=>{
                connect.job.get(domain, function(error, data){
                    if(error){
                        return respose('-1');
                    }else{
                        return respose(data.nextBuildNumber);
                    }
                });
            });
        };

        var checkuilderror = function(color, number){
            if(color == 'blue' || color == 'blue_anime'){
                socket.emit('build', {'status': 'suscess', 'resutls': color});
            }else{
                socket.emit('build', {'status': 'error', 'resutls': color, 'number': number});
            }
        };

        var buildapierror = function(color, number, body){
            if(color == 'blue' || color == 'grey'){
                socket.emit('build', {'status': 'suscess', 'resutls': color, 'body': body});
            }else{
                socket.emit('build', {'status': 'error', 'resutls': color, 'number': number, 'body': body});
            }           
        };

        var runapi = function(domain, composer, importdb,callback){
            var headers = {
                'User-Agent':       'Super Agent/0.0.1',
                'Content-Type':     'application/x-www-form-urlencoded'
            }

           var options1 = {
             url: 'http://aaaaautopushsqlaa.vicoders.com',
             method: 'POST',
             headers: headers,
             form: {'website': domain, 'select': 'command'}
           };
           var options2 = {
             url: 'http://aaaaautopushsqlaa.vicoders.com',
             method: 'POST',
             headers: headers,
             form: {'website': domain, 'select': 'database'}
           };
           if(!composer && !importdb){
                return callback({'status':'next'});
           }else if(composer == true && importdb == false){
                request(options1, function (error, response, body){
                    if (!error && response.statusCode == 200) {
                        body = body.replace(/\[\"/gi, "");
                        body = body.replace(/\"\]/gi, "");
                        if(body.indexOf('errorxxx') != -1){
                            return callback({'status':'apierror', 'body': body});
                        }else{
                            return callback({'status':'next', 'body': body});
                        }
                    }
                });             
            }else if(composer == false && importdb == true){
                request(options2, function(error, respose, body){
                    if(!error && respose.statusCode == 200){
                        body = body.replace(/\[\"/gi, "");
                        body = body.replace(/\"\]/gi, "");
                        if(body.indexOf('errorxxx') != -1){
                            return callback({'status':'apierror', 'body': body});
                        }else{
                            return callback({'status':'next', 'body': body});
                        }
                    }
                });
            }else if(composer == true && importdb == true){
                request(options1, function (error, response, body){
                //  console.log(body);
                    if (!error && response.statusCode == 200 && body.indexOf('errorxxx') == -1) {
                        request(options2, function(error1, respose1, body1){
                            if(!error1 && respose1.statusCode == 200){
                                body1 = body1.replace(/\[\"/gi, "");
                                body1 = body1.replace(/\"\]/gi, "");
                                if(body1.indexOf('errorxxx') != -1){
                                    return callback({'status':'apierror', 'body': body1});
                                }else{
                                    return callback({'status':'next', 'body': body1});
                                }
                            }
                        });
                    }else{
                        body = body.replace(/\[\"/gi, "");
                        body = body.replace(/\"\]/gi, "");
                        return callback({'status':'apierror', 'body': body});
                    }
                });                     
            }
        };

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
                        socket.emit('loads',{'resutls':error.message, 'framework': 'framework'});
                    }else{
                        socket.emit('loads',{'resutls': data, 'framework': 'framework'});
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
                    if (data.status === 'error'){
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
                exec(`tail -n 20 ${path}/log/lif.log`, function(error, data){
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
                checknextbuild(build.domain, connect)
                .then((resutls)=>{
                    if(resutls == '-1'){
                        socket.emit('build', {'status': 'error', 'body': 'project not found'});
                    }else{
                        connect.job.build(build.domain ,function(err, data){
                            if(err){
                                socket.emit('build', {'status': 'error', 'body': err.message});
                            }else{
                                var stopget = 0;
                                var timeer = setInterval(function () {
                                    if(stopget == 0){
                                        connect.job.get(build.domain, function(er,data){
                                            let number = data.nextBuildNumber - 1;
                                            if(number == resutls){
                                                stopget++;
                                                if(data.color == 'blue' || data.color == 'blue_anime'){
                                                    runapi(build.domain, build.composer, build.importdb, function(next){
                                                        if(next.status == 'next'){
                                                            checkuilderror(data.color, number);
                                                            clearInterval(timeer);
                                                        }else if(next.status == 'apierror'){
                                                            buildapierror(data.color, number, next.body);
                                                            clearInterval(timeer);
                                                        }
                                                    });
                                                }else if(data.color == 'grey' || data.color == 'grey_anime' || data.color == 'green_anime'){
                                                        
                                                }
                                                else{
                                                    socket.emit('build', {'status': 'error', 'resutls': data.color, 'number': number});
                                                    clearInterval(timeer);
                                                }
                                            }
                                        });
                                    }
                                }, 30000); 
                            }
                        });
                    }
                });
            }catch (error){
                socket.emit('build', {'status': 'error', 'body': error});
            }
        });

        socket.on('viewlog', function(viewlog){
            let connectuser = `${viewlog.user}connect`;
            let connect = connection[connectuser];
            var log = connect.build.logStream(viewlog.domain, viewlog.numberbuild);

            log.on('data', function(text) {
              socket.emit('viewlog', text);
            });

            log.on('error', function(err) {
              socket.emit('viewlog', err);
            });

            log.on('end', function() {
              socket.emit('viewlog', 'end');
            });
        });

        socket.on('create_project', function(project){
            let connectuser = `${project.user}connect`;
            let connect = connection[connectuser];
            let name_file = project.project.replace('\.vicoders\.com', '');
            fs.readFile(__dirname + '/create_project/conig_file/config.xml', function(error, content){
                if(error){
                    socket.emit('create_project', {status: 'error', resutls: error});
                }else{
                    content = content.toString().replace('Git_new', `${project.git}`);
                    try{
                        connect.job.create(`${project.project}`, content, function(err1){
                            if(!err1){
                                connect.job.build(`${project.project}`, function(err2, data2){
                                    if(err2){
                                        socket.emit('create_project', {'status': 'error', 'resutls': err2.message});
                                    }else{
                                        var timeer = setInterval(function () {
                                                connect.job.get(`${project.project}`, function(er,data){
                                                    if(data.color == 'blue' || data.color == 'blue_anime'){
                                                        socket.emit('create_project', {status:'suscess', resutls: `create project ${project.project} suscess`});
                                                        clearInterval(timeer);
                                                    }else if(data.color == 'grey' || data.color == 'grey_anime' || data.color == 'green_anime'){
                                                        
                                                    }
                                                    else{
                                                        socket.emit('create_project', {'status': 'error', 'resutls': 'build error'});
                                                        clearInterval(timeer);
                                                    }
                                                });
                                        }, 30000);
                                    }
                                });
                            }else{
                                let err1mesages = err1.message.replace('jenkins: job\.create', '');
                                socket.emit('create_project', {status: 'error', resutls: `${project.user} ${err1mesages}`});
                            }
                        });
                    }catch (error){
                        socket.emit('create_project', {'status': 'error', 'resutls': 'build error'});
                    }
                }
            });
        });

        socket.on('create_web_new', function(data){
            runapi(`${data.project}`, true, false , function(next){
                if(next.status == 'next'){
                    createweb(data, function(resutls1){
                        if(resutls1.status == 'suscess'){
                            socket.emit('create_web_new', {status:'suscess', resutls: `build project ${data.project} suscess`});
                        }else{
                            socket.emit('create_web_new', {status:'error', resutls: `build project ${data.project} ${resutls1.results}`});
                        }
                    });
                }else if(next.status == 'apierror'){
                    socket.emit('create_web_new', {status:'error', resutls: `build project ${data.project} error`});
                }
            });
        });

        socket.on('view_user', function(user){
            let connectuser = `${user.useradmin}connect`;
            let connect = connection[connectuser];
            connect.view.get(user.name_check, (error, list)=>{
                if(error){
                    socket.emit('view_user', {'status': 'error', 'data': error.message});
                }else{
                    socket.emit('view_user', {'status': 'suscess', 'data': list.jobs});
                }
            });
        });

        socket.on('add_project', (add_project)=>{
            let connectuser = `${add_project.useradmin}connect`;
            let connect = connection[connectuser];
            connect.view.add(add_project.name, add_project.project, (error)=>{
                if(error){
                    socket.emit('add_project', {'status': 'error', 'data':error.message});
                }else{
                    socket.emit('add_project', {'status': 'suscess', 'data': add_project.project});
                }
            });
        });

        socket.on('out_project', function(data){
            let connectuser = `${data.useradmin}connect`;
            let connect = connection[connectuser];
            connect.view.remove(data.user, data.project, function(error){
                if(!error){
                    socket.emit('out_project', {'status':'suscess', 'data': data.project});
                }else{
                    socket.emit('out_project', {'status':'error', 'data': error.message});
                }
            });     
        });

        socket.on('load_config', function(domain){
            let connectuser = `${domain.user}connect`;
            let connect = connection[connectuser];
            connect.job.config(domain.domain, function(error, data){
                if(error){
                    socket.emit('load_config', {'status': 'error', 'data': error.message});
                }else{
                    let find_link1 = data.indexOf('bitbucket.org');
                    let find_link2 = data.indexOf('.git</url>');
                    let link_git = data.slice(find_link1+14, find_link2);
                    var arr_bit = link_git.split('\/');
                    socket.emit('load_config',{'status': 'suscess', 'data': arr_bit});
                }
            });
        });

        // socket.on('oauth_load', function(){
        //  console.log(arr_bit);
        // });
        // socket.on('load_user_proje', function(){
        //  let connectuser = "khuconnect";
        //  let connect = connection[connectuser];
        //  connect.view.list(function(error, data){
        //      if(error){
        //          socket.emit('load_user_proje');
        //      }else{
        //          socket.emit('load_user_proje', data);
        //      }
        //  });
        // });
        // socket.on('dump', function(dump){
        //  var finddatabase = function(domain, callback){
        //      var WPDBNAME=`cat ${path}/web/${domain}/workspace/wp-config.php | grep DB_NAME`;
        //      exec(WPDBNAME, function(error, data){
        //          if(error){
        //              return callback({'stt': 'error', 'error': error.message});
        //          }else{
        //              var arr = data.split("\n");
        //              return callback({'stt': 'suscess', 'data':arr[0].slice(19, -3)});
        //          }
        //      });     
        //  };
        //  finddatabase(dump.domain, function(resutls){
        //      if(resutls.stt == 'error'){
        //          socket.emit('dump', {'status': 'error', 'error': resutls.error});
        //      }else if(resutls.stt == 'suscess'){
        //          var dumpdatabase = spawn('mysqldump', [
        //           '-u' + mysql.user,
        //           '-p' + mysql.password,
        //           '-h' + mysql.host,
        //           resutls.data,
        //           '--default-character-set=utf8',
        //           '--comments'
        //          ]);
        //          var wstream = fs.createWriteStream(__dirname + '/../download/'+resutls.data+'.sql', 'utf8');
        //          dumpdatabase.stdout.pipe(wstream);
        //          wstream.on('finish',function(){
        //              socket.emit('dump', {'status': 'suscess', 'database': resutls.data});
        //          });
        //      }else{
        //          socket.emit('dump', {'status': 'error', 'error': 'error farta'});
        //      }
        //  });
        // });
        //
    });
}
