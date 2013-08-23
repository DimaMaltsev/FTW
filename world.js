/**
Этот модуль содержит методы для работы сервера с миром:
*/

var fs = require('fs');

function rectWorldToObj(matrix)
{
	var lines = matrix.split(/\|/gm);
	console.log("lines", lines);
	var linesCount = lines.length;
	var rowsCount = lines[0].length;
	var result = {};
	for (var i = 0; i < linesCount; ++ i) {
		for (var j = 0; j < rowsCount; ++ j) {
			if (! lines[i][j]) {
				continue;
			}
			//space means empty
			//number means tile index
			if (' ' !== lines[i][j]) {
				if (! result.hasOwnProperty(j)) {
					result[j] = {};
				}
				result[j][i] = parseInt(lines[i][j]);
			}
		}
	}
	return result;
}

function loadWorld(callback)
{
	fs.readFile('world.json', {}, onWorldFileRead);

	function onWorldFileRead(err, data)
	{
		if (err) throw err;
		var decodedData = JSON.parse(data);
		decodedData.forEach(function(val, index, arr) {
			val.matrix = rectWorldToObj(val.matrix);
		});
		var regions = decodedData;
		callback(regions);
	}
}

loadWorld(function(world) {
	module.exports.world = world;
	console.log(world);
});

function applyChangesToWorld(changes, region)
{
	console.log('applyChangesToWorld');
	//"changes": [{"x": 0, "y": 0}]
	changes.forEach(function(val, index, arr) {
		if (val.hasOwnProperty('val')) {
			console.log('changing 1 tile');
			region.matrix[val.x][val.y] = val.val;
		} else {
			console.log('removing 1 tile');
			delete region.matrix[val.x][val.y];
		}
	});
}

module.exports.onTouchObject = function(data) {
	//data.regionId, data.TOid
	console.log('onTouchObject', data);
	ioSocket = require('./s').ioSocket
	var world = module.exports.world;

	try {
		var region = world[data.regionId];	
	} 
	catch (e) {
		console.error('no region %d in the world', data.regionId);
		process.exit();
	}
	
	try {
		var touchableObject = region.TOS[data.TOid];	
		if (typeof(touchableObject) == 'undefined' || ! touchableObject) {
			throw "FFFFUUUUUUUUU";
		}
	}
	catch (e) {
		// console.error('no touchable object in region %d with ID %d found', data.regionId, data.TOid);
		// process.exit();
		return;
	}

	console.log('touchableObject.pressCount before increment', touchableObject.pressCount);
	++ touchableObject.pressCount;
	if (touchableObject.pressCount == touchableObject.pressLimit) {
		console.log('region before touchable activation: ', region.matrix[0][0]);
		applyChangesToWorld(touchableObject.changes, region);
		console.log('region after touchable activation: ', region.matrix[0][0]);
		ioSocket.sockets.emit(
			'changeMatrix', 
			{
				regionId : data.regionId, 
				changes : touchableObject.changes, 
				TOid : data.TOid
			}
		);
	}
};

module.exports.onConnection = function(socket)
{
	socket.emit(
		'initializeRegions',
		module.exports.world
	);
}