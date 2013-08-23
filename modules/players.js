var world = require('../world.js');

var players = {}

// Получаем имя для пользователя
function getRandomName(){
	names = ["James", "Kassandra", "Bob", "Lili", "Abhram", "Jesus", "Murka", "Chris", "John"]; 
	return names[Math.floor(Math.random()*names.length)];
}

function removeUser(userId) {
	delete players[userId]
}

var avatarIds = [
	'fat',
	'tall'
];

module.exports = {

	init: function(socket)
	{	
		//собираем пользователя
		var player = {}
		players[socket.id] = player;

		player.name = getRandomName(); //ставим имя
		player.id = socket.id;
		player.x = 0;
		player.y = 0;
		player.wx = 0;
		player.wy = 0;
		player.vy = 0;
		player.regionId = 0;
		player.avatar = avatarIds[Math.floor(Math.random() * avatarIds.length)];

		
		player = players[socket.id]
		socket.on('updatePlayer', function(data)
		{	
			player = players[socket.id]
			if(data.x != undefined ) player.x = data.x
			if(data.y != undefined ) player.y = data.y;
			if(data.wx != undefined ) player.wx = data.wx;
			if(data.wy != undefined ) player.wy = data.wy;
			if(data.vy != undefined ) player.vy = data.vy;
			if(data.regionId != undefined ) player.regionId = data.regionId;
			data.id = player.id;
			ioSocket.sockets.emit('userChanged', data);
		});

		world.onConnection(socket);
		socket.on('touchObject', world.onTouchObject);

		ioSocket = require('../s').ioSocket
		ioSocket.sockets.emit('userConnected', player); //всем бродкастим пользователя
		
		socket.on('disconnect', function () {
        	removeUser(this.id);
        	ioSocket.sockets.emit('disconnectedUser', this.id); //оповещение о удаленном пользователе
    	});
		//отдаем всех юзеров новому игроку
		socket.emit('listUsers', players);
	}
}