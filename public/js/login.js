var init = function(){
  var oauth_token = getCookie('oauth_token');
  var access_token = getCookie('access_token');
  if(oauth_token !== '' || access_token !== '')
  {
    window.location.replace('http://www.gittalk.ca/chat.html');
  }

  $('#login').on('click',function(){
      login();
  });

  $('#username').keydown(function(e) {
    if(e.which == 13) {
      login();
    }
  });

  $('#password').keydown(function(e) {
    if(e.which == 13) {
      login();
    }
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

function login(){
  $.ajax({
          url:'http://www.gittalk.ca/loginrequest',
          type:'POST',
          datatype:'json',
          data:{username:$('#username').val(),password:$('#password').val()},
          success: function(data) { 
            if(data === 'true' || data === true)
            {
              //success
              window.location.replace('http://www.gittalk.ca/chat.html');
            }
            else
            {
              if(data.code === 'NO_USR_ENTRY')
              {
                //no user found
                $('.login-user-error').html('User does not exist.');
                $('.login-user-error').addClass('signup-error-visible');
                window.setTimeout(function(){$('.login-user-error').removeClass('signup-error-visible');},5000);
              }
              else if(data.code === 'WRONG_PASSWORD')
              {
                $('.login-user-error').html('Password is incorrect.');
                $('.login-user-error').addClass('signup-error-visible');
                window.setTimeout(function(){$('.login-user-error').removeClass('signup-error-visible');},5000);
              }
            }
          }
        });
}

