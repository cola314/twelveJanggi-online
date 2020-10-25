var game = new GAME();
var turn = PLAYER1;

var start = false;

var socket = io();
socket.emit('player in', window.location.href);
//input
socket.on('chat message', function(msg){
    console.log(msg);
    if(msg == "p1") {
        alert($('#name1').text() + "플레이어가 이겼습니다.");
        window.location.reload();
        start = false;
    }
    else if(msg == "p2") {
        alert($('#name1').text() + "플레이어가 이겼습니다");
        window.location.reload();
        start = false;
    }
    else {
        let res = JSON.parse(msg);
        console.log(res);
        let tmp = res.game;
        console.log(tmp.turn);
        game.turn = tmp.turn;
        game.state = tmp.state;
        game.player1 = tmp.player1;
        game.player2 = tmp.player2;
        game.board = tmp.board;
        game.selected = tmp.selected;
        console.log(msg);

        //set player name
        turn = res.p1 === socket.id ? PLAYER1 : PLAYER2;

        if(res.p1_name && res.p2_name) start = true;

        $('#name1').text(decodeURI(res.p1_name)); 
        $('#name2').text(decodeURI(res.p2_name)); 
       

        refresh();
    }
});



$('document').ready(function () {
    game.set_turn(turn);
    refresh();
});

function player1(x) {
    socket.emit('game input', JSON.stringify(
        new POS(PLAYER1, x, 0)
    ));
    game.button_click(PLAYER1, new POS(HAVING, x, 0));
    refresh();
}

function player2(x) {
    socket.emit('game input', JSON.stringify(
        new POS(PLAYER2, x, 0)
    ));
    game.button_click(PLAYER2, new POS(HAVING, x, 0));
    refresh();
}

function button_yx(y, x) {
    if(!start) return;

    socket.emit('game input', JSON.stringify(
        new POS(BOARD, y, x)
    ));
    if(game.button_click(turn, new POS(BOARD, y, x)) == MOVED) {
        if(turn == PLAYER1) turn = PLAYER2;
        else if(turn == PLAYER2) turn = PLAYER1;
        game.set_turn(turn);
    }
    refresh();
}

function refresh() {
    let p1 = game.get_having(PLAYER1);
    let p2 = game.get_having(PLAYER2);
    let bd = game.get_board();

    let screen_bd = $('#btn > img');
    let screen_p1 = $('#player1 > #sbtn > img');
    let screen_p2 = $('#player2 > #sbtn > img');

    for (let i = 0; i < 6; i++) {
        screen_p1[i].src = 'images/' + mal_str(p1[i]) + '.png';
        screen_p2[i].src = 'images/' + mal_str(p2[i]) + '.png';
    }
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 3; j++) {
            screen_bd[i * 3 + j].src = 'images/' + mal_str(bd[i][j]) + '.png';
        }
    }

    //TODO turn color
    if(game.turn == PLAYER1) {
        $('#turn1').css('background', 'yellow');
        $('#turn2').css('background', 'white');
    }
    else {
        $('#turn1').css('background', 'white');
        $('#turn2').css('background', 'yellow');
    }
    
    /*
    if(turn == PLAYER1) $('#contents').css('background', 'greenyellow');
    else $('#contents').css('background', 'pink');
    */
}

function mal_str(mal) {
    let ret = "";
    if (mal == null) return "빈칸";
    if (mal.player == NOTHING) {
        if (mal.pos.y == 0) ret = "빨빈";
        else if (mal.pos.y == 3) ret = "초빈";
        else {
            if(mal.highlighted) return "빈칸선";
            return "빈칸";
        }
    }
    else {
        if (mal.player == PLAYER1) ret = "초";
        else if (mal.player == PLAYER2) ret = "빨";

        if (mal.type == Ja) ret += "자";
        else if (mal.type == Jang) ret += "장";
        else if (mal.type == Sang) ret += "상";
        else if (mal.type == Wang) ret += "왕";
        else if (mal.type == Hu) ret += "후";
    }
    if (mal.highlighted) ret += "선";
    else ret += "무";
    return ret;
}