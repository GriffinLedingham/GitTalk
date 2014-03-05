
var count = 0;
var windows = [];
var logged_in = false;

var user_name = '';


var Chat_Window = (function(){

	var view = this;
	function Chat_Window(){};
	Chat_Window.prototype.initialize = function(num,owner,room)
	{
		var socket;


		socket = io.connect('http://ec2-50-19-148-178.compute-1.amazonaws.com/',{'force new connection':true});

		if(typeof owner === 'undefined')
		{
			var oauth_token = getCookie('oauth');
			if(oauth_token !== '')
			{
				socket.emit('oauth_login',oauth_token);
			}
			else
			{
				$("#canvas").append('<div class="login-window" style="" id="login_box"><img style="top: 0px;height: 70px;left: 50%;" src="http://imageshack.com/a/img811/4739/t3y0.png"/><input class="login-input" id="username" placeholder="GitHub Username" style="margin-top:0px;"></input><br><input type="password" id="password" class="login-input" placeholder="GitHub Password"></input><br><div class="login-button">LOGIN</div></div>');

				$('#password').keydown(function(e) {
					if(e.which == 13) {
						socket.emit('login',$('#username').val(),$('#password').val());
					}
				});
			}
			socket.on('repo_list',function(repo_list){
				for(var i =0;i<repo_list.length;i++)
				{
					$('#repo_list').append('<div class="bubble-rooms" id="'+repo_list[i].name+'" onclick="new_window(\''+repo_list[i].owner+'\',\''+repo_list[i].name+'\');">'
						+'<img style="position: absolute;top: 8px;left:20px;" src="http://imageshack.com/a/img35/7216/6qd7.png" height=20 width=20/>'

						+'<span style="top: 8px;left: 50px;position: absolute;">'+repo_list[i].name+'</span>'+'</div>');
				}
			});

			socket.on('login_success', function(user){  
				count = 0;
				$('#login_box').css('display','none');
				user_name = user.name;
				logged_in = true;
				$('#logout_img').attr('src',user.img);
				$('#login').css('display','none');
				$('#logout').css('display','block');
			});

			$('#logout').on('click',function(e){
				$('#repo_list').html('');
				var to_delete = [];
				for(var i = 0;i<windows.length;i++)
				{
					if(typeof windows[i] !== 'undefined')
					{
						to_delete.push(i);
					}
				}
				for(var j = 0;j<to_delete.length;j++)
				{
					$('#chat_window_'+to_delete[j]).remove();
				}
				windows = [];
				count = 0;
				$('#login_box').remove();
				logged_in = false;
				$('#logout').css('display','none');
				$('#login').css('display','block');
				socket.emit('logout');
				new_window();
			});
			return;
		}

		socket.emit('set_name',user_name);

		socket.emit('join_room', owner+'/'+room);

		var max_row_windws = Math.floor(($(window).width()-240)/320);

		var x_offset = (((count)%max_row_windws)*320)+20;
		var y_offset = (Math.floor(count/max_row_windws)*50)+70;//(50*Math.floor(((count)*320)/$(window).width()))+70;

		


		$("body").append('\
			<div id="chat_window_'+num+'" class="chat-window" style="top:'+y_offset+'px;left:'+x_offset+'px;">\
				<span id="close_'+num+'" class="close-x">X</span>\
				<div id="find_box_'+num+'" style="cursor:pointer;overflow: scroll;height: 400px;width: 0px;position: absolute;top: 140px;right: -11px;display: block;background: #444444;border: 10px solid rgb(97, 97, 97);border-left: 0px;border-radius: 0px 10px 10px 0px;transition: .35s ease;"></div>\
				<div id="chat_container_'+num+'" class="chat-msg-container">\
					\
				</div>\
				<textarea id="input_box_'+num+'" class="input-box"></textarea>\
				<div id="send_button_'+num+'" class="send-button">SEND</div>\
			</div>'); 
		this.uname = '';


		console.log('activity');
		$('#chat_window_'+num).draggable({ containment: "parent" });
		$('#chat_window_'+num).draggable({ cancel: ".bubble, .bubble-you, .input-box" });

		$('#chat_window_'+num).resizable();

		socket.on('connect', function(){




		});


		socket.on('message', function(message_data){
			var date = new Date(message_data.timestamp * 1000);
			console.log(date);
			var hour = date.getHours();
			var minutes = ("0"+date.getMinutes()).slice(-2);
			var seconds = ("0"+date.getSeconds()).slice(-2);
			if(typeof message_data.uname !== 'undefined')
			{
				if(message_data.uname === user_name)
				{
					$("#chat_container_"+num).append('<div class="bubble-you">'+hour+':'+minutes+':'+seconds+ ' [' + message_data.uname + '] <br>'+message_data.message+'</div>');
				}
				else
				{
					$("#chat_container_"+num).append('<div class="bubble">'+hour+':'+minutes+':'+seconds+ ' [' + message_data.uname + '] <br>'+message_data.message+'</div>');
				}
			}
			else
			{
				$("#chat_container_"+num).append('<div class="bubble">'+hour+':'+minutes+':'+seconds+ ' [' + 'anonymous' + '] <br>'+message_data.message+'</div>');
			}
			$('#chat_container_'+num).scrollTop($('#chat_container_'+num)[0].scrollHeight);

		});

		socket.on('repo_list',function(repo_list){
			for(var i =0;i<repo_list.length;i++)
			{
				$('#repo_list').append('<div class="bubble-rooms" id="'+repo_list[i].name+'" onclick="new_window(\''+repo_list[i].owner+'\',\''+repo_list[i].name+'\');">'+repo_list[i].name+'</div>');
			}
		});

		socket.on('summary_message', function(message_data){

			if($('#find_box_'+num).css('right') === '-11px')
			{
				$('#find_box_'+num).css('right','-191px');
				$('#find_box_'+num).css('width','180px');

			}

			var date = new Date;
			date.setTime(Date.now());
			var hour = date.getHours();
			var minutes = ("0"+date.getMinutes()).slice(-2);
			var seconds = ("0"+date.getSeconds()).slice(-2);
			var summary_data = JSON.parse(message_data);
			$("#find_box_"+num).append('<div class="bubble-find-title">'+'Results of Find'+'</div>');
			var num_offset = 0;
			for(var i = 0;i<summary_data['top_words'].length;i++)
			{
				if(summary_data['top_words'][i]['word'] !== '' && typeof summary_data['top_words'][i]['word'] !== 'undefined')
				{
					$("#find_box_"+num).append('<div class="bubble-find">'+(i+1-num_offset)+'. '+summary_data['top_words'][i]['word']+'</div>');  
				}
				else{
					num_offset += 1;
				}		
			}
			if(summary_data['sentence_1']['score'] !== 0)
			{
				$("#find_box_"+num).append('<div class="bubble-find">'+'(' +summary_data['sentence_1']['score'] + ') ' + summary_data['sentence_1']['word']+'</div>');
			}
			if(summary_data['sentence_2']['score'] !== 0)
			{
				$("#find_box_"+num).append('<div class="bubble-find">'+'(' +summary_data['sentence_2']['score'] + ') ' + summary_data['sentence_2']['word']+'</div>');
			}
			$("#find_box_"+num).append('<div class="bubble-find-title">'+'End of Results'+'</div>');
			$('#find_box_'+num).scrollTop($('#chat_container_'+num)[0].scrollHeight);

		});

		$('#input_box_'+num).keydown(function(e) {
			if(e.which == 13 && !event.altKey) {
				e.preventDefault();
				if($('#input_box_'+num).val() === '')
				{
					return;
				}
				if(this.uname !== '' || ($('#input_box_'+num).val().indexOf('/name') !== -1))
				{
					socket.emit('message', {message:$('#input_box_'+num).val().replace(/(<([^>]+)>)/ig,""),room:num});
					$('#input_box_'+num).val('');
				}
				else
				{
					var date = new Date;
					date.setTime(Date.now());
					var hour = date.getHours();
					var minutes = ("0"+date.getMinutes()).slice(-2);
					var seconds = ("0"+date.getSeconds()).slice(-2);
					$("#chat_container_"+num).append('<div class="bubble">'+hour+':'+minutes+':'+seconds+ ' [Server] <br>'+'Please use \/name to set a user name before posting.'+'</div>');
					$('#input_box_'+num).val('');
				}
			}
		});

		$('.bubble').mouseup(function(e) {
			e.stopPropagation();
			console.log('enable');

			$('#chat_window_'+num).draggable('enable');
		})


		$('.bubble').mousedown(function(e) {
			e.stopPropagation();
			console.log('disable');
			$('#chat_window_'+num).draggable('disable');
		});




		$('#close_'+num).on('click',function(e){
			$('#input_box_'+num).off("keydown",function(){});
			delete_window(num);
			socket = null;
			delete socket;
		});

		$('#send_button_'+num).on('click',function(e){
			if($('#input_box_'+num).val() === '')
			{
				return;
			}
			if(this.uname !== '' || ($('#input_box_'+num).val().indexOf('/name') !== -1))
			{
				socket.emit('message', {msg:$('#input_box_'+num).val().replace(/(<([^>]+)>)/ig,""),room:num});
				$('#input_box_'+num).val('');
			}
			else
			{
				var date = new Date;
				date.setTime(Date.now());
				var hour = date.getHours();
				var minutes = ("0"+date.getMinutes()).slice(-2);
				var seconds = ("0"+date.getSeconds()).slice(-2);
				$("#chat_container_"+num).append('<div class="bubble">'+hour+':'+minutes+':'+seconds+ ' [Server] <br>'+'Please use \/name to set a user name before posting.'+'</div>');
				$('#input_box_'+num).val('');
			}
		});

		$('#chat_window_'+num).on('resize',function(e){
			$('#chat_container_'+num).css('height',(parseInt($('#chat_window_'+num).css('height'), 10)-70) + 'px');
			$('#find_box_'+num).css('height',(parseInt($('#chat_window_'+num).css('height'), 10)-70-272) + 'px');
			$('#chat_container_'+num).css('width',(parseInt($('#chat_window_'+num).css('width'), 10)-20) + 'px');
			$('#input_box_'+num).css('width',(parseInt($('#chat_window_'+num).css('width'), 10)-80) + 'px');

		});

		$('#chat_window_'+num).on('resizestop',function(e){
			$('#chat_container_'+num).scrollTop($('#chat_container_'+num)[0].scrollHeight);
		});

		$('#find_box_'+num).on('click',function(e){
			if($('#find_box_'+num).css('right') === '-11px')
			{
				$('#find_box_'+num).css('right','-191px');
				$('#find_box_'+num).css('width','180px');

			}
			else
			{
				$('#find_box_'+num).css('right','-11px');
				$('#find_box_'+num).css('width','0px');
			}
		});
	};
	return Chat_Window;
})();

function delete_window(count_in)
{
	windows.splice(count_in,1);
	$('#chat_window_'+count_in).remove();
}

function new_window(owner, room)
{
	windows[count] = new Chat_Window();
	windows[count].initialize(count,owner,room);
	count++;
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