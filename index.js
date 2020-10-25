const { data } = require('jquery');

var express = require('express');
var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
//include 
var fs = require('fs');
var text = fs.readFileSync('./public/script/new.js') + '';
eval(text);

// path control
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/main.html');
});

app.get('/game.html', (req, res) => {
    res.sendFile(__dirname + '/public/game.html');
});


//util
function getUrlParams(url) {
    var params = {};
    url.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(str, key, value) { params[key] = value; });
    return params;
}



//for game communication
io.on('connection', (socket) => {
    //user_come
    console.log(socket.id + 'user connected');

    //user try to enter game
    socket.on('chat message', (msg) => {
        let data = JSON.parse(msg);
        if(data.name != "" && 0 <= data.val && data.val < 3000) { 

            socket.emit('chat message', "ok");
            
        }
        else socket.emit('chat message', "no");
        console.log(msg);
    });

    //game input
    socket.on('game input', (msg) => {
        let data = JSON.parse(msg);
        console.log(data);
        let r = room[player[socket.id][0]];
        let game = r.game;
        if(game.button_click(player[socket.id][1], data) == MOVED) {
            if(game.turn == 1) game.set_turn(2);
            else game.set_turn(1);
        }
        if(game.state == PLAYER1) {
            io.to(r.p1).emit('chat message', 'p1');
            io.to(r.p2).emit('chat message', 'p1');
        }
        else if(game.state == PLAYER2) {
            io.to(r.p1).emit('chat message', 'p2');
            io.to(r.p2).emit('chat message', 'p2');
        }
        io.to(r.p1).emit('chat message', JSON.stringify(game));
        io.to(r.p2).emit('chat message', JSON.stringify(game));
    });
    
    socket.on('player in', (msg) => {
        let data = getUrlParams(msg);
        let name = data.name, val = data.val;
        let turn = 0;
        console.log(data);
        if(room[val].p1 == null) {
            room[val].p1 = socket.id;
            turn = 1;
        }
        else if(room[val].p2 == null) {
            room[val].p2 = socket.id;
            turn = 2;
        }
        player[socket.id] = [val, turn];
        room[val].game = new GAME();
    });

    //user out
    socket.on('disconnect', () => {
        console.log(socket.id + 'user disconnected');
        player[socket.id] = null;
        try {
            room[player[socket.id][0]] = null;
        }
        catch(e) {
            console.log(e);
        }
    });
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});

//game

function ROOM () {
    var p1 = null;
    var p2 = null;
    var game = null;
}
var room = Array(3000);
var player = {}

for(var i = 0; i < 3000; i++) {
    room[i] = {
        p1 : null,
        p2 : null,
        game : new GAME()
    }
}

const NOTHING = 0;
const PLAYER1 = 1;
const PLAYER2 = 2;

const BOARD = 0;
const HAVING = 1;

const Wang = 0;
const Sang = 1;
const Jang = 2;
const Ja = 3;
const Hu = 4;
const Mu = 5;

const SELECTED = 1;
const MOVED = 2;