module.exports.login = {
	init: function(name)
	{	
		//пустое имя
		if(name === undefined)
			name = 'anonimous'

		console.log('user: ' + name);
	}
}