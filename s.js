console.log('s.js');

var worldModule = require('./world.js');

var app = require('http').createServer(handler)
    , io = require('socket.io').listen(app)
    , fs = require('fs')
    , handlers = require('./handlers')
    , players = require('./modules/players');

app.listen(8080);
function handler(req, res) {
    var url = (
        req.url.indexOf('index-test') !== -1 
            ? "/static/index-test.html" 
            : (req.url == "/" ? '/static/index.html' : '/static/' + req.url)
    );
    fs.readFile(__dirname + url,
                function (err, data) {
                    res.writeHead(200);
                    res.end(data);
                });        
}
//modules.login.init();

 io.sockets.on('connection', function (socket) {
         //создание пользователя
         players.init(socket);
     });

module.exports.ioSocket = io;

io.set('log level', 1);

