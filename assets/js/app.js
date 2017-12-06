 
  $(function () {
    // var ns = io('/test');
    var user = $('#user span').text();
    var socket = io.connect({query: `user=${user}`});
    var domain = $('span#domain').text();

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
        $('.loads').empty();
        socket.emit('cd', {'domain': domain});
        $(this).css('display', 'none');
        $('#back').css('display', 'inline-block');
      }
    });

    $('#back').click(function(event) {
      $('.loads').empty();
      socket.emit('loads', {'domain': domain});
      $(this).css('display', 'none');
      $('#wordpress').css('display', 'inline-block');
    });;

    $('#myModal1').on('show.bs.modal',function(){
      if($('#img1').css('display') == 'inline-block'){
        $('.build').attr('disabled', 'disabled');
       }else{
        $('.build').removeAttr('disabled');
        $('.status').text('')
        $('.log').css('display', 'none');
        $('.number').text('');
        $('.viewlog').text('');
        $('.composer').prop('checked', false);
        $('.database').prop('checked', false)
        $('.logapi').text('');
      }
    });

    $('#myModal2').on('show.bs.modal',function(){
      if($('.info').css('display') == 'inline-block' && $('#img2').css('display') == 'inline-block'){
        return false;
      }else{
        let suscess = $('.show_create').text();
        if(suscess.indexOf('suscess') != -1 || suscess.indexOf('error') != -1 || $('.create_project').val() == ''){
          $('.create_project').val('');
          $('.git').val('');
          $('.show_create').empty();
          $('.info').css('display', 'none');
          $('#create_project_new').css('display', 'none');
          $('.Send_create_project').css('display', 'inline-block');
        }else{
          return false;
        }
      }
    });

    $('.Send_create_project').click(function() {
      var name_project = $('.create_project').val();
      var git = $('.git').val();
      $("#img2").css('display', 'inline-block');
      // $('.info').css('display', 'inline-block');
      // $('.database-db').val('vicoders_' + name_project.replace('\.vicoders\.com', '') + '_db');
      // $('.prefix-db').val('wp_')
      // $('.Send_create_project').css('display', 'none');
      // $('#create_project_new').css('display', 'inline-block');
      socket.emit('create_project', {user: user, project: name_project, git: git});
    });

    $('#create_project_new').click(function() {
      $("#img2").css('display', 'inline-block');
      var name_project = $('.create_project').val();
      var database = $('.database-db').val();
      var user_db = $('.user-db').val();
      var password = $('.password-db').val();
      var host = $('.host-db').val();
      var prefix = $('.prefix-db').val();
      $('#create_project_new').attr('disabled', 'disabled');
      socket.emit('create_web_new', {project: name_project, database: database, user_db: user_db, password: password, host: host, prefix: prefix});
    });

    $('.build').click(function() {
      var composer = $('.composer').prop('checked');
      var importdb = $('.database').prop('checked');
      $("#img1").css('display', 'inline-block');
      $('.build').attr('disabled', 'disabled');
      $('.status').text('');
      $('.number').text('');
      $('.log').css('display', 'none');
      $('.logapi').text('');
      socket.emit('build', {'domain': domain, 'user': user, 'composer': composer, 'importdb': importdb});
    });

    $('.log').click(function() {
      $('.viewlog').text('');
      socket.emit('viewlog', {'domain': domain, 'numberbuild': $('.number').text(), 'user': user});
    });;

    $('.download').click(function() {
        $('#results').empty();
        var url = '/download?domain='+domain;
        window.location.href = url;
    });

    $('#create_rooms').click(function() {
      socket.emit('create_rooms', user);
    });

    $('#out_rooms').click(function() {
      socket.emit('out_rooms', user);
    });

    socket.emit('loads', {'domain': domain});

    // socket.on('dump', function(dump){
    //   if(dump.status == 'suscess'){
    //     var url = '/download/'+dump.database+'.sql';
    //     window.location.href = url;
    //     return false;
    //   }else if(dump.status == 'error'){
    //     $('#results').append($('<pre>').text(dump.error));
    //   }
    // });

    socket.on('create_project', function(data){
      var name_project = $('.create_project').val();
      $("#img2").css('display', 'none');
      $('.show_create').text(data.resutls);
      $('.info').css('display', 'inline-block');
      $('.database-db').val('vicoders_' + name_project.replace('\.vicoders\.com', '') + '_db');
      $('.prefix-db').val('wp_')
      $('.Send_create_project').css('display', 'none');
      $('#create_project_new').css('display', 'inline-block');
    });

    socket.on('create_web_new', function(data){
      $("#img2").css('display', 'none');
      $('.show_create').text(data.resutls);
      $('#create_project_new').removeAttr('disabled');
    });

    socket.on('loads', function(loads){
      $('#loads').empty();
      var listfile =  loads.resutls.split('\n');
      var dem = listfile.length/3;
      var list = [];
      var dem1 = 0;
      for(i = 0 ; i < 3; i++){
        var minifile = listfile.slice(dem1, Math.round(dem) + dem1);
        dem1 = dem1 + Math.round(dem);
        list.push(minifile);
      }
      if(loads.framework == 'wordpress'){
        $('.text-last').css('display', 'inherit');
        $("#wordpress").css('display', 'inline-block');
          list.forEach(function(value, keys){
            value.forEach(function(value2, keys2){
              $(`#loads${keys}`).append($('<li>').text(value2));
            });
          });
      }else{
        list.forEach(function(value, keys){
          value.forEach(function(value2, keys2){
            console.log(value2);
            // if(value2)
            $(`#loads${keys}`).append($('<li>').text(value2));
          });
        });
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

    socket.on('build', function(build){
      if(build.resutls){
        $('.color').attr('src', '/assets/images/'+build.resutls+'.png');
      }
      if(build.status == 'error'){
        $("#img1").css('display', 'none');
        $('.status').text(build.status);
        $('.number').text(build.number);
        $('.log').css('display', 'inline-block');
        $('.build').removeAttr('disabled');
        if(build.body){
          $('.logapi').text(build.body)
        }
      }else{
        $('.build').removeAttr('disabled');
        $("#img1").css('display', 'none');
        if(build.resutls == 'blue' || build.resutls == 'grey'){
          $('.status').text('build sucess');
          if(build.body){
           $('.logapi').text(build.body)
          }
        }
        else{
          $('.status').text('build false');
          $('.number').text(build.number);
          $('.log').css('display', 'inline-block');
            if(build.body){
              $('.logapi').text(build.body)
            }
        }
      }
      
    });

    socket.on('viewlog', function(viewlog){
      $('.viewlog').append($('<pre>').text(viewlog));
    });

    socket.on('connect', function(){
      socket.emit('userlogin', {'user': user});

    });

    socket.emit('loaduser');

    socket.on('loaduser', function(data){
      data.forEach(function(user){
        $('.showuser').append(`<li class="${user.user}_i list-group-item"><i class="fa fa-user-o" aria-hidden="true"></i> ${user.user}</li>`)
      });
    });

    socket.on('noticationalluser', function(data){
      var data_user = $(`.${data.user}_i`).val();
      if(data_user == 'undefined'){
        return;
      }else{
        $('.showuser').append(`<li class="${data.user}_i list-group-item" ><i class="fa fa-user-o" aria-hidden="true"></i> ${data.user}</li>`)
      }
    });

    socket.on('noticationalluserout', function(data){
      $('li').remove(`.${data}_i`);
    });

});
