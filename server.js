/**************************************
	Requiring like it's nobody's
	business
***************************************/

var githubOAuth = require('github-oauth')({
  githubClient: '482c266c6abc02edd2f5',
  githubSecret: '8dd69bb939324fbb85b0470913e4156baa2a7361',
  baseURL: 'http://www.gittalk.ca/',
  loginURI: '/github',
  callbackURI: '/callback',
  scope:'repo, user'
});
var crypto = require('crypto');
var fs = require('fs')
var http = require('http');
var express = require('express');
var app = express();
app.configure(function(){
  app.use(express.static(__dirname + '/public'));
  app.use(express.bodyParser());
});
app.get('/github', function(req, res){
	return githubOAuth.login(req, res);
});
app.get('/callback', function(req, res){
	return githubOAuth.callback(req, res);
});
app.post('/account',function(req,res){
	createUser(req.body.username,req.body.password, req.body.email,function(response){
		res.send(response);
		res.end();
	});
});
app.post('/loginrequest',function(req,res){
	loginUser(req.body.username,req.body.password,function(response,token){
		if(response === true)
		{
			if(typeof token !== 'undefined' && token !== null)
			{
				res.cookie('access_token', token, { domain: '.gittalk.ca', maxAge: 90000000000});
				res.send(response);
				res.end();
			}
		}
		else
		{
			res.send(response);
			res.end();
		}
	});
});
var server = http.createServer(app);
var mysql = require('mysql');
var markx = require('markx');
var summary = require('./js/summary.js');
var config = require('./js/config');
var io = require('socket.io').listen(server);	
server.listen(8080);  
var gith = require( 'gith' ).create( 9001 );
var db = mysql.createConnection({
    host: config.host_name,
    user: config.user,
    password : config.password,
    database : config.database
}); 
var GitHubApi = require("github");
var github = new GitHubApi({
    version: "3.0.0",
    timeout: 5000
});
gith().on( 'all', function( payload ) {
	var message_data = {
		message: payload.urls.compare + ' Updated branch ' + payload.branch + ' with commit: ' + payload.original.head_commit.message.replace(/\+/g,' '),
		commitId: payload.sha,
		uname:payload.pusher,
		timestamp:payload.time,
		image: 'http://www.gittalk.ca/assets/default_user.png'
	};
	io.sockets.in(payload.repo).emit('payload_message', message_data);
	var unix_ts = new Date().getTime();
	var query = db.query("INSERT INTO posts (`uname` ,`room` , `message`, `timestamp`, `img`) VALUES ('"+payload.pusher+"','"+payload.repo+"','"+message_data.message+"','"+unix_ts+"','" + message_data.image + "');", function(err,result){
		console.log(err);
	});
});
io.set('log level', 0);
githubOAuth.on('error', function(err) {
  console.error('there was a login error', err);
});
githubOAuth.on('token', function(token, serverResponse) {
  console.log('here is your shiny new github oauth token', token);
  serverResponse.cookie('oauth_token', token.access_token, { domain: '.gittalk.ca', maxAge: 9000000000});
  serverResponse.writeHead(303, {
      Location: "/chat.html"
  });
  serverResponse.end();
});

/**************************************
	Whew, done setting globals
***************************************/

io.sockets.on('connection', function (socket) {
	socket.room = '';
	socket.u_name = '';

	socket.on('find_message',function(message_data){
		var query = db.query("SELECT message, uname, room, timestamp FROM posts WHERE room='"+socket.room+"'", function(err,info){
			var summ_arr = [];
			for(var i = 0;i<info.length;i++)
			{
				summ_arr.push({message:unescape(info[i].message), uname:info[i].uname,ts:info[i].timestamp});
			}
			summary.return_summary(message_data.message,[summ_arr],socket.room,function(data){
				socket.emit('summary_message', data);
			});
		});
	});

	socket.on('message', function(message_data)
	{
		var message = message_data['message'];
		var room = socket.room;

		if(message.indexOf('/code') !== -1)
		{
			var split_message = message.split('/code ');

			if(split_message[1] !== null)
			{
				var code_txt = split_message[1];
				markx({
					    input: '```javascript\n'+code_txt+'```',
					    template: 'markx/layout.html', 
					    highlight: true,
					    data: {}
					}, function(err, html) {
					var unix_ts = new Date().getTime();
					var message_data = {
						message: html,
						uname:socket.u_name,
						timestamp:unix_ts,
						image: socket.user_image
					}
					io.sockets.in(socket.room).emit('message', message_data);
					var query = db.query("INSERT INTO posts (`uname` ,`room` , `message`, `timestamp`, `img`) VALUES ('"+socket.u_name+"','"+socket.room+"','"+escape(message)+"','"+unix_ts+"','" + socket.user_image + "');", function(err,result){
						console.log(err);
					});
				});
			}	
		}
		else
		{
			var unix_ts = new Date().getTime();
			if(typeof socket.u_name !== 'undefined')
			{
				if(typeof socket.user_image !== 'undefined')
				{
					var message_data = {
						message: message,
						uname:socket.u_name,
						timestamp:unix_ts,
						image: socket.user_image
					}
				}
				else
				{
					var message_data = {
						message: message,
						uname:socket.u_name,
						timestamp:unix_ts,
					}
				}
			}
			else
			{
				var message_data = {
					message: message,
					timestamp:unix_ts
				}	
			}
			var query = db.query("INSERT INTO posts (`uname` ,`room` , `message`, `timestamp`, `img`) VALUES ('"+socket.u_name+"','"+socket.room+"','"+escape(message_data.message)+"','"+unix_ts+"','" + socket.user_image + "');", function(err,result){
			});
			io.sockets.in(socket.room).emit('message', message_data);
		}
	});

	socket.on('join_room', function(room){
		socket.room = room;
		socket.join(room);
		var query = db.query("SELECT message, uname, room, timestamp, img FROM posts WHERE room='"+socket.room+"'ORDER BY timestamp DESC LIMIT 50", function(err,info){
			var message_string = '';
			info = info.reverse();
			asyncLoop(info.length,function(loop){
				info[loop.iteration()].message = unescape(info[loop.iteration()].message);
				var commit_match = info[loop.iteration()].message.match(/\.\.\.(.+) Updated/);
				if(commit_match !== null)
				{
					var commitId = commit_match[1];
					var message_data = {
						message: thumb(linkify(info[loop.iteration()].message,commitId)),
						uname: info[loop.iteration()].uname,
						timestamp: info[loop.iteration()].timestamp,
						image: info[loop.iteration()].img
					};
				}
				else
				{
					var message_data = {
						message: thumb(linkify(info[loop.iteration()].message)),
						uname: info[loop.iteration()].uname,
						timestamp: info[loop.iteration()].timestamp,
						image: info[loop.iteration()].img
					};
				}
				if(message_data.message.indexOf('/code ') !== -1)
				{
					var split_message = message_data.message.split('/code ');
					if(split_message[1] !== null)
					{
						var code_txt = split_message[1];
						format_code(code_txt,function(data){
							message_data.message = data;
							if(message_data.uname === socket.u_name)
						      {
						        message_string = message_string + '<div class="bubble-you">'+ '<img class="user-image" src="'+((typeof message_data.image !== 'undefined')? message_data.image : '../assets/default_user.png') + '" height=40 width=40>' + '<div class="user-message">'  + '<b>' + message_data.uname +'</b>: ' +message_data.message+'</div><span class="main-date">'+getDate(message_data.timestamp)+'</span></div>';
						      }
						      else
						      {
						         message_string = message_string + '<div class="bubble">' + '<img class="user-image" src="'+((typeof message_data.image !== 'undefined')? message_data.image : '../assets/default_user.png' )+ '" height=40 width=40>' + '<div class="user-message">' +   '<b>' + message_data.uname +'</b>: '+message_data.message+'</div><span class="main-date">'+getDate(message_data.timestamp)+'</span></div>';
						      }
						      loop.next();
						});
					}
				}
				else
				{
					if(message_data.uname === socket.u_name)
				      {
				        message_string = message_string + '<div class="bubble-you">'+ '<img class="user-image" src="'+((typeof message_data.image !== 'undefined')? message_data.image : '../assets/default_user.png') + '" height=40 width=40>' + '<div class="user-message">'  + '<b>' + message_data.uname +'</b>: ' +message_data.message+'</div><span class="main-date">'+getDate(message_data.timestamp)+'</span></div>';
				      }
				      else
				      {
				         message_string = message_string + '<div class="bubble">' + '<img class="user-image" src="'+((typeof message_data.image !== 'undefined')? message_data.image : '../assets/default_user.png' )+ '" height=40 width=40>' + '<div class="user-message">' +   '<b>' + message_data.uname +'</b>: '+message_data.message+'</div><span class="main-date">'+getDate(message_data.timestamp)+'</span></div>';
				      }
				      loop.next();
				}	
			},function(){
				message_string = message_string + '<div class="bubble">' + '<img class="user-image" src="'+ '../assets/default_user.png' + '" height=40 width=40>' + '<div class="user-message">' + 'You have joined the room ' + room +'</div></div>'
				socket.emit('join_room_message',{info: message_string});
				var rooms = io.sockets.manager.roomClients[socket.id];
			       for(var in_room in rooms) {
			           var temp_room = in_room.replace('/', '');
			           if(temp_room !== room)
			           {
			           	socket.leave(temp_room);
			           }
			       }
			});
		});
	});

	socket.on('set_name',function(name){
		socket.u_name = name;
		socket.emit('set_name',socket.u_name);
	});

	socket.on('login',function(access_token){
		socket.token = access_token;
		var query = db.query("SELECT uname, password, token, email FROM users WHERE token='"+access_token+"'", function(err,info){
			if(err === null)
			{
				var room_query = db.query("SELECT token, rooms FROM rooms WHERE token='"+socket.token+"'", function(room_err,room_info)
				{
					var rooms;
					if(room_info.length !== 0)
					{
						if(typeof room_info[0].rooms !== 'undefined')
						{
							socket.rooms = room_info[0].rooms;
							rooms = room_info[0].rooms.split(',');
						}
						else
						{
							rooms = [];
						}
					}
					else
					{
						rooms = [];
					}
					if(info.length === 0) return;
					socket.u_name = info[0].uname;
					var email_hash = crypto.createHash('md5').update(info[0].email).digest("hex");
					var gravatar = 'http://www.gravatar.com/avatar/' + email_hash;
					socket.emit('login_success',{name: info[0].uname, img: gravatar});
					socket.user_image = gravatar;
					var repo_list = [];
					for(var j = 0;j<rooms.length;j++)
					{
						if(rooms[j] !== '')
						{
							repo_list.push({name:rooms[j],room:rooms[j],owner:''});
						}
					}
					socket.emit('repo_list',repo_list);
				});
			}
		});
	});

	socket.on('get_rooms',function(){
		var query = db.query("SELECT token, rooms FROM rooms WHERE token='"+socket.token+"'", function(err,info){
		});
	});

	socket.on('update_rooms',function(room){
		if(typeof socket.rooms !== 'undefined')
		{
			socket.rooms = socket.rooms + room.message + ',';
		}
		else
		{
			socket.rooms = room.message + ',';
		}
		var query = db.query("REPLACE INTO rooms (`token` ,`rooms`) VALUES ('"+socket.token+"','"+socket.rooms+"');", function(err,result){
			if(typeof socket.repo_list !== 'undefined')
			{
				var repo_list = [];
				var rooms = socket.rooms.split(',');
				for(var j = 0;j<rooms.length;j++)
				{
					if(rooms[j] !== '')
					{
						repo_list.push({name:rooms[j],room:rooms[j],owner:''});
					}
				}
				for(var i = 0;i<socket.repo_list.length;i++)
				{
					repo_list.push({name:socket.repo_list[i].name, room:socket.repo_list[i].room, owner:socket.repo_list[i].owner});
				}
				socket.emit('repo_list',repo_list);
			}
			else
			{
				var repo_list = [];
				var rooms = socket.rooms.split(',');
				for(var j = 0;j<rooms.length;j++)
				{
					if(rooms[j] !== '')
					{
						repo_list.push({name:rooms[j],room:rooms[j],owner:''});
					}
				}
				socket.emit('repo_list',repo_list);
			}
		});
	});

	socket.on('oauth_login',function(access_token){
		socket.token = access_token;
		github.authenticate({
			type: "oauth",
			token: access_token
		});
		github.user.get({}, function(err, resu) {
			if(err !== null && err !== 'null')
			{
				return;
			}
			console.log(socket.token);
			var room_query = db.query("SELECT token, rooms FROM rooms WHERE token='"+socket.token+"'", function(room_err,room_info)
			{
				console.log(room_info);
				var rooms;
				if(typeof room_info != 'undefined' && room_info.length !== 0)
				{
					if(typeof room_info[0].rooms !== 'undefined')
					{
						socket.rooms = room_info[0].rooms;
						rooms = room_info[0].rooms.split(',');
					}
					else
					{
						rooms = [];
					}
				}
				else
				{
					rooms = [];
				}
				socket.u_name = resu.login;
				socket.emit('login_success',{name: resu.login, img: resu.avatar_url});
				socket.user_image = resu.avatar_url;
				socket.emit('set_name',socket.u_name);
				github.repos.getAll({per_page:100}, function(err, res) {
					var repo_list = [];
					for(var j = 0;j<rooms.length;j++)
					{
						if(rooms[j] !== '')
						{
							repo_list.push({name:rooms[j],room:rooms[j],owner:''});
						}
					}
					socket.repo_list = [];
					for(var i = 0;i<res.length;i++)
					{
						socket.repo_list.push({name:res[i].name, room:res[i].full_name, owner:res[i].owner.login});
						repo_list.push({name:res[i].name, room:res[i].full_name, owner:res[i].owner.login});
					}
					socket.emit('repo_list',repo_list);
				});
			});
		});
	});

	socket.on('logout',function(){
		socket.u_name = null;
		socket.room = null;
		socket.room = null;
	});
});

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

function createUser(username,password,email,fn)
{
	var pass_crypt = crypto.createHash('sha256').update(password).digest("hex");
	var user_object = {uname: username, password: pass_crypt, token:guid(), email:email};
	var query = db.query('INSERT INTO users SET ?', user_object, function(err,result){
		if(err === null)
		{
			fn(true);
		}
		else
		{
			fn(err);
		}
	});
}

function loginUser(username,password,fn)
{
	var query = db.query("SELECT uname, password, token, email FROM users WHERE uname='"+username+"'", function(err,info){
		if(err === null && info.length !== 0)
		{
			var pass_key = info[0].password;
			var pass_in = crypto.createHash('sha256').update(password).digest("hex");
			if(pass_key === pass_in)
			{
				//Good to go
				fn(true,info[0].token);
			}
			else
			{
				fn({code:'WRONG_PASSWORD'});
			}
		}
		else if(err !== null)
		{
			fn(err);
		}
		else
		{
			fn({code:'NO_USR_ENTRY'});
		}
	});
}

function s4() {
	return Math.floor((1 + Math.random()) * 0x10000)
	.toString(16)
	.substring(1);
};

function guid() {
	return s4() + s4() + s4() + s4()+
	s4() + s4() + s4() + s4();
}

function mysql_real_escape_string (str) {
	return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, function (char) {
		switch (char) {
			case "\0":
			return "\\0";
			case "\x08":
			return "\\b";
			case "\x09":
			return "\\t";
			case "\x1a":
			return "\\z";
			case "\n":
			return "\\n";
			case "\r":
			return "\\r";
			case "\"":
			case "'":
			case "\\":
			case "%":
                return "\\"+char; 
              }
                              });
}

function format_code(msg,fn){
	markx({
	    input: '```javascript\n'+msg+'```', 
	    template: 'markx/layout.html', 
	    highlight: true, 
	    data: {} 
	  }, function(err, html) {
	  	fn(html);
	});
}

function asyncLoop(iterations, func, callback) {
	var index = 0;
	var done = false;
	var loop = {
		next: function() {
			if (done) {
				return;
			}
			if (index < iterations) {
				index++;
				func(loop);
			} 
			else {
				done = true;
				callback();
			}
		},
		iteration: function() {
			return index - 1;
		},
		break: function() {
			done = true;
			callback();
		}
	};
	loop.next();
	return loop;
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