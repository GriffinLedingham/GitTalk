var init = function(){
  var oauth_token = getCookie('oauth_token');
  var access_token = getCookie('access_token');
  if(oauth_token !== '' || access_token !== '')
  {
    window.location.replace('http://www.gittalk.ca/chat.html');
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

  $('#submit_btn').on('click',function(){
    submit_form();
  });

  $('#username').keydown(function(e) {
    if(e.which == 13) {
      submit_form();
    }
  });

  $('#password').keydown(function(e) {
    if(e.which == 13) {
      submit_form();
    }
  });

  $('#confirm_password').keydown(function(e) {
    if(e.which == 13) {
      submit_form();
    }
  });

  $('#email').keydown(function(e) {
    if(e.which == 13) {
      submit_form();
    }
  });
};

var submit_form = function(){
  var found_error = false;
    if($('#password').val() !== $('#confirm_password').val())
    {
      found_error = true;
      $('.signup-pass-error').html('Your passwords do not match.');
      $('.signup-pass-error').addClass('signup-error-visible');
      window.setTimeout(function(){$('.signup-pass-error').removeClass('signup-error-visible');},5000);
    }
    if($('#username').val() === '')
    {
      found_error = true;
      $('.signup-user-error').html('You must supply a username.');
      $('.signup-user-error').addClass('signup-error-visible');
      window.setTimeout(function(){$('.signup-user-error').removeClass('signup-error-visible');},5000);
    }
    if($('#username').val().replace(/[^a-z0-9_\-]/gi, '_').toLowerCase() !== $('#username').val().toLowerCase())
    {
      found_error = true;
      $('.signup-user-char-error').html('Please user valid characters in your username.');
      $('.signup-user-char-error').addClass('signup-error-visible');
      window.setTimeout(function(){$('.signup-user-char-error').removeClass('signup-error-visible');},5000);
    }

    var re = /^[0-9a-zA-Z`!"?$%\^&*()_\-+={\[}\]:;@~#|<,>.'\/\\]+$/;
    var pass_test = re.test($('#password').val());
    if(!pass_test)
    {
      found_error = true;
      $('.signup-pass-char-error').html('Please use valid characters in your password.');
      $('.signup-pass-char-error').addClass('signup-error-visible');
      window.setTimeout(function(){$('.signup-pass-char-error').removeClass('signup-error-visible');},5000);
    }

    re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    var email_test = re.test($('#email').val());
    if(!email_test)
    {
      found_error = true;
      $('.signup-email-error').html('Please use a valid email.');
      $('.signup-email-error').addClass('signup-error-visible');
      window.setTimeout(function(){$('.signup-email-error').removeClass('signup-error-visible');},5000);
    }


    if(!found_error)
    {
      $.ajax({
        url:'http://www.gittalk.ca/account',
        type:'POST',
        datatype:'json',
        data:{username:$('#username').val(),password:$('#password').val(),email:$('#email').val()},
        success: function(data){
          if(data === true || data === 'true')
          {
            //success msg
            $('.signup-user-success').html('Account created succesfully!');
            $('.signup-user-success').addClass('signup-error-visible');
          }
          else
          {
            if(typeof data !== 'undefined' && typeof data.code !== 'undefined')
            {
              if(data.code === 'ER_DUP_ENTRY')
              {
                //user already exists msg
                $('.signup-user-error').html('This user already exists.');
                $('.signup-user-error').addClass('signup-error-visible');
                window.setTimeout(function(){$('.signup-user-error').removeClass('signup-error-visible');},5000);
              }
            }
          }
        }
      });
    }
}