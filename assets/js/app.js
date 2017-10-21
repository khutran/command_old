  $(function () {
    var socket = io();
    var domain = $('span#domain').text();
    var user = $('#user span').text();
    $('#send').click(function(){
      $('#results').empty();
      $("#img").css('display', 'inline-block');
      var command = $('#command').val();
      socket.emit('send command', { 'command':command, 'domain': domain });
      $('#command').val('');
      return false;
    });
    
    $('#logs').click(function() {
      $('#results').empty();
      socket.emit('logs', {'domain': domain});
    });

    $('#wordpress').click(function(event) {
      var display = event.target.style.display;
      if(display == 'node'){
        return;
      }else{
        $('#loads').empty();
        socket.emit('cd', {'domain': domain});
        $(this).css('display', 'none');
      }
    });

    $('#myModal').on('show.bs.modal',function(){
      $('.status').text('')
    });


    $('.build').click(function() {
      $("#img1").css('display', 'inline-block');
      socket.emit('build', {'domain': domain, 'user': user});
    });

    socket.on('build', function(build){
      if(build.status == 'error'){
        $("#img1").css('display', 'none');
        $('.status').text(build.status)
      }else{
        $("#img1").css('display', 'none');
        if(build.resutls == 'blue'){
          $('.status').text('build sucess');
        }
        else{
          $('.status').text('build false');
        }
      }
      
    });

    socket.emit('loads', {'domain': domain});

    socket.on('loads', function(loads){
      $('#loads').empty();
      if(loads.framework == 'wordpress'){
        $("#wordpress").css('display', 'inline-block');
        $('#loads').append($('<pre>').text(loads.resutls));
      }else{
        $('#loads').append($('<pre>').text(loads.resutls));
      }
    });

    socket.on('false', function(err){
          $('#results').append($('<pre>').text(err));
          $("#img").css('display', 'none');
    });

    socket.on('resutls', function(resutls){
        if(resutls == ''){
          $('#results').append($('<pre>').text('suscess'));
          $("#img").css('display', 'none');
        }else{
          $('#results').append($('<pre>').text(resutls));
          $("#img").css('display', 'none');
        }
    });
});
