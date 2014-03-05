var init = function(){
  var oauth_token = getCookie('oauth_token');
  var access_token = getCookie('access_token');
  if(oauth_token !== '' || access_token !== '')
  {
    window.location.replace('http://www.gittalk.ca/chat.html');
  }
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