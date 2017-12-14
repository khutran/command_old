$(document).ready(function() {

    var user = $('#user span').text();
    var socket = io();

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

    $('#api').click(function() {
      window.open('https://bitbucket.org/site/oauth2/authorize?client_id=b545UQrafZMN4vSGSW&response_type=code', "mywindow","status=no", "toolbar=1");
    });

    var arr_user = [];
    $('.list_user').on('change', function(event) {
      $('.projects').empty();
      if(arr_user.length != 0){
        let = name_old = arr_user[0];
        if($(this).next('label').text() === name_old){
          arr_user.length = 0;
        }else{
          $(`#${name_old}_check`).prop('checked', false);
          arr_user.length = 0;
        }
      }
      arr_user.push($(this).next('label').text());
      if(this.checked){
        var name_check = ($(this).next('label').text());
        socket.emit('view_user', {'name_check': name_check, 'useradmin': user});
      }else{
        $('.projects').empty();
      }
    });

    $('.btn-add-project').click(function(event) {
      let name_project_add = $('.project_name').val();
      if(name_project_add ==='' || arr_user[0] === ''){
        return false;
      }else{
        socket.emit('add_project', {'name': arr_user[0],'project': name_project_add, 'useradmin': user});
        $('.project_name').val('');
      }
    });

    $('.search_user').click(function() {
      let user_search = $('.user_search').val();
      let list_user = $('div.user-item');
      list_user.css('display', 'none');
      $(`div.user-item.${user_search}_check`).removeAttr('style');
    });

    $('.user_search').click(function(){
      $('.user_search').keyup(function() {
        let key_search = $(this).val();
        if(key_search === ''){
          $('div.user-item').removeAttr('style');
        }
      })
    });

    socket.on('add_project', function(data){
      if(data.status === 'error'){
        alert(data.data);
        return false;
      }else{
        let project_add = data.data;
        let class_project_add = data.data.replace(/\./gi,'-');
        let compiled = _.template('<div class="project-item <%= class_project_add %>"><a href="/project/<%= project_add %>"><%= project_add %></a><i class="icon fa fa-times icon_delete" name="<%= project_add %>"></i></div>');
        $('.projects').append(compiled({project_add: project_add, class_project_add: class_project_add}));
      } 
    });

    socket.on('view_user', function(data){
      if(data.status === 'error'){
        let project = data.data;
        let compiled = _.template('<p><%= project %></p>');
        $('.projects').html(compiled({project: project}));
      }else{
        let project = data.data;
        let compiled = _.template('<% _.forEach(project, function(item){ %><% let name_class = item.name.replace(/\\./gi, \'-\'); %><div class="project-item <%= name_class %>"><a href="/project/<%= item.name %>"><%= item.name %></a><i class="icon fa fa-times icon_delete" name="<%= item.name %>"></i></div><% }); %>');
        $('.projects').html(compiled({project: project}));

        $('.icon_delete').click(function(){
          var name = $(this).attr('name');
          socket.emit('out_project', {'user': arr_user[0], 'project': name, 'useradmin': user});
        });

        socket.on('out_project', function(data){
          let out_html = data.data.replace(/\./gi, '-');
          if(data.status === 'suscess'){
            alert(`remove ${data.data} suscess`);
            $('div').remove(`.${out_html}`);
          }else{
            alert(`remove error : ${data.data}`);
          }
        });
        // project.forEach(function(item, index) {
        //   var container = document.createElement('div');
        //   var link = document.createElement('a');
        //   var icon = document.createElement('i');
        //   container.setAttribute('class', 'project-item');
        //   icon.setAttribute('class', 'icon fa fa-times icon_delete');
        //   link.setAttribute('href', 'aaaaaa');
        //   link.appendChild(document.createTextNode("CLICK ME"));
        //   // Put icon and link inside contaner
        //   container.appendChild(link);
        //   container.appendChild(icon);
        //   $('.projects').append(container);
        // });
      }
    });


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

    socket.on('connect', function(){
      socket.emit('userlogin', {'user': user});

    });

    // socket.emit('load_user_proje');

    // socket.on('load_user_proje', function(data){
    //   if(!data){
    //     console.log('false');
    //   }else{
    //     let compiled = _.template('<% _.forEach(users, (item)=>{ %><div class="user-item"><input class="list_user" type="checkbox" id="<%= item.name %>_check" /><label for=<%= item.name %>_check><%= item.name %></label></div><%});%>');
    //     $('.users').html(compiled({users: data}))
    //   }
    // });

    socket.emit('loaduser_online');

    socket.on('loaduser_online', function(data){
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