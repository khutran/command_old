var connection = require('./config');
var path = require('./config').path;
var mysql = require('./config').mysql;
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var request = require('request');

var loginM = function(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/');
}

var finddatabase = function(domain, callback) {
    var WPDBNAME = `cat ${path}/web/${domain}/workspace/wp-config.php | grep DB_NAME`;
    var LDBNAME = `cat ${path}/web/${domain}/workspace/.env | grep DB_DATABASE`;
    exec(WPDBNAME, function(error, data) {
        if (error) {
            exec(LDBNAME, (err, data1) => {
                if (error) {
                    return callback({ 'stt': 'error', 'error': 'not find file config' });
                } else {
                    var arr = data.split("\n");
                    return callback({ 'stt': 'suscess', 'data': arr[0].replace(/ /gi, '').slice(18, -3) });
                }
            });
        } else {
            var arr = data.split("\n");
            return callback({ 'stt': 'suscess', 'data': arr[0].replace(/ /gi, '').slice(18, -3) });
        }
    });
};

var dump = function(res, domain, callback) {
    finddatabase(domain, function(resutls) {
        if (resutls.stt == 'error') {
            res.end();
        } else if (resutls.stt == 'suscess') {
            var dumpdatabase = spawn('mysqldump', [
                '-u' + mysql.user,
                '-p' + mysql.password,
                '-h' + mysql.host,
                resutls.data,
                '--default-character-set=utf8',
                '--comments'
            ], {
                highWaterMark: 16 * 1024
            });
            res.setHeader('Content-Type', 'application/octet-stream');
            res.setHeader('Content-disposition', `filename=${resutls.data}.sql`);
            dumpdatabase.stdout.pipe(res);
        } else {
            res.end();
        }
    });
}

var create_token = function(cliend, callback) {
    request.post({
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic YjU0NVVRcmFmWk1ONHZTR1NXOkNIRnpRa0FTN2IyWEtTbjRRYWJiUjJHYzY5WnJ0Rlk1'
        },
        url: 'https://bitbucket.org/site/oauth2/access_token',
        body: `grant_type=authorization_code&code=${cliend}`
    }, function(error, response, body) {
        body = JSON.parse(body);
        callback(body);
    });
}
var refresh_token = function(code, callback) {
    request.post({
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic YjU0NVVRcmFmWk1ONHZTR1NXOkNIRnpRa0FTN2IyWEtTbjRRYWJiUjJHYzY5WnJ0Rlk1'
        },
        url: 'https://bitbucket.org/site/oauth2/access_token',
        body: `grant_type=refresh_token&refresh_token=${code}`
    }, function(error, response, body) {
        body = JSON.parse(body);
        callback(body);
    });
}

module.exports = {
    loginM: loginM,
    dump: dump,
    create_token: create_token,
    refresh_token: refresh_token
}