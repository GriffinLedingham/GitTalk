var socket;
var user_name = '';
var joined_room = false;
var unread_msg = 0;
var is_mobile = false;

var init = function(){
  if( navigator.userAgent.match(/Android/i)
   || navigator.userAgent.match(/webOS/i)
   || navigator.userAgent.match(/iPhone/i)
   || navigator.userAgent.match(/iPad/i)
   || navigator.userAgent.match(/iPod/i)
   || navigator.userAgent.match(/BlackBerry/i)
   || navigator.userAgent.match(/Windows Phone/i)
   ){
      is_mobile = true;
    }
   else {
      is_mobile = false;
    }
  $('#viewport').css('height', ($(window).height() - 111) + 'px');

  $(window).resize(function(){
    $('#viewport').css('height', ($(window).height() - 111) + 'px');
  });

  socket = io.connect('http://www.gittalk.ca/',{'force new connection':true});

  var oauth_token = getCookie('oauth_token');
  if(oauth_token !== '')
  {
    socket.emit('oauth_login',oauth_token);
  }
  else
  {
    var access_token = getCookie('access_token');
    if(access_token !== '')
    {
      socket.emit('login',access_token);
    }
    else
    {
      window.location.replace('http://www.gittalk.ca/login.html');
    }
  }

  socket.on('disconnect',function(data){
    $('#textarea').prop('disabled', false);
    joined_room = false;
  });

  socket.on('reconnect',function(data){
    $('#room_elements').html('<input id="room_input" class="room-input" placeholder="Join Room">');
    var oauth_token = getCookie('oauth_token');
    if(oauth_token !== '')
    {
      socket.emit('oauth_login',oauth_token);
    }
    else
    {
      var access_token = getCookie('access_token');
      if(access_token !== '')
      {
        socket.emit('login',access_token);
      }
      else
      {
        delCookie('access_token');
        delCookie('oauth_token');
        delCookie('last_room');
        socket.emit('logout');
        window.location.replace("http://www.gittalk.ca/login.html");
      }
    }
  });

  socket.on('repo_list',function(repo_list){
    for(var i =0;i<repo_list.length;i++)
    {
      $('#room_elements').append('<div class="bubble-rooms" id="'+repo_list[i].name+'" data-repo="'+repo_list[i].owner+'/'+repo_list[i].name+'">'
        +'<img style="position: absolute;top: 8px;left:20px;" src="../assets/room_icon.png" height=20 width=20/>'
        +'<span style="top: 8px;left: 50px;position: absolute;">'+repo_list[i].owner.substring(0,3)+'..'+'/'+repo_list[i].name+'</span>'+'</div>');
    }
    var room_cookie = getCookie('last_room');
    if(room_cookie !== '')
    {
      var room_el = $("div").find("[data-repo='" + room_cookie + "']");
      room_el.addClass('selected-room');
    }
    $('.bubble-rooms').on('click',function(){
      $('#viewport').html('');
      document.cookie="last_room="+$(this).data('repo')+ '; expires=Fri, 31 Dec 9999 23:59:59 GMT; domain=.gittalk.ca';
      joined_room = true;
      $('#textarea').prop('disabled', false);
      $('.selected-room').removeClass('selected-room');
      $(this).addClass('selected-room');
      if($('#repo_list').hasClass('mobile-repo-open'))
      {
        $('#repo_list').removeClass('mobile-repo-open');
      }
      $('#viewport').html('<div id="floatingBarsG"><div class="blockG" id="rotateG_01"></div><div class="blockG" id="rotateG_02"></div><div class="blockG" id="rotateG_03"></div><div class="blockG" id="rotateG_04"></div><div class="blockG" id="rotateG_05"></div><div class="blockG" id="rotateG_06"></div><div class="blockG" id="rotateG_07"></div><div class="blockG" id="rotateG_08"></div></div>')
      socket.emit('join_room', $(this).data('repo'));
    });
  });

  socket.on('login_success', function(user){  
    count = 0;
    $('#login_box').css('display','none');
    user_name = user.name;
    $('#logout_img').attr('src',user.img);
    $('#login').css('display','none');
    $('#logout').css('display','block');
    var room_cookie = getCookie('last_room');
    if(room_cookie !== '')
    {
      joined_room = true;
      $('#textarea').prop('disabled', false);
      socket.emit('join_room', room_cookie);
    }
  });

  socket.on('join_room_message', function(data){
    $('#viewport').html('');
    $('#viewport').append(data.info);
    $("#viewport").scrollTop($("#viewport")[0].scrollHeight);
  });

  socket.on('summary_message',function(data){
    data = JSON.parse(data);
    for(var i = 0;i<data.sentences.length;i++)
    {
      if(data.sentences[i].score !== 0)
      {
        var popout_html = '<span class="arrow-left"></span><span class="pop-name">'+data.sentences[i].uname+'</span><span class="pop-date">'+getDate(data.sentences[i].ts)+'</span><br><span class="pop-message">'+((typeof data.sentences[i].rich !== 'undefined')?data.sentences[i].rich : data.sentences[i].word)+'</span>';
        $('#sentence_objects').append('<div class="search-object'+((i===data.sentences.length-1)?' end':'')+'"><span class="search-sentence-message">'+data.sentences[i].word+'</span><span id="sentence_'+i+'" class="popout">'+popout_html+'</span><span class="caret-icon-sent"></span></div>');
      }
      else
      {
        if(i === data.sentences.length-1)
        {
          $('#sentence_objects').find('div').last().addClass('end');
        }
      }
    }
    if($('#sentence_objects').children().length === 0)
    {
      $('#sentence_objects').html('<span class="search-empty">No results found</span>');
    }

    for(var i = 0;i<data.top_words.length;i++)
    {
      if(data.top_words[i].num !== 0)
      {
        $('#word_objects').append('<div class="search-object'+((i===data.top_words.length-1)?' end':'')+'">'+data.top_words[i].word+'</div>');
      }
      else
      {
        if(i === data.top_words.length-1)
        {
          $('#word_objects').find('div').last().addClass('end');
        }
      }
    }
    if($('#word_objects').children().length === 0)
    {
      $('#word_objects').html('<span class="search-empty">No results found</span>');
    }
  });

  socket.on('payload_message', function(message_data){
    var date = new Date(message_data.timestamp * 1000);
    var hour = date.getHours();
    var minutes = ("0"+date.getMinutes()).slice(-2);
    var seconds = ("0"+date.getSeconds()).slice(-2);
    message_data.message = linkify(message_data.message,message_data.commitId);
    if($('#viewport > div').length > 50)
    {
      $('#viewport').find('div').first().remove();
    }

    $("#viewport").append('<div class="bubble">' + '<img class="user-image" src="'+((typeof message_data.image !== 'undefined')? message_data.image : '../assets/default_user.png' )+ '" height=40 width=40>' + '<div class="user-message">' +   '<b>' + message_data.uname +'</b>: '+message_data.message+'</div><span class="main-date">'+getDate(message_data.timestamp)+'</span></div>');

    $("#viewport").scrollTop($("#viewport")[0].scrollHeight);
    if(window.document.hasFocus() === false)
    {
      unread_msg++;
      document.title = '(' + unread_msg + ') GitTalk'; 
    }

  });

  socket.on('message', function(message_data){
    var date = new Date(message_data.timestamp * 1000);
    var hour = date.getHours();
    var minutes = ("0"+date.getMinutes()).slice(-2);
    var seconds = ("0"+date.getSeconds()).slice(-2);
    message_data.message = linkify(message_data.message);
    message_data.message = thumb(message_data.message);
    if(typeof message_data.uname !== 'undefined')
    {
      if(message_data.uname === user_name)
      {
        //$("#viewport").append('<div class="bubble-you">'+hour+':'+minutes+':'+seconds+ ' [' + message_data.uname + '] <br>'+message_data.message+'</div>');
        $("#viewport").append('<div class="bubble-you">'+ '<img class="user-image" src="'+((typeof message_data.image !== 'undefined')? message_data.image : '../assets/default_user.png') + '" height=40 width=40>' + '<div class="user-message">'  + '<b>' + message_data.uname +'</b>: ' +message_data.message+'</div><span class="main-date">'+getDate(message_data.timestamp)+'</span></div>');
      }
      else
      {
        $("#viewport").append('<div class="bubble">' + '<img class="user-image" src="'+((typeof message_data.image !== 'undefined')? message_data.image : '../assets/default_user.png' )+ '" height=40 width=40>' + '<div class="user-message">' +   '<b>' + message_data.uname +'</b>: '+message_data.message+'</div><span class="main-date">'+getDate(message_data.timestamp)+'</span></div>');
      }
    }
    else
    {
      $("#viewport").append('<div class="bubble">' + '<img class="user-image" src="'+((typeof message_data.image !== 'undefined')? message_data.image : '../assets/default_user.png' )+ '" height=40 width=40>' + '<div class="user-message">' + '<b>Anonymous:</b> ' +message_data.message+'</div><span class="main-date">'+getDate(message_data.timestamp)+'</span></div>');
    }
    if($('#viewport > div').length > 50)
    {
      $('#viewport').find('div').first().remove();
    }
    $("#viewport").scrollTop($("#viewport")[0].scrollHeight);
    if(window.document.hasFocus() === false)
    {
      unread_msg++;
      document.title = '(' + unread_msg + ') GitTalk'; 
    }

  });

  $('#logout').on('click',function(e){
    delCookie('access_token');
    delCookie('oauth_token');
    delCookie('last_room');
    socket.emit('logout');
    window.location.replace("http://www.gittalk.ca/logout.html");
  });

  $('#textarea').keydown(function(e) {
      if(e.which == 13 && !event.altKey) {
        if(!joined_room) return;
        e.preventDefault();
        if($('#textarea').val() === '')
        {
          return;
        }
        if(this.uname !== '')
        {
          socket.emit('message', {message:JSON.parse(JSON.stringify($('#textarea').val().replace(/(<([^>]+)>)/ig,"")))});
          $('#textarea').val('');
        }
        else
        {
          var date = new Date;
          date.setTime(Date.now());
          var hour = date.getHours();
          var minutes = ("0"+date.getMinutes()).slice(-2);
          var seconds = ("0"+date.getSeconds()).slice(-2);
          $("#viewport").append('<div class="bubble">'+hour+':'+minutes+':'+seconds+ ' [Server] <br>'+'Please use login before posting.'+'</div>');
          $('#textarea').val('');
        }
      }
    });

  $('#send').on('click',function(e) {
        if(!joined_room) return;
        e.preventDefault();
        if($('#textarea').val() === '')
        {
          return;
        }
        if(this.uname !== '')
        {
          socket.emit('message', {message:JSON.parse(JSON.stringify($('#textarea').val().replace(/(<([^>]+)>)/ig,"")))});
          $('#textarea').val('');
        }
        else
        {
          var date = new Date;
          date.setTime(Date.now());
          var hour = date.getHours();
          var minutes = ("0"+date.getMinutes()).slice(-2);
          var seconds = ("0"+date.getSeconds()).slice(-2);
          $("#viewport").append('<div class="bubble">'+hour+':'+minutes+':'+seconds+ ' [Server] <br>'+'Please use login before posting.'+'</div>');
          $('#textarea').val('');
        }
    });

    $('#search_input').keydown(function(e) {
      if(e.which == 13) {
        if(!joined_room) return;
        $('#sentence_objects').html('');
        $('#word_objects').html('');
        if($('#search_input').val() === '')
        {
          return;
        }
        socket.emit('find_message', {message:JSON.parse(JSON.stringify($('#search_input').val().replace(/(<([^>]+)>)/ig,"")))});
        $('#search_input').val('');
      }
    });

    $('#room_input').keydown(function(e) {
      if(e.which == 13) {
        if($('#room_input').val() === '')
        {
          return;
        }
        socket.emit('update_rooms', {message:JSON.parse(JSON.stringify($('#room_input').val().replace(/(<([^>]+)>)/ig,"")))});
        $('#room_elements').html('');
        $('#room_input').val('');
      }
    });    

    $('.search-open').on('click',function(e){
      

    });

    $('#search').on('click',function(e){
      if(!is_mobile)
      {
        if($(window).width() <= 575)
        {
          if($('#repo_list').hasClass('small-repo-open'))
          {
            $('#repo_list').removeClass('small-repo-open');
          }
          else
          {         
            $('#repo_list').addClass('small-repo-open');
          }
        }
        else
        {
          if($('#search').hasClass('search-open'))
          {
            $('#input').addClass('input-closed');
            $('#send').addClass('send-closed');
            $('#user_list').addClass('user-list-closed');
            $('#search').removeClass('search-open');
            $('#main').removeClass('main-open');

          }
          else
          {
            $('#input').removeClass('input-closed');
            $('#send').removeClass('send-closed');
            $('#user_list').removeClass('user-list-closed');
            $('#search').addClass('search-open');
            $('#main').addClass('main-open');

          }
        }
      }
      else
      {
        if($('#repo_list').hasClass('mobile-repo-open'))
        {
          $('#repo_list').removeClass('mobile-repo-open');
        }
        else
        {         
          $('#repo_list').addClass('mobile-repo-open');
        }
      }
    });

    $(window).focus(function(){
      unread_msg = 0;
      document.title = 'GitTalk';
    });
}

function getCookie(cname)
{
  var name = cname + "=";
  var ca = document.cookie.split(';');
  for(var i=0; i<ca.length; i++) 
    {
    var c = ca[i].trim();
    if (c.indexOf(name)==0) return c.substring(name.length,c.length);
    }
  return "";
}

function delCookie(name)
{
    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT; domain=.gittalk.ca';
}

function linkify(inputText,commitId) {
    if(inputText.indexOf('/compare/') !== -1 && inputText.indexOf('github.com') !== -1 && typeof commitId !== 'undefined')
    {
      replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
      replacedText = inputText.replace(replacePattern1, '<a href="$1" target="_blank">'+commitId.substring(0,7)+'</a>');
      return replacedText;
    }
    else
    {
      var replacedText, replacePattern1, replacePattern2, replacePattern3;

      replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
      replacedText = inputText.replace(replacePattern1, '<a href="$1" target="_blank">$1</a>');

      replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
      replacedText = replacedText.replace(replacePattern2, '$1<a href="http://$2" target="_blank">$2</a>');

      replacePattern3 = /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim;
      replacedText = replacedText.replace(replacePattern3, '<a href="mailto:$1">$1</a>');

      return replacedText;
    }
}

function thumb(message) {
  return message.replace(/\(y\)/gi, '<img src="assets/thumb.png" height=20 width=20></img>').replace(/\(n\)/gi, '<img src="assets/down.png" height=20 width=20></img>');
}

function getDate(ts){
     var a = new Date(ts);
     var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
     var year = a.getFullYear();
     var month = months[a.getMonth()];
     var date = a.getDate();
     var hour = ('0' + a.getHours()).slice(-2);
     var min = ('0' + a.getMinutes()).slice(-2);
     var sec = ('0' + a.getSeconds()).slice(-2);
     var time = month+' '+date+', ' +year+', '+hour+':'+min ;
     return time;
}

function decodeEntities(str)
{
  return $("<div/>").html(str).text();
}