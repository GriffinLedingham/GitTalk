GitTalk
===========

An open-source GitHub chat application, under the GPL v2 license.

/js/config.js must be modified to use your own database for use of the GitTalk server.

DB Structure
===========

posts:
  uname,
  room,
  message,
  timestamp,
  img
  
rooms:
  token,
  rooms

users:
  uname,
  password,
  token,
  email
