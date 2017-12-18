$(document).ready(function() {
	var socket = io();
	if(reftk != ''){
		socket.emit('oauth_load');
	}else{
		window.location.href = '/logout';
	}
});