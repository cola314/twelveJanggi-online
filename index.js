const { data } = require('jquery');

var express = require('express');
var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
//include 
var fs = require('fs');
const { Console } = require('console');
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

        io.to(r.p1).emit('chat message', JSON.stringify(r));
        io.to(r.p2).emit('chat message', JSON.stringify(r));

        if(game.state == PLAYER1) {
            io.to(r.p1).emit('chat message', 'p1');
            io.to(r.p2).emit('chat message', 'p1');

            game.init_game();
        }
        else if(game.state == PLAYER2) {
            io.to(r.p1).emit('chat message', 'p2');
            io.to(r.p2).emit('chat message', 'p2');

            game.init_game();
        }
    });
    
    socket.on('player in', (msg) => {
        let data = getUrlParams(msg);
        let name = data.name, val = data.val;
        let turn = 0;
        console.log(data);
        if(room[val].p1 == null) {
            room[val].p1 = socket.id;
            room[val].p1_name = name;
            turn = 1;
        }
        else if(room[val].p2 == null) {
            room[val].p2 = socket.id;
            room[val].p2_name = name;
            turn = 2;
        }
        player[socket.id] = [val, turn];
        room[val].game = new GAME();

        let r = room[val];
        
        if(r.p1 && r.p2 && Math.floor(Math.random() * 2) % 2 == 0) {
            [r.p1, r.p2] = [r.p2, r.p1];
            [r.p1_name, r.p2_name] = [r.p2_name, r.p1_name];
            [player[r.p1][1], player[r.p2][1]] = [player[r.p2][1], player[r.p1][1]];
        }


        if(r.p1) io.to(r.p1).emit('chat message', JSON.stringify(r));
        if(r.p2) io.to(r.p2).emit('chat message', JSON.stringify(r));
    });

    //user out
    socket.on('disconnect', () => {
        console.log(socket.id + 'user disconnected');
        let r;

        if(player[socket.id]) {
            r = room[player[socket.id][0]];
            if(r.p1 == socket.id) r.p1 = r.p1_name = null;
            else if(r.p2 == socket.id) r.p2 = r.p2_name = null;
        }
        
        player[socket.id] = null;

        if(r && r.p1) io.to(r.p1).emit('chat message', JSON.stringify(r));
        if(r && r.p2) io.to(r.p2).emit('chat message', JSON.stringify(r)); 
    });
});

http.listen(9200, () => {
  console.log('Server start on 9200');
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
        p1_name : null,
        p2_name : null,
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